'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/app/actions/auth';

/**
 * SERVICES Master Catalog
 */

export async function addMasterService(formData: FormData) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Unauthorized' };

    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const basePrice = Number(formData.get('basePrice')) || 0;

    if (!name) return { error: 'Service name is required' };

    try {
        await db.query('INSERT INTO services (name, category, base_price) VALUES ($1, $2, $3)', [name, category || 'General', basePrice]);

        revalidatePath('/dashboard/inventory');
        return { success: true };
    } catch (err) {
        return { error: 'Failed to add service' };
    }
}

export async function updateMasterService(formData: FormData) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Unauthorized' };

    const id = Number(formData.get('id'));
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const basePrice = Number(formData.get('basePrice')) || 0;

    try {
        await db.query('UPDATE services SET name = $1, category = $2, base_price = $3 WHERE id = $4', [name, category, basePrice, id]);

        revalidatePath('/dashboard/inventory');
        return { success: true };
    } catch (err) {
        return { error: 'Failed to update service' };
    }
}

export async function deleteMasterService(id: number) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Unauthorized' };

    try {
        // Check if used in any job
        const usageRes = await db.query('SELECT COUNT(*) as count FROM job_card_services WHERE service_id = $1', [id]);
        const usage = usageRes.rows[0];
        if (Number(usage.count) > 0) {
            return { error: 'Cannot delete: This service is currently used in active/past job cards.' };
        }

        await db.query('DELETE FROM services WHERE id = $1', [id]);
        revalidatePath('/dashboard/inventory');
        return { success: true };
    } catch (err) {
        return { error: 'Failed' };
    }
}

/**
 * PARTS Master Catalog
 */

export async function addMasterPart(formData: FormData) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Unauthorized' };

    const name = formData.get('name') as string;
    const partNo = formData.get('partNo') as string;
    const unitPrice = Number(formData.get('unitPrice')) || 0;
    const stockQuantity = Number(formData.get('stockQuantity')) || 0;
    const brand = formData.get('brand') as string;
    const compatibility = formData.get('compatibility') as string;

    const totalValue = unitPrice * stockQuantity;

    try {
        await db.query(
            'INSERT INTO parts (name, part_no, unit_price, stock_quantity, total_value, brand, compatibility) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [name, partNo || null, unitPrice, stockQuantity, totalValue, brand || null, compatibility || null]
        );

        revalidatePath('/dashboard/inventory');
        return { success: true };
    } catch (err: any) {
        if (err.code === '23505') { // Postgres UNIQUE
            return { error: 'Part Number already exists' };
        }
        return { error: 'Failed to add part' };
    }
}

export async function updateMasterPart(formData: FormData) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Unauthorized' };

    const id = Number(formData.get('id'));
    const name = formData.get('name') as string;
    const partNo = formData.get('partNo') as string;
    const unitPrice = Number(formData.get('unitPrice')) || 0;
    const stockQuantity = Number(formData.get('stockQuantity')) || 0;
    const brand = formData.get('brand') as string;
    const compatibility = formData.get('compatibility') as string;
    const totalValue = unitPrice * stockQuantity;

    try {
        await db.query(
            'UPDATE parts SET name = $1, part_no = $2, unit_price = $3, stock_quantity = $4, total_value = $5, brand = $6, compatibility = $7 WHERE id = $8',
            [name, partNo, unitPrice, stockQuantity, totalValue, brand, compatibility, id]
        );

        revalidatePath('/dashboard/inventory');
        return { success: true };
    } catch (err) {
        return { error: 'Failed to update part' };
    }
}

export async function deleteMasterPart(id: number) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Unauthorized' };

    try {
        // Check if used in any job
        const usageRes = await db.query('SELECT COUNT(*) as count FROM job_card_parts WHERE part_id = $1', [id]);
        const usage = usageRes.rows[0];
        if (Number(usage.count) > 0) {
            return { error: 'Cannot delete: This part is currently used in active/past job cards.' };
        }

        await db.query('DELETE FROM parts WHERE id = $1', [id]);
        revalidatePath('/dashboard/inventory');
        return { success: true };
    } catch (err) {
        return { error: 'Failed' };
    }
}

/**
 * CAR LIBRARY (Brand -> Models)
 */

export async function getCarLibrary() {
    try {
        const res = await db.query(`
            SELECT m.id, b.name as brand, m.name as model 
            FROM vehicle_models m 
            JOIN vehicle_brands b ON m.brand_id = b.id 
            ORDER BY b.name, m.name
        `);
        return res.rows;
    } catch (err) {
        console.error('Error fetching car library:', err);
        return [];
    }
}

export async function getVehicleBrands() {
    try {
        const res = await db.query('SELECT * FROM vehicle_brands ORDER BY name');
        return res.rows;
    } catch (err) {
        console.error('Error fetching vehicle brands:', err);
        return [];
    }
}

export async function addCarLibraryItem(formData: FormData) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Unauthorized' };

    const brandName = (formData.get('brand') as string)?.trim();
    const modelName = (formData.get('model') as string)?.trim();

    if (!brandName || !modelName) return { error: 'Brand and Model are required' };

    try {
        // Upsert brand
        const brandRes = await db.query(
            "INSERT INTO vehicle_brands (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id",
            [brandName]
        );
        const brandId = brandRes.rows[0].id;

        // Split models by comma, trim, and filter out empty strings
        const models = modelName.split(',').map(m => m.trim()).filter(m => m.length > 0);

        // Insert distinct models
        for (const name of models) {
            await db.query(
                'INSERT INTO vehicle_models (brand_id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                [brandId, name]
            );
        }

        revalidatePath('/dashboard/inventory');
        return { success: true };
    } catch (err: any) {
        return { error: 'Failed to add item to library' };
    }
}

export async function updateCarLibraryItem(formData: FormData) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Unauthorized' };

    const id = Number(formData.get('id')); // model id
    const brandName = (formData.get('brand') as string)?.trim();
    const modelName = (formData.get('model') as string)?.trim();

    if (!brandName || !modelName) return { error: 'Brand and Model are required' };

    try {
        // Upsert brand
        const brandRes = await db.query(
            "INSERT INTO vehicle_brands (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id",
            [brandName]
        );
        const brandId = brandRes.rows[0].id;

        await db.query(
            'UPDATE vehicle_models SET brand_id = $1, name = $2 WHERE id = $3',
            [brandId, modelName, id]
        );

        revalidatePath('/dashboard/inventory');
        return { success: true };
    } catch (err) {
        return { error: 'Failed to update library item' };
    }
}

export async function deleteCarLibraryItem(id: number) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Unauthorized' };

    try {
        await db.query('DELETE FROM vehicle_models WHERE id = $1', [id]);
        revalidatePath('/dashboard/inventory');
        return { success: true };
    } catch (err) {
        return { error: 'Failed to delete' };
    }
}

/**
 * PART LIBRARY (Master definitions)
 */

export async function getPartLibrary() {
    try {
        const res = await db.query('SELECT * FROM part_library ORDER BY name');
        return res.rows;
    } catch (err) {
        console.error('Error fetching part library:', err);
        return [];
    }
}

export async function addPartLibraryItem(formData: FormData) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Unauthorized' };

    const name = formData.get('name') as string;
    const partNo = formData.get('partNo') as string;
    const brand = formData.get('brand') as string;
    const compatibility = formData.get('compatibility') as string;
    const unitPrice = Number(formData.get('unitPrice')) || 0;

    if (!name) return { error: 'Part name is required' };

    try {
        await db.query(
            'INSERT INTO part_library (name, part_no, brand, compatibility, unit_price) VALUES ($1, $2, $3, $4, $5)',
            [name, partNo || null, brand || null, compatibility || null, unitPrice]
        );
        revalidatePath('/dashboard/inventory');
        return { success: true };
    } catch (err: any) {
        if (err.code === '23505') return { error: 'Part Number already exists in Library' };
        return { error: 'Failed to add to library' };
    }
}

export async function updatePartLibraryItem(formData: FormData) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Unauthorized' };

    const id = Number(formData.get('id'));
    const name = formData.get('name') as string;
    const partNo = formData.get('partNo') as string;
    const brand = formData.get('brand') as string;
    const compatibility = formData.get('compatibility') as string;
    const unitPrice = Number(formData.get('unitPrice')) || 0;

    try {
        await db.query(
            'UPDATE part_library SET name = $1, part_no = $2, brand = $3, compatibility = $4, unit_price = $5 WHERE id = $6',
            [name, partNo, brand, compatibility, unitPrice, id]
        );
        revalidatePath('/dashboard/inventory');
        return { success: true };
    } catch (err) {
        return { error: 'Failed to update library item' };
    }
}

export async function deletePartLibraryItem(id: number) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Unauthorized' };

    try {
        await db.query('DELETE FROM part_library WHERE id = $1', [id]);
        revalidatePath('/dashboard/inventory');
        return { success: true };
    } catch (err) {
        return { error: 'Failed to delete' };
    }
}

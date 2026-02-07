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
        db.prepare('INSERT INTO services (name, category, base_price) VALUES (?, ?, ?)')
            .run(name, category || 'General', basePrice);

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
        db.prepare('UPDATE services SET name = ?, category = ?, base_price = ? WHERE id = ?')
            .run(name, category, basePrice, id);

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
        const usage = db.prepare('SELECT COUNT(*) as count FROM job_card_services WHERE service_id = ?').get(id) as { count: number };
        if (usage.count > 0) {
            return { error: 'Cannot delete: This service is currently used in active/past job cards.' };
        }

        db.prepare('DELETE FROM services WHERE id = ?').run(id);
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
        db.prepare('INSERT INTO parts (name, part_no, unit_price, stock_quantity, total_value, brand, compatibility) VALUES (?, ?, ?, ?, ?, ?, ?)')
            .run(name, partNo || null, unitPrice, stockQuantity, totalValue, brand || null, compatibility || null);

        revalidatePath('/dashboard/inventory');
        return { success: true };
    } catch (err) {
        if (err instanceof Error && err.message.includes('UNIQUE')) {
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
        db.prepare('UPDATE parts SET name = ?, part_no = ?, unit_price = ?, stock_quantity = ?, total_value = ?, brand = ?, compatibility = ? WHERE id = ?')
            .run(name, partNo, unitPrice, stockQuantity, totalValue, brand, compatibility, id);

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
        const usage = db.prepare('SELECT COUNT(*) as count FROM job_card_parts WHERE part_id = ?').get(id) as { count: number };
        if (usage.count > 0) {
            return { error: 'Cannot delete: This part is currently used in active/past job cards.' };
        }

        db.prepare('DELETE FROM parts WHERE id = ?').run(id);
        revalidatePath('/dashboard/inventory');
        return { success: true };
    } catch (err) {
        return { error: 'Failed' };
    }
}

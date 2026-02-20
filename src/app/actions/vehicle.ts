'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notification';

export async function createVehicle(formData: FormData) {
    const vehicleNumber = (formData.get('vehicleNumber') as string)?.toUpperCase();
    const model = formData.get('model') as string;
    const vin = (formData.get('vin') as string)?.trim()?.toUpperCase() || null;
    const customerId = formData.get('customerId');

    if (!vehicleNumber || !model || !customerId) {
        return { error: 'Vehicle number and model are required' };
    }

    try {
        const res = await db.query(`
            INSERT INTO vehicles (vehicle_number, model, customer_id, vin)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `, [vehicleNumber, model, customerId, vin]);

        const newVehicleId = res.rows[0].id;

        revalidatePath(`/dashboard/customers/${customerId}`);
        await createNotification(`New Vehicle Added: ${model} (${vehicleNumber})${vin ? ` [VIN: ${vin}]` : ''}`, 'VEHICLE', newVehicleId);
        return { success: true };
    } catch (error: any) {
        if (error.code === '23505') {
            if (error.detail?.includes('vin')) return { error: 'VIN number already exists' };
            return { error: 'Vehicle number already exists' };
        }
        return { error: 'Failed to add vehicle' };
    }
}

export async function deleteVehicle(vehicleId: number, customerId: number) {
    try {
        // Will cascade delete jobs? Yes, schema says ON DELETE CASCADE for jobs.
        await db.query('DELETE FROM vehicles WHERE id = $1', [vehicleId]);
        revalidatePath(`/dashboard/customers/${customerId}`);
        return { success: true };
    } catch (err: any) {
        return { error: 'Failed to delete vehicle' };
    }
}

export async function getCustomerDetails(id: string) {
    const customerRes = await db.query('SELECT * FROM customers WHERE id = $1', [id]);
    const customer = customerRes.rows[0];
    if (!customer) return null;

    const vehiclesRes = await db.query('SELECT * FROM vehicles WHERE customer_id = $1 ORDER BY created_at DESC', [id]);

    // Fetch recent jobs for all vehicles of this customer
    const jobsRes = await db.query(`
        SELECT j.*, v.model, v.vehicle_number
        FROM job_cards j
        JOIN vehicles v ON j.vehicle_id = v.id
        WHERE v.customer_id = $1
        ORDER BY j.created_at DESC
        LIMIT 10
    `, [id]);

    // Fetch car library for registration dropdowns
    const libraryRes = await db.query(`
        SELECT m.name as model, b.name as brand 
        FROM vehicle_models m 
        JOIN vehicle_brands b ON m.brand_id = b.id 
        ORDER BY b.name, m.name
    `);

    return { customer, vehicles: vehiclesRes.rows, jobs: jobsRes.rows, carLibrary: libraryRes.rows };
}

'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createVehicle(formData: FormData) {
    const vehicleNumber = formData.get('vehicleNumber') as string;
    const model = formData.get('model') as string;
    const customerId = formData.get('customerId');

    if (!vehicleNumber || !model || !customerId) {
        return { error: 'All fields are required' };
    }

    try {
        await db.query(`
            INSERT INTO vehicles (vehicle_number, model, customer_id)
            VALUES ($1, $2, $3)
        `, [vehicleNumber, model, customerId]);

        revalidatePath(`/dashboard/customers/${customerId}`);
        return { success: true };
    } catch (error: any) {
        if (error.code === '23505') { // Postgres UNIQUE constraint
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

    return { customer, vehicles: vehiclesRes.rows, jobs: jobsRes.rows };
}

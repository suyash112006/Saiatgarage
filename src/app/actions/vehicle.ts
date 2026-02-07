'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function addVehicle(formData: FormData) {
    const customerId = formData.get('customerId') as string;
    const model = formData.get('model') as string;
    const rawVehicleNumber = formData.get('vehicleNumber') as string;
    const lastKm = formData.get('lastKm');

    if (!rawVehicleNumber || !model || !customerId) {
        return { error: 'Please fill all required fields' };
    }

    // Strict formatting: Uppercase and remove spaces for uniqueness check
    const vehicleNumber = rawVehicleNumber.trim().toUpperCase().replace(/\s+/g, '');

    try {
        // Explicit check for duplicate
        const exists = db.prepare("SELECT id FROM vehicles WHERE REPLACE(vehicle_number, ' ', '') = ?").get(vehicleNumber);
        if (exists) {
            return { error: `Vehicle ${rawVehicleNumber.toUpperCase()} is already registered in the system.` };
        }

        const stmt = db.prepare('INSERT INTO vehicles (customer_id, model, vehicle_number, last_km) VALUES (?, ?, ?, ?)');
        const result = stmt.run(customerId, model, rawVehicleNumber.trim().toUpperCase(), Number(lastKm) || 0);

        console.log('✅ Vehicle added successfully:', result);

        revalidatePath(`/dashboard/customers/${customerId}`);
        return { success: true };
    } catch (err: any) {
        console.error('❌ Vehicle creation error:', {
            error: err.message,
            code: err.code,
            customerId,
            model,
            vehicleNumber: rawVehicleNumber,
            lastKm
        });

        // Return more specific error messages
        if (err.message?.includes('UNIQUE constraint')) {
            return { error: `Vehicle ${rawVehicleNumber.toUpperCase()} is already registered.` };
        }
        if (err.message?.includes('FOREIGN KEY constraint')) {
            return { error: 'Invalid customer ID. Please refresh and try again.' };
        }

        return { error: `Failed to add vehicle: ${err.message}` };
    }
}

export async function deleteVehicle(vehicleId: number, customerId: number) {
    try {
        // Will cascade delete jobs? Yes, schema says ON DELETE CASCADE for jobs.
        db.prepare('DELETE FROM vehicles WHERE id = ?').run(vehicleId);
        revalidatePath(`/dashboard/customers/${customerId}`);
        return { success: true };
    } catch (err: any) {
        return { error: 'Failed to delete vehicle' };
    }
}

export async function getCustomerDetails(id: string) {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!customer) return null;

    const vehicles = db.prepare('SELECT * FROM vehicles WHERE customer_id = ? ORDER BY created_at DESC').all(id);

    // Fetch recent jobs for all vehicles of this customer
    const jobs = db.prepare(`
        SELECT j.*, v.model, v.vehicle_number
        FROM job_cards j
        JOIN vehicles v ON j.vehicle_id = v.id
        WHERE v.customer_id = ?
        ORDER BY j.created_at DESC
        LIMIT 10
    `).all(id);

    return { customer, vehicles, jobs };
}

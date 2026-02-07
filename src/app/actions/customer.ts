'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Phase 1: Strict Customer Management

export async function getCustomers() {
    const res = await db.query('SELECT * FROM customers ORDER BY created_at DESC');
    return res.rows;
}

export async function createCustomer(formData: FormData) {
    const name = formData.get('name') as string;
    const mobile = formData.get('mobile') as string;
    const address = formData.get('address') as string;

    if (!name || !mobile) {
        return { error: 'Name and Mobile are required' };
    }

    try {
        const res = await db.query(`
            INSERT INTO customers (name, mobile, address)
            VALUES ($1, $2, $3)
            RETURNING id
        `, [name, mobile, address]);

        revalidatePath('/dashboard/customers');
        return { success: true, customerId: res.rows[0].id };
    } catch (error: any) {
        if (error.code === '23505') { // Postgres unique violation code
            return { error: 'Customer with this mobile already exists' };
        }
        return { error: 'Failed to create customer' };
    }
}

export async function updateCustomer(customer: any) {
    const { id, name, mobile, address } = customer;

    if (!name || !mobile) {
        return { error: 'Name and Mobile are required' };
    }

    try {
        await db.query('UPDATE customers SET name = $1, mobile = $2, address = $3 WHERE id = $4', [name, mobile, address || '', id]);
        revalidatePath('/dashboard/customers');
        return { success: true };
    } catch (err: any) {
        if (err.code === '23505') { // Postgres unique violation code
            return { error: 'Mobile number already exists' };
        }
        return { error: 'Failed to update customer' };
    }
}

export async function deleteCustomer(id: number) {
    // Phase 1: Clean Delete
    try {
        // We rely on ON DELETE CASCADE in schema for vehicles/jobs usually, 
        // but schema.sql says:
        // Vehicles -> FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
        // JobCards -> FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
        // So deleting customer SHOULD cascade delete vehicles, which cascades delete job cards.
        // Let's verify schema.sql from Step 952.
        // Yes: FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE.
        // And JobCards: FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE.
        // So a simple delete is sufficient and clean.

        await db.query('DELETE FROM customers WHERE id = $1', [id]);
        revalidatePath('/dashboard/customers');
        return { success: true };
    } catch (err: any) {
        console.error(err);
        return { error: 'Failed to delete customer' };
    }
}

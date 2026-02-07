'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Phase 1: Strict Customer Management

export async function getCustomers() {
    return db.prepare(`
        SELECT * FROM customers ORDER BY created_at DESC
    `).all();
}

export async function createCustomer(formData: FormData) {
    const name = formData.get('name') as string;
    const mobile = formData.get('mobile') as string;
    const address = formData.get('address') as string;

    if (!name || !mobile) {
        return { error: 'Name and Mobile are required' };
    }

    try {
        // Check if exists
        const existing = db.prepare('SELECT id FROM customers WHERE mobile = ?').get(mobile) as { id: number };
        if (existing) {
            return { error: 'Customer with this mobile already exists', customerId: existing.id };
        }

        const stmt = db.prepare('INSERT INTO customers (name, mobile, address) VALUES (?, ?, ?)');
        const info = stmt.run(name, mobile, address || '');
        const customerId = info.lastInsertRowid;

        revalidatePath('/dashboard/customers');
        return { success: true, customerId };
    } catch (err: any) {
        console.error(err);
        return { error: 'Failed to create customer profile' };
    }
}

export async function updateCustomer(customer: any) {
    const { id, name, mobile, address } = customer;

    if (!name || !mobile) {
        return { error: 'Name and Mobile are required' };
    }

    try {
        const stmt = db.prepare('UPDATE customers SET name = ?, mobile = ?, address = ? WHERE id = ?');
        stmt.run(name, mobile, address || '', id);
        revalidatePath('/dashboard/customers');
        return { success: true };
    } catch (err: any) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
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

        db.prepare('DELETE FROM customers WHERE id = ?').run(id);
        revalidatePath('/dashboard/customers');
        return { success: true };
    } catch (err: any) {
        console.error(err);
        return { error: 'Failed to delete customer' };
    }
}

'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notification';

// Phase 1: Strict Customer Management

export async function getCustomers() {
    const res = await db.query('SELECT * FROM customers WHERE deleted_at IS NULL ORDER BY id DESC');
    return res.rows;
}

export async function createCustomer(formData: FormData) {
    const name = formData.get('name') as string;
    const mobile = formData.get('mobile') as string;
    const address = formData.get('address') as string;

    if (!name) {
        return { error: 'Name is required' };
    }

    const dbMobile = mobile?.trim() || null;

    try {
        const res = await db.query(`
            INSERT INTO customers (name, mobile, address)
            VALUES ($1, $2, $3)
            RETURNING id
        `, [name, dbMobile, address]);

        revalidatePath('/dashboard/customers');
        await createNotification(`New Customer Added: ${name}`, 'CUSTOMER', res.rows[0].id);
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

    if (!name) {
        return { error: 'Name is required' };
    }

    const dbMobile = mobile?.trim() || null;

    try {
        await db.query('UPDATE customers SET name = $1, mobile = $2, address = $3 WHERE id = $4', [name, dbMobile, address || '', id]);
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
    // Soft delete: move to Trash (auto-purged after 30 days)
    try {
        await db.query('UPDATE customers SET deleted_at = NOW() WHERE id = $1', [id]);
        revalidatePath('/dashboard/customers');
        revalidatePath('/dashboard/trash');
        return { success: true };
    } catch (err: any) {
        console.error(err);
        return { error: 'Failed to delete customer' };
    }
}

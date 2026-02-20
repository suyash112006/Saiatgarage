'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getSession } from './auth';

// ── Fetch all trashed items ──────────────────────────────────────────────────
export async function getTrashedItems() {
    const session = await getSession();
    if (session?.role !== 'admin') return { customers: [], jobs: [] };

    // Auto-purge items older than 30 days first
    await autoPurge();

    const customersRes = await db.query(`
        SELECT id, name, mobile, address, deleted_at
        FROM customers
        WHERE deleted_at IS NOT NULL
        ORDER BY deleted_at DESC
    `);

    const jobsRes = await db.query(`
        SELECT j.id, j.job_no, j.status, j.deleted_at,
               c.name as customer_name,
               v.model, v.vehicle_number
        FROM job_cards j
        LEFT JOIN customers c ON j.customer_id = c.id
        LEFT JOIN vehicles v ON j.vehicle_id = v.id
        WHERE j.deleted_at IS NOT NULL
        ORDER BY j.deleted_at DESC
    `);

    return {
        customers: customersRes.rows,
        jobs: jobsRes.rows,
    };
}

// ── Restore a customer ───────────────────────────────────────────────────────
export async function restoreCustomer(id: number) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Unauthorized' };

    try {
        await db.query('UPDATE customers SET deleted_at = NULL WHERE id = $1', [id]);
        revalidatePath('/dashboard/customers');
        revalidatePath('/dashboard/trash');
        return { success: true };
    } catch {
        return { error: 'Failed to restore customer' };
    }
}

// ── Restore a job card ───────────────────────────────────────────────────────
export async function restoreJob(id: number) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Unauthorized' };

    try {
        await db.query('UPDATE job_cards SET deleted_at = NULL WHERE id = $1', [id]);
        revalidatePath('/dashboard/jobs');
        revalidatePath('/dashboard/trash');
        return { success: true };
    } catch {
        return { error: 'Failed to restore job' };
    }
}

// ── Permanently delete a customer ────────────────────────────────────────────
export async function permanentlyDeleteCustomer(id: number) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Unauthorized' };

    try {
        await db.query('DELETE FROM customers WHERE id = $1 AND deleted_at IS NOT NULL', [id]);
        revalidatePath('/dashboard/trash');
        return { success: true };
    } catch {
        return { error: 'Failed to permanently delete customer' };
    }
}

// ── Permanently delete a job card ────────────────────────────────────────────
export async function permanentlyDeleteJob(id: number) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Unauthorized' };

    try {
        await db.query('DELETE FROM job_cards WHERE id = $1 AND deleted_at IS NOT NULL', [id]);
        revalidatePath('/dashboard/trash');
        return { success: true };
    } catch {
        return { error: 'Failed to permanently delete job' };
    }
}

// ── Empty entire trash ────────────────────────────────────────────────────────
export async function emptyTrash() {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Unauthorized' };

    try {
        await db.query('DELETE FROM customers WHERE deleted_at IS NOT NULL');
        await db.query('DELETE FROM job_cards WHERE deleted_at IS NOT NULL');
        revalidatePath('/dashboard/trash');
        return { success: true };
    } catch {
        return { error: 'Failed to empty trash' };
    }
}

// ── Auto-purge items older than 30 days (called automatically) ───────────────
async function autoPurge() {
    try {
        await db.query(`
            DELETE FROM customers
            WHERE deleted_at IS NOT NULL
              AND deleted_at < NOW() - INTERVAL '30 days'
        `);
        await db.query(`
            DELETE FROM job_cards
            WHERE deleted_at IS NOT NULL
              AND deleted_at < NOW() - INTERVAL '30 days'
        `);
    } catch (err) {
        console.error('Auto-purge error:', err);
    }
}

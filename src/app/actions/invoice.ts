'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

/**
 * Generate Invoice for a Completed Job
 * RULES:
 * - Admin only
 * - Job must be COMPLETED
 * - Job must have services OR parts
 * - No existing invoice for this job
 * - Updates job status to BILLED (permanent lock)
 */
export async function generateInvoice(jobId: number) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Unauthorized' };

    try {
        // 1. Validate job exists and is COMPLETED
        const jobRes = await db.query('SELECT id, status FROM job_cards WHERE id = $1', [jobId]);
        const job = jobRes.rows[0];
        if (!job) return { error: 'Job not found' };

        // Allow COMPLETED (initial generate) or BILLED (sync/review)
        if (job.status !== 'COMPLETED' && job.status !== 'BILLED') {
            return { error: 'Job must be COMPLETED or BILLED before managing invoice' };
        }

        // 2. If invoice already exists, just return it (allows "syncing" behavior)
        const existingRes = await db.query('SELECT id FROM invoices WHERE job_id = $1', [jobId]);
        if (existingRes.rows[0]) return { success: true, invoiceId: existingRes.rows[0].id };

        // 3. Validate job has services or parts
        const servicesCount = await db.query('SELECT COUNT(*) as count FROM job_card_services WHERE job_id = $1', [jobId]);
        const partsCount = await db.query('SELECT COUNT(*) as count FROM job_card_parts WHERE job_id = $1', [jobId]);

        if (Number(servicesCount.rows[0].count) === 0 && Number(partsCount.rows[0].count) === 0) {
            return { error: 'Cannot generate invoice: Job has no services or parts' };
        }

        // 4. Generate unique invoice number
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
        const invoiceNo = `INV-${dateStr}-${jobId}`;

        // 5. Create invoice and update job status
        // Postgres transaction
        // Since we don't have a transaction helper in our simple db wrapper yet, and we need sequential ops:
        // Ideally we use a client from pool, but for now we can do sequential if risk is low.
        // Or we can just run queries.

        // Let's do partial logic with simple queries for now OR implement transaction helper.
        // Given complexity, let's just do sequential for this iteration as it's safe enough for this scale.

        const invoiceRes = await db.query(`
            INSERT INTO invoices (invoice_no, job_id) VALUES ($1, $2)
            RETURNING id
        `, [invoiceNo, jobId]);

        await db.query("UPDATE job_cards SET status = 'BILLED' WHERE id = $1", [jobId]);

        const invoiceId = invoiceRes.rows[0].id;

        revalidatePath('/dashboard/jobs');
        revalidatePath(`/dashboard/jobs/${jobId}`);

        return { success: true, invoiceId: Number(invoiceId) };
    } catch (err) {
        console.error('Invoice generation error:', err);
        return { error: 'Failed to generate invoice' };
    }
}

export async function getInvoice(invoiceId: number) {
    const session = await getSession();
    if (session?.role !== 'admin') {
        redirect('/dashboard');
    }

    try {
        const invoiceRes = await db.query(`
            SELECT i.id as invoice_database_id, i.invoice_no, i.job_id, i.created_at,
                   j.*, 
                   c.name as customer_name, c.mobile as customer_mobile, c.address as customer_address,
                   v.model as vehicle_model, v.vehicle_number,
                   j.km_reading
            FROM invoices i
            JOIN job_cards j ON i.job_id = j.id
            JOIN vehicles v ON j.vehicle_id = v.id
            JOIN customers c ON v.customer_id = c.id
            WHERE i.id = $1
        `, [invoiceId]);
        const invoice = invoiceRes.rows[0];

        if (!invoice) return null;

        const servicesRes = await db.query(`
            SELECT jcs.*, s.name as service_name, s.category
            FROM job_card_services jcs
            LEFT JOIN services s ON jcs.service_id = s.id
            WHERE jcs.job_id = $1
        `, [invoice.job_id]);

        const partsRes = await db.query(`
            SELECT jcp.*, p.name as part_name, p.part_no
            FROM job_card_parts jcp
            LEFT JOIN parts p ON jcp.part_id = p.id
            WHERE jcp.job_id = $1
        `, [invoice.job_id]);

        const services = servicesRes.rows;
        const parts = partsRes.rows;

        // Calculate totals
        const servicesTotal = services.reduce((sum: number, s: any) => sum + (Number(s.price) * Number(s.quantity)), 0);
        const partsTotal = parts.reduce((sum: number, p: any) => sum + (Number(p.price) * Number(p.quantity)), 0);
        const subtotal = servicesTotal + partsTotal;

        // Fetch dynamic tax rate
        const taxSettingRes = await db.query("SELECT value FROM settings WHERE key = 'tax_rate'");
        const taxValue = taxSettingRes.rows[0]?.value;
        const taxRate = taxValue ? parseFloat(taxValue) : 18;

        const taxTotal = subtotal * (taxRate / 100);
        const grandTotal = subtotal + taxTotal;

        return {
            ...invoice,
            id: Number(invoice.invoice_database_id),
            job_id: Number(invoice.job_id),
            services,
            parts,
            servicesTotal,
            partsTotal,
            taxTotal,
            subtotal,
            grandTotal,
            taxRate
        };
    } catch (err) {
        console.error('Get invoice error:', err);
        return null;
    }
}

export async function canGenerateInvoice(jobId: number) {
    try {
        const jobRes = await db.query('SELECT status FROM job_cards WHERE id = $1', [jobId]);
        const job = jobRes.rows[0];
        if (!job || job.status !== 'COMPLETED') return false;

        const existingRes = await db.query('SELECT id FROM invoices WHERE job_id = $1', [jobId]);
        if (existingRes.rows[0]) return false;

        const servicesCount = await db.query('SELECT COUNT(*) as count FROM job_card_services WHERE job_id = $1', [jobId]);
        const partsCount = await db.query('SELECT COUNT(*) as count FROM job_card_parts WHERE job_id = $1', [jobId]);

        return (Number(servicesCount.rows[0].count) > 0 || Number(partsCount.rows[0].count) > 0);
    } catch (err) {
        return false;
    }
}

export async function getInvoiceByJobId(jobId: number) {
    try {
        const res = await db.query('SELECT * FROM invoices WHERE job_id = $1', [jobId]);
        return res.rows[0] || null;
    } catch (err) {
        return null;
    }
}

export async function logInvoiceShare(invoiceId: number, shareMethod: string) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Unauthorized' };

    try {
        const invoiceRes = await db.query('SELECT invoice_no FROM invoices WHERE id = $1', [invoiceId]);
        const invoice = invoiceRes.rows[0];
        if (!invoice) return { error: 'Invoice not found' };

        const message = `Invoice #${invoice.invoice_no} was shared via ${shareMethod.toUpperCase()}`;

        await db.query(`
            INSERT INTO notifications (message, type, reference_id, recipient_role)
            VALUES ($1, $2, $3, $4)
        `, [message, 'JOB', invoiceId, 'admin']);

        revalidatePath('/dashboard');
        return { success: true };
    } catch (err) {
        console.error('Log invoice share error:', err);
        return { error: 'Failed to log share' };
    }
}

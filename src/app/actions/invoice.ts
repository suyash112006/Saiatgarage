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
        const job = db.prepare('SELECT id, status FROM job_cards WHERE id = ?').get(jobId) as any;
        if (!job) return { error: 'Job not found' };

        // Allow COMPLETED (initial generate) or BILLED (sync/review)
        if (job.status !== 'COMPLETED' && job.status !== 'BILLED') {
            return { error: 'Job must be COMPLETED or BILLED before managing invoice' };
        }

        // 2. If invoice already exists, just return it (allows "syncing" behavior)
        const existingInvoice = db.prepare('SELECT id FROM invoices WHERE job_id = ?').get(jobId) as any;
        if (existingInvoice) return { success: true, invoiceId: existingInvoice.id };

        // 3. Validate job has services or parts
        const servicesCount = db.prepare('SELECT COUNT(*) as count FROM job_card_services WHERE job_id = ?').get(jobId) as { count: number };
        const partsCount = db.prepare('SELECT COUNT(*) as count FROM job_card_parts WHERE job_id = ?').get(jobId) as { count: number };

        if (servicesCount.count === 0 && partsCount.count === 0) {
            return { error: 'Cannot generate invoice: Job has no services or parts' };
        }

        // 4. Generate unique invoice number
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
        const invoiceNo = `INV-${dateStr}-${jobId}`;

        // 5. Create invoice and update job status in transaction
        const transaction = db.transaction(() => {
            const invoiceStmt = db.prepare('INSERT INTO invoices (invoice_no, job_id) VALUES (?, ?)');
            const invoiceInfo = invoiceStmt.run(invoiceNo, jobId);

            db.prepare('UPDATE job_cards SET status = ? WHERE id = ?').run('BILLED', jobId);

            return invoiceInfo.lastInsertRowid;
        });

        const invoiceId = transaction();

        revalidatePath('/dashboard/jobs');
        revalidatePath(`/dashboard/jobs/${jobId}`);

        return { success: true, invoiceId: Number(invoiceId) };
    } catch (err) {
        console.error('Invoice generation error:', err);
        return { error: 'Failed to generate invoice' };
    }
}

/**
 * Get Invoice with Full Details
 * Fetches invoice, job, customer, vehicle, services, and parts
 */
export async function getInvoice(invoiceId: number) {
    const session = await getSession();
    if (session?.role !== 'admin') {
        redirect('/dashboard');
    }

    try {
        // Fetch invoice
        const invoice = db.prepare(`
            SELECT i.*, j.*, 
                   c.name as customer_name, c.mobile as customer_mobile, c.address as customer_address,
                   v.model as vehicle_model, v.vehicle_number,
                   j.km_reading
            FROM invoices i
            JOIN job_cards j ON i.job_id = j.id
            JOIN vehicles v ON j.vehicle_id = v.id
            JOIN customers c ON v.customer_id = c.id
            WHERE i.id = ?
        `).get(invoiceId) as any;

        if (!invoice) return null;

        // Fetch services
        const services = db.prepare(`
            SELECT jcs.*, s.name as service_name, s.category
            FROM job_card_services jcs
            LEFT JOIN services s ON jcs.service_id = s.id
            WHERE jcs.job_id = ?
        `).all(invoice.job_id) as any[];

        // Fetch parts
        const parts = db.prepare(`
            SELECT jcp.*, p.name as part_name, p.part_no
            FROM job_card_parts jcp
            LEFT JOIN parts p ON jcp.part_id = p.id
            WHERE jcp.job_id = ?
        `).all(invoice.job_id) as any[];

        // Calculate totals (LIVE, matching job card logic)
        const servicesTotal = services.reduce((sum, s) => sum + (s.price * s.quantity), 0);
        const partsTotal = parts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const subtotal = servicesTotal + partsTotal;
        const taxTotal = subtotal * 0.18;
        const grandTotal = subtotal + taxTotal;

        return {
            ...invoice,
            services,
            parts,
            servicesTotal,
            partsTotal,
            taxTotal,
            subtotal,
            grandTotal
        };
    } catch (err) {
        console.error('Get invoice error:', err);
        return null;
    }
}

/**
 * Check if job can generate invoice
 */
export async function canGenerateInvoice(jobId: number) {
    try {
        const job = db.prepare('SELECT status FROM job_cards WHERE id = ?').get(jobId) as any;
        if (!job || job.status !== 'COMPLETED') return false;

        const existingInvoice = db.prepare('SELECT id FROM invoices WHERE job_id = ?').get(jobId) as any;
        if (existingInvoice) return false;

        const servicesCount = db.prepare('SELECT COUNT(*) as count FROM job_card_services WHERE job_id = ?').get(jobId) as { count: number };
        const partsCount = db.prepare('SELECT COUNT(*) as count FROM job_card_parts WHERE job_id = ?').get(jobId) as { count: number };

        return (servicesCount.count > 0 || partsCount.count > 0);
    } catch (err) {
        return false;
    }
}

/**
 * Get invoice for a job (if exists)
 */
export async function getInvoiceByJobId(jobId: number) {
    try {
        const invoice = db.prepare('SELECT * FROM invoices WHERE job_id = ?').get(jobId) as any;
        return invoice || null;
    } catch (err) {
        return null;
    }
}

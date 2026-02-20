'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';
import { getSession } from '@/app/actions/auth';
import { updateJobTotals } from '@/lib/job-utils';
import { createNotification } from './notification';


export async function createJob(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const vehicleId = formData.get('vehicleId');
    const complaint = formData.get('complaint') as string;
    const kmReading = Number(formData.get('kmReading')) || 0;
    const status = (formData.get('status') as string) || 'OPEN';

    if (!vehicleId) return { error: 'Missing Vehicle ID' };

    try {
        const vehicleRes = await db.query('SELECT customer_id, last_km FROM vehicles WHERE id = $1', [vehicleId]);
        const vehicle = vehicleRes.rows[0];
        if (!vehicle) return { error: 'Vehicle Invalid' };

        // KM Validation
        if (kmReading < vehicle.last_km) {
            return { error: `KM Reading cannot be less than previous recording (${vehicle.last_km} KM)` };
        }

        // 1. Get next Job Number (safely handle numeric values and skip legacy prefixes)
        const lastJobRes = await db.query(`
            SELECT MAX(CAST(job_no AS INTEGER)) as max_no 
            FROM job_cards 
            WHERE job_no ~ '^[0-9]+$'
        `);
        const nextJobNo = (Number(lastJobRes.rows[0]?.max_no) || 0) + 1;

        // 2. Create Job Card
        const jobRes = await db.query(`
            INSERT INTO job_cards (job_no, vehicle_id, customer_id, complaints, status, km_reading)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `, [nextJobNo.toString(), vehicleId, vehicle.customer_id, complaint || '', status, kmReading]);

        const jobId = jobRes.rows[0].id;

        // 3. Update Vehicle KM
        await db.query('UPDATE vehicles SET last_km = $1 WHERE id = $2', [kmReading, vehicleId]);

        console.log('✅ Job Card created successfully:', jobId, 'Job No:', nextJobNo);

        revalidatePath('/dashboard/jobs');
        revalidatePath(`/dashboard/customers/${vehicle.customer_id}`);

        // Notify Logic
        const notificationMessage = `New Job Card Created: Job #${nextJobNo} by ${session.name}`;
        // If created by Mechanic, notify Admin
        if (session.role === 'mechanic') {
            await createNotification(notificationMessage, 'JOB', jobId, undefined, 'admin');
        }

        return { success: true, jobId };
    } catch (err: any) {
        console.error('❌ Job Card creation error:', err);
        return { error: `Failed to create Job Card: ${err.message}` };
    }
}

export async function updateJobStatus(jobId: number, status: string) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    // COMPLETED -> BILLED is ADMIN ONLY
    if (status === 'BILLED' && session.role !== 'admin') {
        return { error: 'Only Admin can finalize billing' };
    }

    // Strict Transition Logic
    const jobRes = await db.query('SELECT status, job_no, assigned_mechanic_id FROM job_cards WHERE id = $1', [jobId]);
    const currentJob = jobRes.rows[0];
    if (!currentJob) return { error: 'Job not found' };

    if (session.role === 'mechanic') {
        if (currentJob.status === 'OPEN' && status !== 'IN_PROGRESS') return { error: 'Mechanics must START work first' };
        if (currentJob.status === 'IN_PROGRESS' && status !== 'COMPLETED') return { error: 'Mechanics can only MARK COMPLETED' };
        if (currentJob.status === 'COMPLETED') return { error: 'Job already completed' };
        if (status === 'BILLED') return { error: 'Only Admin can finalize billing' };
    }

    const validStatuses = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'BILLED'];
    if (!validStatuses.includes(status)) return { error: 'Invalid Status' };

    try {
        let updateQuery = 'UPDATE job_cards SET status = $1';
        if (status === 'IN_PROGRESS') {
            updateQuery += ', started_at = CURRENT_TIMESTAMP';
        } else if (status === 'COMPLETED') {
            updateQuery += ', completed_at = CURRENT_TIMESTAMP';
        }
        updateQuery += ' WHERE id = $2';

        await db.query(updateQuery, [status, jobId]);
        revalidatePath(`/dashboard/jobs/${jobId}`);

        // Notify Logic
        const message = `Job #${currentJob.job_no || jobId} Status Updated to ${status} by ${session.name}`;

        if (session.role === 'mechanic') {
            // Notify Admin
            await createNotification(message, 'JOB', jobId, undefined, 'admin');
        }

        return { success: true };
    } catch (err) {
        return { error: 'Failed' };
    }
}

export async function updateJob(formData: FormData) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Admin access required' };

    const jobId = Number(formData.get('jobId'));
    const customerId = Number(formData.get('customerId'));
    const vehicleId = Number(formData.get('vehicleId'));

    const complaint = formData.get('complaint') as string;
    const mechanicIdStr = formData.get('mechanicId') as string;
    const mechanicId = mechanicIdStr ? Number(mechanicIdStr) : null;
    const status = formData.get('status') as string;
    const kmReading = Number(formData.get('kmReading')) || 0;

    const customerName = formData.get('customerName') as string;
    const mobile = formData.get('mobile') as string;
    const address = formData.get('address') as string;

    const model = formData.get('model') as string;
    const vehicleNumber = formData.get('vehicleNumber') as string;
    const vin = formData.get('vin') as string;
    const jobNo = formData.get('jobNo') as string;

    if (!jobId || isNaN(jobId)) return { error: 'Missing or Invalid Job ID' };

    try {
        const jobRes = await db.query('SELECT status, vehicle_id, job_no FROM job_cards WHERE id = $1', [jobId]);
        const existingJob = jobRes.rows[0];
        if (!existingJob) return { error: 'Job card not found' };

        // 2. Update Customer/Vehicle
        if (customerName && customerId) {
            const dbMobile = mobile?.trim() || null;
            try {
                await db.query('UPDATE customers SET name = $1, mobile = $2, address = $3 WHERE id = $4',
                    [customerName, dbMobile, address || '', customerId]);
            } catch (err: any) {
                console.error('❌ updateJob Customer Error:', err.message);
                return { error: `Failed to update customer info: ${err.message}` };
            }
        }

        if (model && vehicleNumber && vehicleId) {
            try {
                await db.query('UPDATE vehicles SET model = $1, vehicle_number = $2, vin = $3 WHERE id = $4',
                    [model, vehicleNumber, vin?.toUpperCase() || null, vehicleId]);
            } catch (err: any) {
                console.error('❌ updateJob Vehicle Error:', err.message);
                return { error: `Failed to update vehicle info: ${err.message}` };
            }
        }

        // 3. Update Job Card Fields
        try {
            await db.query('UPDATE job_cards SET complaints = $1, assigned_mechanic_id = $2, status = $3, km_reading = $4, job_no = $5 WHERE id = $6',
                [complaint || '', mechanicId, status, kmReading, jobNo || existingJob.job_no, jobId]);
        } catch (err: any) {
            console.error('❌ updateJob Card Error:', err.message);
            return { error: `Failed to update job card details: ${err.message}` };
        }

        // 4. Always sync Vehicle KM
        try {
            await db.query('UPDATE vehicles SET last_km = $1 WHERE id = $2', [kmReading, existingJob.vehicle_id]);
        } catch (err: any) {
            console.error('❌ updateJob Sync KM Error:', err.message);
            // Non-critical if job updated but KM sync failed? Actually they are usually both needed.
        }

        revalidatePath(`/dashboard/jobs/${jobId}`);
        revalidatePath('/dashboard/customers');
        return { success: true };
    } catch (err: any) {
        console.error('❌ updateJob Global Error:', err.message);
        return { error: `Global process failure: ${err.message}` };
    }
}

// Phase 2: Services & Parts
export async function getMasterServices() {
    const res = await db.query('SELECT * FROM services ORDER BY category, name');
    return res.rows;
}

export async function getMasterParts() {
    const res = await db.query('SELECT * FROM parts ORDER BY name');
    return res.rows;
}

export interface Mechanic {
    id: number;
    name: string;
}

export async function getMechanics(): Promise<Mechanic[]> {
    const res = await db.query("SELECT id, name FROM users WHERE role = 'mechanic' AND is_active = 1");
    return res.rows as Mechanic[];
}

export async function assignMechanic(jobId: number, mechanicId: number) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Admin access required' };

    const jobRes = await db.query('SELECT status, job_no FROM job_cards WHERE id = $1', [jobId]);
    const job = jobRes.rows[0];
    if (!job) return { error: 'Job not found' };
    if (job.status === 'COMPLETED' || job.status === 'BILLED') {
        return { error: 'Cannot reassign completed/billed job' };
    }

    try {
        const mId = mechanicId || null;

        // Auto-start if OPEN and we are assigning a mechanic (not unassigning)
        if (job.status === 'OPEN' && mId) {
            await db.query(`
                UPDATE job_cards 
                SET assigned_mechanic_id = $1, status = 'IN_PROGRESS', started_at = CURRENT_TIMESTAMP 
                WHERE id = $2
            `, [mId, jobId]);
        } else {
            await db.query(`
                UPDATE job_cards SET assigned_mechanic_id = $1 WHERE id = $2
            `, [mId, jobId]);
        }

        // Notify Mechanic
        if (mId) {
            await createNotification(`You have been assigned to Job #${job.job_no || jobId}`, 'JOB', jobId, mId);
        }

        revalidatePath(`/dashboard/jobs/${jobId}`);
        return { success: true };
    } catch (err: any) {
        console.error('Assign Mechanic Error:', err);
        return { error: `Failed to assign mechanic: ${err.message}` };
    }
}

export async function addJobService(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const jobId = Number(formData.get('jobId'));
    const serviceId = Number(formData.get('serviceId'));
    const price = Number(formData.get('price'));
    const quantity = Number(formData.get('quantity')) || 1;

    if (!jobId || !serviceId) return { error: 'Invalid data' };

    try {
        console.log(`[ACTION] addJobService started for Job:${jobId}, Service:${serviceId}`);

        const checkRes = await db.query(`
            SELECT s.name, jcs.id as existing_id
            FROM services s
            LEFT JOIN job_card_services jcs ON jcs.job_id = $1 AND jcs.service_id = $2
            WHERE s.id = $2
        `, [jobId, serviceId]);

        if (checkRes.rowCount === 0) return { error: 'Service not found' };
        const { name: serviceName, existing_id: existingId } = checkRes.rows[0];

        if (existingId) {
            console.log(`[ACTION] Updating existing service entry: ${existingId}`);
            await db.query('UPDATE job_card_services SET quantity = quantity + $1, price = $2 WHERE id = $3', [quantity, price, existingId]);
        } else {
            console.log(`[ACTION] Inserting new service entry`);
            await db.query(`
                INSERT INTO job_card_services (job_id, service_id, service_name, price, quantity)
                VALUES ($1, $2, $3, $4, $5)
            `, [jobId, serviceId, serviceName, price, quantity]);
        }

        console.log(`[ACTION] Updating job totals...`);
        await updateJobTotals(jobId);

        if (session.role === 'mechanic') {
            console.log(`[ACTION] Creating admin notification...`);
            // Get job_no for the notification
            const jobRes = await db.query('SELECT job_no FROM job_cards WHERE id = $1', [jobId]);
            const jobNo = jobRes.rows[0]?.job_no || jobId;

            // Use the standard helper which handles schema compatibility
            await createNotification(
                `Service '${serviceName}' added to Job card #${jobNo} by ${session.name}`,
                'JOB',
                jobId,
                undefined,
                'admin'
            );
        }

        console.log(`[ACTION] addJobService completed successfully`);
        revalidatePath(`/dashboard/jobs/${jobId}`);
        return { success: true };
    } catch (err: any) {
        console.error('❌ addJobService Failed:', err);
        return { error: `Failed to add service: ${err.message}` };
    }
}

export async function removeJobService(jobId: number, itemId: number) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    try {
        await db.query('DELETE FROM job_card_services WHERE id = $1 AND job_id = $2', [itemId, jobId]);
        await updateJobTotals(jobId);

        revalidatePath(`/dashboard/jobs/${jobId}`);
        return { success: true };
    } catch (err) {
        console.error('Remove Service Error:', err);
        return { error: 'Failed' };
    }
}

export async function addJobPart(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const jobId = Number(formData.get('jobId'));
    const partId = Number(formData.get('partId'));
    const price = Number(formData.get('price'));
    const quantity = Number(formData.get('quantity')) || 1;

    try {
        console.log(`[ACTION] addJobPart started for Job:${jobId}, Part:${partId}`);

        const checkRes = await db.query(`
            SELECT p.name, p.part_no, p.stock_quantity, jcp.id as existing_id
            FROM parts p
            LEFT JOIN job_card_parts jcp ON jcp.job_id = $1 AND jcp.part_id = $2
            WHERE p.id = $2
        `, [jobId, partId]);

        if (checkRes.rowCount === 0) return { error: 'Part not found' };
        const { name: partName, part_no: partNo, stock_quantity: stock, existing_id: existingId } = checkRes.rows[0];

        if (stock < quantity) {
            throw new Error(`Insufficient stock. Only ${stock} available.`);
        }

        if (existingId) {
            console.log(`[ACTION] Updating existing part entry: ${existingId}`);
            await db.query('UPDATE job_card_parts SET quantity = quantity + $1, price = $2 WHERE id = $3', [quantity, price, existingId]);
        } else {
            console.log(`[ACTION] Inserting new part entry`);
            await db.query(`
                INSERT INTO job_card_parts (job_id, part_id, part_name, part_no, price, quantity)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [jobId, partId, partName, partNo, price, quantity]);
        }

        console.log(`[ACTION] Deducting stock...`);
        await db.query('UPDATE parts SET stock_quantity = stock_quantity - $1 WHERE id = $2', [quantity, partId]);

        console.log(`[ACTION] Updating job totals...`);
        await updateJobTotals(jobId);

        if (session.role === 'mechanic') {
            console.log(`[ACTION] Creating admin notification...`);
            const jobRes = await db.query('SELECT job_no FROM job_cards WHERE id = $1', [jobId]);
            const jobNo = jobRes.rows[0]?.job_no || jobId;

            await createNotification(
                `Part '${partName}' added to Job card #${jobNo} by ${session.name}`,
                'JOB',
                jobId,
                undefined,
                'admin'
            );
        }

        console.log(`[ACTION] addJobPart completed successfully`);
        revalidatePath(`/dashboard/jobs/${jobId}`);
        return { success: true };
    } catch (err: any) {
        console.error('❌ addJobPart Failed:', err);
        return { error: `Failed to add part: ${err.message}` };
    }
}

export async function removeJobPart(jobId: number, itemId: number) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    try {
        const itemRes = await db.query('SELECT part_id, quantity FROM job_card_parts WHERE id = $1', [itemId]);
        const item = itemRes.rows[0];

        if (item) {
            await db.query('DELETE FROM job_card_parts WHERE id = $1 AND job_id = $2', [itemId, jobId]);
            // Optional: Restore stock
            await db.query('UPDATE parts SET stock_quantity = stock_quantity + $1 WHERE id = $2', [item.quantity, item.part_id]);
            await updateJobTotals(jobId);
        }

        revalidatePath(`/dashboard/jobs/${jobId}`);
        return { success: true };
    } catch (err) {
        return { error: 'Failed' };
    }
}

export const getJobDetails = cache(async (id: number) => {
    const jobRes = await db.query(`
    SELECT j.*, j.complaints as complaint,
           c.name as customer_name, c.mobile, c.address,
           v.model, v.vehicle_number, v.last_km, v.vin
    FROM job_cards j
    JOIN customers c ON j.customer_id = c.id
    JOIN vehicles v ON j.vehicle_id = v.id
    WHERE j.id = $1
  `, [id]);
    const job = jobRes.rows[0];

    if (!job) return null;

    const servicesRes = await db.query('SELECT * FROM job_card_services WHERE job_id = $1', [id]);
    const partsRes = await db.query('SELECT * FROM job_card_parts WHERE job_id = $1', [id]);

    return { job, services: servicesRes.rows, parts: partsRes.rows };
});

export async function deleteJobCard(jobId: number) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Admin access required' };

    try {
        // Soft delete: move to Trash (auto-purged after 30 days)
        await db.query('UPDATE job_cards SET deleted_at = NOW() WHERE id = $1', [jobId]);
        revalidatePath('/dashboard/jobs');
        revalidatePath('/dashboard/trash');
        return { success: true };
    } catch (err) {
        return { error: 'Failed' };
    }
}

export async function updateMechanicNotes(jobId: number, notes: string) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const jobRes = await db.query('SELECT status FROM job_cards WHERE id = $1', [jobId]);
    const job = jobRes.rows[0];

    if (job?.status === 'BILLED') return { error: 'Cannot edit notes after billing' };

    try {
        await db.query('UPDATE job_cards SET mechanic_notes = $1 WHERE id = $2', [notes, jobId]);
        revalidatePath(`/dashboard/jobs/${jobId}`);
        return { success: true };
    } catch (err) {
        return { error: 'Failed' };
    }
}

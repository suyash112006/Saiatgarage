'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/app/actions/auth';

// Internal Helper to Recalculate Job Totals
async function calculateJobTotals(jobId: string | number) {
    // Sum Services
    const serviceRes = await db.query(`
        SELECT SUM(price * quantity) as total FROM job_card_services WHERE job_id = $1
    `, [jobId]);
    const serviceTotal = Number(serviceRes.rows[0]?.total) || 0;

    // Sum Parts
    const partRes = await db.query(`
        SELECT SUM(price * quantity) as total FROM job_card_parts WHERE job_id = $1
    `, [jobId]);
    const partTotal = Number(partRes.rows[0]?.total) || 0;

    // Get Tax Rate
    const taxRes = await db.query("SELECT value FROM settings WHERE key = 'tax_rate'");
    const taxRate = parseFloat(taxRes.rows[0]?.value || '18');

    const taxAmount = ((serviceTotal + partTotal) * taxRate) / 100;
    const grandTotal = serviceTotal + partTotal + taxAmount;

    // Update Job Card
    await db.query(`
        UPDATE job_cards 
        SET total_services_amount = $1,
            total_parts_amount = $2,
            tax_amount = $3,
            grand_total = $4
        WHERE id = $5
    `, [serviceTotal, partTotal, taxAmount, grandTotal, jobId]);
}

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

        // 1. Create Job Card
        const jobRes = await db.query(`
            INSERT INTO job_cards (vehicle_id, customer_id, complaints, status, km_reading)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `, [vehicleId, vehicle.customer_id, complaint || '', status, kmReading]);

        const jobId = jobRes.rows[0].id;

        // 2. Update Vehicle KM
        await db.query('UPDATE vehicles SET last_km = $1 WHERE id = $2', [kmReading, vehicleId]);

        console.log('✅ Job Card created successfully:', jobId);

        revalidatePath('/dashboard/jobs');
        revalidatePath(`/dashboard/customers/${vehicle.customer_id}`);
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
    const jobRes = await db.query('SELECT status, assigned_mechanic_id FROM job_cards WHERE id = $1', [jobId]);
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
        return { success: true };
    } catch (err) {
        return { error: 'Failed' };
    }
}

export async function updateJob(formData: FormData) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Admin access required' };

    const jobId = Number(formData.get('jobId'));
    const complaint = formData.get('complaint') as string;
    const mechanicId = formData.get('mechanicId');
    const status = formData.get('status') as string;
    const kmReading = Number(formData.get('kmReading')) || 0;

    const customerId = formData.get('customerId');
    const customerName = formData.get('customerName') as string;
    const mobile = formData.get('mobile') as string;
    const address = formData.get('address') as string;

    const vehicleId = formData.get('vehicleId');
    const model = formData.get('model') as string;
    const vehicleNumber = formData.get('vehicleNumber') as string;

    if (!jobId) return { error: 'Missing Job ID' };

    try {
        const jobRes = await db.query('SELECT status, vehicle_id FROM job_cards WHERE id = $1', [jobId]);
        const existingJob = jobRes.rows[0];
        if (!existingJob) return { error: 'Job not found' };

        // 1. Strict Locking Logic - Mechanics are handled by individual actions, 
        // updateJob is ADMIN ONLY as per line 105. 
        // Removing lock to allow backdated corrections.

        const isLocked = existingJob.status === 'IN_PROGRESS';

        // 2. Update Customer/Vehicle ONLY IF NOT LOCKED
        if (!isLocked) {
            if (customerName) {
                const dbMobile = mobile?.trim() || null;
                await db.query('UPDATE customers SET name = $1, mobile = $2, address = $3 WHERE id = $4',
                    [customerName, dbMobile, address || '', customerId]);
            }
            if (model && vehicleNumber) {
                await db.query('UPDATE vehicles SET model = $1, vehicle_number = $2 WHERE id = $3',
                    [model, vehicleNumber, vehicleId]);
            }
        }

        // 3. Update Job Card Fields
        await db.query('UPDATE job_cards SET complaints = $1, assigned_mechanic_id = $2, status = $3, km_reading = $4 WHERE id = $5',
            [complaint || '', mechanicId || null, status, kmReading, jobId]);

        // 4. Always sync Vehicle KM with latest Job KM
        await db.query('UPDATE vehicles SET last_km = $1 WHERE id = $2', [kmReading, existingJob.vehicle_id]);

        revalidatePath(`/dashboard/jobs/${jobId}`);
        revalidatePath('/dashboard/customers');
        return { success: true };
    } catch (err) {
        console.error('Error updating job card:', err);
        return { error: 'Failed to update job card' };
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

    const jobRes = await db.query('SELECT status FROM job_cards WHERE id = $1', [jobId]);
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
        const serviceRes = await db.query('SELECT name FROM services WHERE id = $1', [serviceId]);
        const service = serviceRes.rows[0];

        const existingRes = await db.query('SELECT id, quantity FROM job_card_services WHERE job_id = $1 AND service_id = $2', [jobId, serviceId]);
        const existing = existingRes.rows[0];

        if (existing) {
            await db.query('UPDATE job_card_services SET quantity = quantity + $1, price = $2 WHERE id = $3', [quantity, price, existing.id]);
        } else {
            await db.query(`
                INSERT INTO job_card_services (job_id, service_id, service_name, price, quantity)
                VALUES ($1, $2, $3, $4, $5)
            `, [jobId, serviceId, service.name, price, quantity]);
        }

        await calculateJobTotals(jobId);

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
        await calculateJobTotals(jobId);

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
        const partRes = await db.query('SELECT name, part_no, stock_quantity FROM parts WHERE id = $1', [partId]);
        const part = partRes.rows[0];

        if (part.stock_quantity < quantity) {
            throw new Error(`Insufficient stock. Only ${part.stock_quantity} available.`);
        }

        const existingRes = await db.query('SELECT id, quantity FROM job_card_parts WHERE job_id = $1 AND part_id = $2', [jobId, partId]);
        const existing = existingRes.rows[0];

        if (existing) {
            await db.query('UPDATE job_card_parts SET quantity = quantity + $1, price = $2 WHERE id = $3', [quantity, price, existing.id]);
        } else {
            await db.query(`
                INSERT INTO job_card_parts (job_id, part_id, part_name, part_no, price, quantity)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [jobId, partId, part.name, part.part_no, price, quantity]);
        }

        // Deduct stock
        await db.query('UPDATE parts SET stock_quantity = stock_quantity - $1 WHERE id = $2', [quantity, partId]);

        await calculateJobTotals(jobId);

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
            await calculateJobTotals(jobId);
        }

        revalidatePath(`/dashboard/jobs/${jobId}`);
        return { success: true };
    } catch (err) {
        return { error: 'Failed' };
    }
}

export async function getJobDetails(id: number) {
    const jobRes = await db.query(`
    SELECT j.*, j.complaints as complaint,
           c.name as customer_name, c.mobile, c.address,
           v.model, v.vehicle_number, v.last_km
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
}

export async function deleteJobCard(jobId: number) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Admin access required' };

    try {
        await db.query('DELETE FROM job_cards WHERE id = $1', [jobId]);
        revalidatePath('/dashboard/jobs');
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

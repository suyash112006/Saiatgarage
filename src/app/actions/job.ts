'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/app/actions/auth';
import { updateJobTotals } from '@/lib/job-utils';

export async function createJob(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const vehicleId = formData.get('vehicleId');
    const complaint = formData.get('complaint') as string;
    const kmReading = Number(formData.get('kmReading')) || 0;
    const status = (formData.get('status') as string) || 'OPEN';

    if (!vehicleId) return { error: 'Missing Vehicle ID' };

    try {
        const vehicle = db.prepare('SELECT customer_id, last_km FROM vehicles WHERE id = ?').get(vehicleId) as { customer_id: number, last_km: number };
        if (!vehicle) return { error: 'Vehicle Invalid' };

        // KM Validation
        if (kmReading < vehicle.last_km) {
            return { error: `KM Reading cannot be less than previous recording (${vehicle.last_km} KM)` };
        }

        const transaction = db.transaction(() => {
            // 1. Create Job Card
            const jStmt = db.prepare(`
                INSERT INTO job_cards (vehicle_id, customer_id, complaints, status, km_reading)
                VALUES (?, ?, ?, ?, ?)
            `);
            const jInfo = jStmt.run(vehicleId, vehicle.customer_id, complaint || '', status, kmReading);

            // 2. Update Vehicle KM
            db.prepare('UPDATE vehicles SET last_km = ? WHERE id = ?').run(kmReading, vehicleId);

            return jInfo.lastInsertRowid;
        });

        const jobId = transaction();

        console.log('✅ Job Card created successfully:', jobId);

        revalidatePath('/dashboard/jobs');
        revalidatePath(`/dashboard/customers/${vehicle.customer_id}`);
        return { success: true, jobId };
    } catch (err: any) {
        console.error('❌ Job Card creation error:', {
            error: err.message,
            code: err.code,
            vehicleId,
            complaint,
            kmReading,
            status
        });

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

    // Strict Transition Logic: Mechanics cannot revert status or skip steps
    const currentJob = db.prepare('SELECT status, assigned_mechanic_id FROM job_cards WHERE id = ?').get(jobId) as any;
    if (!currentJob) return { error: 'Job not found' };

    if (session.role === 'mechanic') {
        if (currentJob.status === 'OPEN' && status !== 'IN_PROGRESS') return { error: 'Mechanics must START work first' };
        if (currentJob.status === 'IN_PROGRESS' && status !== 'COMPLETED') return { error: 'Mechanics can only MARK COMPLETED' };
        if (currentJob.status === 'COMPLETED') return { error: 'Job already completed' };
        if (status === 'BILLED') return { error: 'Only Admin can finalize billing' };
    }

    // Phase 1 Statuses: OPEN, IN_PROGRESS, COMPLETED, BILLED
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'BILLED'];
    if (!validStatuses.includes(status)) return { error: 'Invalid Status' };

    try {
        let stmt;
        if (status === 'IN_PROGRESS') {
            stmt = db.prepare('UPDATE job_cards SET status = ?, started_at = CURRENT_TIMESTAMP WHERE id = ?');
        } else if (status === 'COMPLETED') {
            stmt = db.prepare('UPDATE job_cards SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?');
        } else {
            stmt = db.prepare('UPDATE job_cards SET status = ? WHERE id = ?');
        }
        stmt.run(status, jobId);
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
        const existingJob = db.prepare('SELECT status, vehicle_id FROM job_cards WHERE id = ?').get(jobId) as { status: string, vehicle_id: number };
        if (!existingJob) return { error: 'Job not found' };

        // 1. Strict Locking Logic - Mechanics are handled by individual actions, 
        // updateJob is ADMIN ONLY as per line 105. 
        // Removing lock to allow backdated corrections.

        const isLocked = existingJob.status === 'IN_PROGRESS';

        const updateTx = db.transaction(() => {
            // 2. Update Customer/Vehicle ONLY IF NOT LOCKED
            if (!isLocked) {
                if (customerName && mobile) {
                    db.prepare('UPDATE customers SET name = ?, mobile = ?, address = ? WHERE id = ?')
                        .run(customerName, mobile, address || '', customerId);
                }
                if (model && vehicleNumber) {
                    db.prepare('UPDATE vehicles SET model = ?, vehicle_number = ? WHERE id = ?')
                        .run(model, vehicleNumber, vehicleId);
                }
            }

            // 3. Update Job Card Fields
            db.prepare('UPDATE job_cards SET complaints = ?, assigned_mechanic_id = ?, status = ?, km_reading = ? WHERE id = ?')
                .run(complaint || '', mechanicId || null, status, kmReading, jobId);

            // 4. Always sync Vehicle KM with latest Job KM
            db.prepare('UPDATE vehicles SET last_km = ? WHERE id = ?').run(kmReading, existingJob.vehicle_id);
        });

        updateTx();

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
    return db.prepare('SELECT * FROM services ORDER BY category, name').all();
}

export async function getMasterParts() {
    return db.prepare('SELECT * FROM parts ORDER BY name').all();
}

export interface Mechanic {
    id: number;
    name: string;
}

export async function getMechanics(): Promise<Mechanic[]> {
    return db.prepare("SELECT id, name FROM users WHERE role = 'mechanic' AND is_active = 1").all() as Mechanic[];
}

export async function assignMechanic(jobId: number, mechanicId: number) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Admin access required' };

    const job = db.prepare('SELECT status FROM job_cards WHERE id = ?').get(jobId) as any;
    if (!job) return { error: 'Job not found' };
    if (job.status === 'COMPLETED' || job.status === 'BILLED') {
        return { error: 'Cannot reassign completed/billed job' };
    }

    try {
        const mId = mechanicId || null;

        const tx = db.transaction(() => {
            // Auto-start if OPEN and we are assigning a mechanic (not unassigning)
            if (job.status === 'OPEN' && mId) {
                db.prepare(`
                    UPDATE job_cards 
                    SET assigned_mechanic_id = ?, status = 'IN_PROGRESS', started_at = CURRENT_TIMESTAMP 
                    WHERE id = ?
                `).run(mId, jobId);
            } else {
                db.prepare(`
                    UPDATE job_cards SET assigned_mechanic_id = ? WHERE id = ?
                `).run(mId, jobId);
            }
        });
        tx();
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
        const service = db.prepare('SELECT name FROM services WHERE id = ?').get(serviceId) as { name: string };

        const tx = db.transaction(() => {
            const existing = db.prepare('SELECT id, quantity FROM job_card_services WHERE job_id = ? AND service_id = ?').get(jobId, serviceId) as { id: number, quantity: number };

            if (existing) {
                db.prepare('UPDATE job_card_services SET quantity = quantity + ?, price = ? WHERE id = ?').run(quantity, price, existing.id);
            } else {
                db.prepare(`
                    INSERT INTO job_card_services (job_id, service_id, service_name, price, quantity)
                    VALUES (?, ?, ?, ?, ?)
                `).run(jobId, serviceId, service.name, price, quantity);
            }

            updateJobTotals(jobId);
        });
        tx();

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
        const tx = db.transaction(() => {
            db.prepare('DELETE FROM job_card_services WHERE id = ? AND job_id = ?').run(itemId, jobId);
            updateJobTotals(jobId);
        });
        tx();
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
        const part = db.prepare('SELECT name, part_no, stock_quantity FROM parts WHERE id = ?').get(partId) as { name: string, part_no: string, stock_quantity: number };

        const tx = db.transaction(() => {
            // Check sufficiency
            const currentStock = part.stock_quantity; // This is a snapshot read, in a real concurency scenario we need better locking, but for SQLite this is mostly serial.
            // Actually, we should check stock.
            // Note: If updating existing, we only need to check if we have enough for the *additional* quantity.
            // But wait, the form sends the *total* quantity desired? OR the quantity to ADD?
            // The form says "Quantity", usually implies "Add this many".

            if (part.stock_quantity < quantity) {
                throw new Error(`Insufficient stock. Only ${part.stock_quantity} available.`);
            }

            const existing = db.prepare('SELECT id, quantity FROM job_card_parts WHERE job_id = ? AND part_id = ?').get(jobId, partId) as { id: number, quantity: number };

            if (existing) {
                db.prepare('UPDATE job_card_parts SET quantity = quantity + ?, price = ? WHERE id = ?').run(quantity, price, existing.id);
            } else {
                db.prepare(`
                    INSERT INTO job_card_parts (job_id, part_id, part_name, part_no, price, quantity)
                    VALUES (?, ?, ?, ?, ?, ?)
                `).run(jobId, partId, part.name, part.part_no, price, quantity);
            }

            // Deduct stock
            db.prepare('UPDATE parts SET stock_quantity = stock_quantity - ? WHERE id = ?').run(quantity, partId);

            updateJobTotals(jobId);
        });
        tx();

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
        const item = db.prepare('SELECT part_id, quantity FROM job_card_parts WHERE id = ?').get(itemId) as { part_id: number, quantity: number };

        const tx = db.transaction(() => {
            db.prepare('DELETE FROM job_card_parts WHERE id = ? AND job_id = ?').run(itemId, jobId);
            // Optional: Restore stock
            db.prepare('UPDATE parts SET stock_quantity = stock_quantity + ? WHERE id = ?').run(item.quantity, item.part_id);
            updateJobTotals(jobId);
        });
        tx();
        revalidatePath(`/dashboard/jobs/${jobId}`);
        return { success: true };
    } catch (err) {
        return { error: 'Failed' };
    }
}

// function updateJobTotals removed - imported from lib/job-utils

export async function getJobDetails(id: number) {
    const job = db.prepare(`
    SELECT j.*, j.complaints as complaint,
           c.name as customer_name, c.mobile, c.address,
           v.model, v.vehicle_number, v.last_km
    FROM job_cards j
    JOIN customers c ON j.customer_id = c.id
    JOIN vehicles v ON j.vehicle_id = v.id
    WHERE j.id = ?
  `).get(id) as any;

    if (!job) return null;

    const services = db.prepare('SELECT * FROM job_card_services WHERE job_id = ?').all(id) as any[];
    const parts = db.prepare('SELECT * FROM job_card_parts WHERE job_id = ?').all(id) as any[];

    return { job, services, parts };
}

export async function deleteJobCard(jobId: number) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Admin access required' };

    // Permanent delete for Phase 1 cleanliness
    try {
        db.prepare('DELETE FROM job_cards WHERE id = ?').run(jobId);
        revalidatePath('/dashboard/jobs');
        return { success: true };
    } catch (err) {
        return { error: 'Failed' };
    }
}

export async function updateMechanicNotes(jobId: number, notes: string) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const job = db.prepare('SELECT status FROM job_cards WHERE id = ?').get(jobId) as any;
    if (job?.status === 'BILLED') return { error: 'Cannot edit notes after billing' };

    try {
        db.prepare('UPDATE job_cards SET mechanic_notes = ? WHERE id = ?').run(notes, jobId);
        revalidatePath(`/dashboard/jobs/${jobId}`);
        return { success: true };
    } catch (err) {
        return { error: 'Failed' };
    }
}


import { getJobDetails } from '@/app/actions/job';
import { getSession } from '@/app/actions/auth';
import db from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import EditJobForm from '@/components/EditJobForm';
import { AlertCircle } from 'lucide-react';

interface EditJobWrapperProps {
    jobId: number;
}

export default async function EditJobWrapper({ jobId }: EditJobWrapperProps) {
    const data = await getJobDetails(jobId);
    if (!data) notFound();

    const { job } = data;
    const session = await getSession();
    const isAdmin = session?.role === 'admin';

    // Phase 1: Locking Logic
    if (!isAdmin && (job.status === 'COMPLETED' || job.status === 'BILLED')) {
        redirect(`/dashboard/jobs/${jobId}`);
    }

    const isLocked = !isAdmin && job.status === 'IN_PROGRESS';

    // Fetch real mechanics/admins for the dropdown
    const mechanicsRes = await db.query("SELECT id, name FROM users WHERE role = 'mechanic' OR role = 'admin'");
    const mechanics = mechanicsRes.rows as { id: number, name: string }[];

    // Fetch car library for brand/model dropdowns
    const libraryRes = await db.query(`
        SELECT m.name as model, b.name as brand 
        FROM vehicle_models m 
        JOIN vehicle_brands b ON m.brand_id = b.id 
        ORDER BY b.name, m.name
    `);
    const carLibrary = libraryRes.rows as { brand: string, model: string }[];

    return (
        <>
            {isLocked && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle size={16} />
                    Vehicle & Customer info is locked because work is IN PROGRESS
                </div>
            )}

            <div className="card form-card" style={{ maxWidth: '1000px', padding: '40px', borderRadius: '24px' }}>
                <EditJobForm job={job} mechanics={mechanics} isLocked={isLocked} carLibrary={carLibrary} />
            </div>
        </>
    );
}

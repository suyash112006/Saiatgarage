import { getJobDetails } from '@/app/actions/job';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import db from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import EditJobForm from '@/components/EditJobForm';

export const dynamic = 'force-dynamic';

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const jobId = Number(id);
    const data = await getJobDetails(jobId);

    if (!data) {
        notFound();
    }

    const { job } = data;

    // Phase 1: Locking Logic
    if (job.status === 'COMPLETED' || job.status === 'BILLED') {
        redirect(`/dashboard/jobs/${jobId}`); // Strictly read-only once completed
    }

    // Work has started - lock vehicle/customer to prevent data mismatch
    const isLocked = job.status === 'IN_PROGRESS';

    // Fetch real mechanics/admins for the dropdown
    const mechanicsRes = await db.query("SELECT id, name FROM users WHERE role = 'mechanic' OR role = 'admin'");
    const mechanics = mechanicsRes.rows as { id: number, name: string }[];

    return (
        <div className="dashboard-container">
            <div className="page-header mb-8">
                <div>
                    <nav className="breadcrumbs text-muted mb-1">
                        <span className="breadcrumb-item">Dashboard</span>
                        <span className="breadcrumb-separator mx-1">/</span>
                        <span className="breadcrumb-item">Jobs</span>
                        <span className="breadcrumb-separator mx-1">/</span>
                        <span className="breadcrumb-item active text-primary font-medium">Edit #{jobId}</span>
                    </nav>

                    <h1 className="page-title">Edit Job Card #{jobId}</h1>
                    <p className="page-subtitle text-slate-500">
                        Currently <span className="font-bold text-primary uppercase">{job.status}</span>
                    </p>
                </div>

                <Link href={`/dashboard/jobs/${jobId}`} className="btn btn-outline shadow-sm border-slate-200">
                    Back to View
                </Link>
            </div>

            {isLocked && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle size={16} />
                    Vehicle & Customer info is locked because work is IN PROGRESS
                </div>
            )}

            <div className="card form-card" style={{ maxWidth: '1000px', padding: '40px', borderRadius: '24px' }}>
                <EditJobForm job={job} mechanics={mechanics} isLocked={isLocked} />
            </div>
        </div>
    );
}

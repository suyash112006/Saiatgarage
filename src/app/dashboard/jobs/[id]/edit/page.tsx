import { Suspense } from 'react';
import EditJobWrapper from '@/components/EditJobWrapper';
import Link from 'next/link';
import { getJobDetails } from '@/app/actions/job';

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const jobId = Number(id);
    const jobData = await getJobDetails(jobId);
    const jobNo = jobData?.job.job_no || jobId;

    return (
        <div className="dashboard-container">
            <div className="page-header mb-8">
                <div>
                    <nav className="breadcrumbs text-muted mb-1">
                        <span className="breadcrumb-item">Dashboard</span>
                        <span className="breadcrumb-separator mx-1">/</span>
                        <span className="breadcrumb-item">Jobs</span>
                        <span className="breadcrumb-separator mx-1">/</span>
                        <span className="breadcrumb-item active text-primary font-medium">Edit #{jobNo}</span>
                    </nav>

                    <h1 className="page-title">Edit Job Card #{jobNo}</h1>
                    <p className="page-subtitle" style={{ color: 'var(--text-muted)' }}>
                        Update job card information and assignments
                    </p>
                </div>

                <Link href={`/dashboard/jobs/${jobId}`} className="btn btn-outline shadow-sm">
                    Back to View
                </Link>
            </div>

            <Suspense fallback={<div className="p-10 text-center text-muted">Loading edit form...</div>}>
                <EditJobWrapper jobId={jobId} />
            </Suspense>
        </div>
    );
}

import { Suspense } from 'react';
import JobViewWrapper from '@/components/JobViewWrapper';
import { getJobDetails } from '@/app/actions/job';

type Params = Promise<{ id: string }>;

export default async function JobDetailPage(props: { params: Params }) {
    const params = await props.params;
    const jobId = parseInt(params.id);
    const jobData = await getJobDetails(jobId);
    const jobNo = jobData?.job.job_no || jobId;

    return (
        <div className="dashboard-container">
            <nav className="breadcrumbs mb-2" style={{ color: 'var(--text-muted)' }}>
                <span className="breadcrumb-item">Dashboard</span>
                <span className="breadcrumb-separator mx-2 opacity-50">/</span>
                <span className="breadcrumb-item">Jobs</span>
                <span className="breadcrumb-separator mx-2 opacity-50">/</span>
                <span className="breadcrumb-item active text-primary font-bold">#{jobNo}</span>
            </nav>

            <Suspense fallback={<div className="p-10 text-center text-muted">Loading job details...</div>}>
                <JobViewWrapper jobId={jobId} />
            </Suspense>
        </div>
    );
}

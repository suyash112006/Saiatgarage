import Link from 'next/link';
import { Plus } from 'lucide-react';
import clsx from 'clsx';
import { Suspense } from 'react';
import JobBoard from '@/components/JobBoard';

export const dynamic = 'force-dynamic';

export default async function JobsPage(props: { searchParams: Promise<{ status?: string }> }) {
    const searchParams = await props.searchParams;
    const currentStatus = searchParams.status || 'ALL';

    const tabs = [
        { label: 'All Jobs', value: 'ALL' },
        { label: 'Open', value: 'OPEN' },
        { label: 'On Floor', value: 'IN_PROGRESS' },
        { label: 'Completed', value: 'COMPLETED' },
    ];

    return (
        <div className="dashboard-container">
            <div className="page-header mb-8">
                <div>
                    <nav className="breadcrumbs">
                        <span className="breadcrumb-item">Dashboard</span>
                        <span className="breadcrumb-separator">/</span>
                        <span className="breadcrumb-item active">Job Board</span>
                    </nav>
                    <h1 className="page-title">Job Board</h1>
                    <p className="page-subtitle text-muted">Manage active service requests</p>
                </div>

                <Link href="/dashboard/customers/add" className="btn btn-primary shadow-lg shadow-primary/20" style={{ borderRadius: '16px', padding: '12px 28px' }}>
                    <Plus size={18} className="mr-2" />
                    New Job Card
                </Link>
            </div>

            <div className="flex gap-2 mb-6 bg-slate-100/50 p-1.5 rounded-2xl w-fit border border-slate-200/60">
                {tabs.map((tab) => (
                    <Link
                        key={tab.value}
                        href={`/dashboard/jobs?status=${tab.value}`}
                        className={clsx(
                            'px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all',
                            currentStatus === tab.value
                                ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
                                : 'text-slate-500 hover:text-slate-700'
                        )}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>

            {/* Jobs View: Table */}
            <Suspense fallback={<div className="p-10 text-center text-muted">Loading jobs...</div>}>
                <JobBoard status={currentStatus} />
            </Suspense>
        </div>
    );
}

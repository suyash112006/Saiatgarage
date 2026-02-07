import { getSession } from '@/app/actions/auth';
import db from '@/lib/db';
import Link from 'next/link';
import { Plus, Search, Calendar, User, Clock, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export const dynamic = 'force-dynamic';

async function getJobs(status?: string, role?: string, userId?: number) {
    let query = `
    SELECT j.*, c.name as customer_name, v.model, v.vehicle_number, u.name as mechanic_name
    FROM job_cards j
    JOIN customers c ON j.customer_id = c.id
    JOIN vehicles v ON j.vehicle_id = v.id
    LEFT JOIN users u ON j.assigned_mechanic_id = u.id
  `;

    const whereClauses = [];
    const params = [];

    let paramIdx = 1;

    if (status && status !== 'ALL') {
        whereClauses.push(`j.status = $${paramIdx++}`);
        params.push(status);
    }

    if (role === 'mechanic' && userId) {
        whereClauses.push(`j.assigned_mechanic_id = $${paramIdx++}`);
        params.push(userId);
    }

    if (whereClauses.length > 0) {
        query += ` WHERE ` + whereClauses.join(' AND ');
    }

    query += ` ORDER BY j.created_at DESC `;

    const res = await db.query(query, params);
    return res.rows;
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        'OPEN': 'bg-slate-100 text-slate-600',
        'IN_PROGRESS': 'bg-[#fff7ed] text-[#ea580c]',
        'COMPLETED': 'bg-[#ecfdf5] text-[#16a34a]',
        'BILLED': 'bg-[#eef2ff] text-[#2563eb]',
    };

    return (
        <span className={clsx('px-3 py-1.5 rounded-full text-xs font-semibold capitalize', styles[status] || styles.OPEN)}>
            {status.toLowerCase().replace('_', ' ')}
        </span>
    );
}

export default async function JobsPage(props: { searchParams: Promise<{ status?: string }> }) {
    const session = await getSession();
    const isAdmin = session?.role === 'admin';
    const searchParams = await props.searchParams;
    const currentStatus = searchParams.status || 'ALL';
    const jobs = await getJobs(currentStatus, session?.role, session?.id);

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
                    <nav className="breadcrumbs text-muted mb-1">
                        <span className="breadcrumb-item">Dashboard</span>
                        <span className="breadcrumb-separator mx-1">/</span>
                        <span className="breadcrumb-item active text-primary font-medium">Job Board</span>
                    </nav>
                    <h1 className="page-title">Job Board</h1>
                    <p className="page-subtitle text-muted">Manage active service requests</p>
                </div>

                {isAdmin && (
                    <Link href="/dashboard/customers/add" className="btn btn-primary shadow-lg shadow-primary/20" style={{ borderRadius: '16px', padding: '12px 28px' }}>
                        <Plus size={18} className="mr-2" />
                        New Job Card
                    </Link>
                )}
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

            {/* Mobile View: Cards */}
            <div className="md:hidden space-y-4">
                {jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <Clock size={48} className="mb-4 opacity-50" />
                        <p className="font-bold uppercase tracking-widest text-xs">No jobs found</p>
                    </div>
                ) : (
                    jobs.map((job: any) => (
                        <Link href={`/dashboard/jobs/${job.id}`} key={job.id} className="block bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="text-sm font-black text-slate-900">{job.model}</div>
                                    <div className="text-xs font-bold text-primary mt-0.5">{job.vehicle_number}</div>
                                </div>
                                <StatusBadge status={job.status} />
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold mb-4 pb-4 border-b border-slate-50">
                                <User size={14} />
                                {job.customer_name}
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    {new Date(job.service_date || job.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                </div>
                                <div className="text-primary font-bold text-xs flex items-center gap-1">
                                    View Details <ChevronRight size={14} />
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block card shadow-sm border-slate-100 rounded-3xl overflow-hidden">
                <div className="table-responsive">
                    <table className="data-table">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">ID</th>
                                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Vehicle & Model</th>
                                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Assignee</th>
                                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {jobs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="flex flex-col items-center opacity-40">
                                            <Clock size={48} className="mb-4" />
                                            <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">No jobs found in this category</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                jobs.map((job: any) => (
                                    <tr key={job.id} className="hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0">
                                        <td className="py-4 px-6 text-[13px] text-slate-500 font-medium">
                                            #{job.id}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">{job.model}</div>
                                                <div className="text-xs text-blue-600 font-medium mt-0.5">{job.vehicle_number}</div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                                                <User size={14} className="text-slate-400" />
                                                {job.customer_name}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            {job.mechanic_name ? (
                                                <div className="flex flex-col gap-1">
                                                    <div className="font-semibold text-gray-900 text-sm">{job.mechanic_name}</div>
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-green-50 text-green-700 text-[11px] font-bold uppercase tracking-wide w-fit border border-green-100/50">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                        Assigned
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 text-[11px] font-bold uppercase tracking-wide border border-orange-100/50">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                                    Not Assigned
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <StatusBadge status={job.status} />
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-[13px] text-slate-500 flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-400" />
                                                {new Date(job.service_date || job.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <Link href={`/dashboard/jobs/${job.id}`} className="text-blue-600 font-semibold text-[13px] hover:underline flex items-center justify-center gap-1">
                                                View Info
                                                <ChevronRight size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
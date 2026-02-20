'use client';

import { useRouter } from 'next/navigation';
import { User, Calendar, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { deleteJobCard } from '@/app/actions/job';
import { useState } from 'react';

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

interface JobRowProps {
    job: any;
    isAdmin: boolean;
}

export default function JobRow({ job, isAdmin }: JobRowProps) {
    const router = useRouter();

    const [deleting, setDeleting] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click
        if (confirm(`Are you sure you want to delete Job #${job.job_no || job.id}? This cannot be undone.`)) {
            setDeleting(true);
            await deleteJobCard(job.id);
            router.refresh();
        }
    };

    return (
        <tr
            onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
            className="clickable-row border-b border-slate-50 last:border-0"
        >
            <td className="py-4 px-6 text-[13px] text-slate-500 font-medium">
                #{job.job_no || job.id}
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

            {isAdmin && (
                <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center">
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="btn-icon danger animate-icon disabled:opacity-40"
                            title="Delete Job"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </td>
            )}
        </tr>
    );
}

'use client';

import { useState, useTransition } from 'react';
import { Trash2, RotateCcw, X, Users, ClipboardList, AlertTriangle, Phone, MapPin, User, Car } from 'lucide-react';
import {
    restoreCustomer,
    restoreJob,
    permanentlyDeleteCustomer,
    permanentlyDeleteJob,
    emptyTrash,
} from '@/app/actions/trash';
import { useRouter } from 'next/navigation';

interface TrashedCustomer {
    id: number;
    name: string;
    mobile: string;
    address: string;
    deleted_at: string;
}

interface TrashedJob {
    id: number;
    job_no: string;
    status: string;
    deleted_at: string;
    customer_name: string;
    model: string;
    vehicle_number: string;
}

interface TrashClientProps {
    customers: TrashedCustomer[];
    jobs: TrashedJob[];
}

function daysLeft(deletedAt: string) {
    const deleted = new Date(deletedAt);
    const purgeAt = new Date(deleted.getTime() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    return Math.max(0, Math.ceil((purgeAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export default function TrashClient({ customers: initialCustomers, jobs: initialJobs }: TrashClientProps) {
    const [customers, setCustomers] = useState(initialCustomers);
    const [jobs, setJobs] = useState(initialJobs);
    const [tab, setTab] = useState<'customers' | 'jobs'>('customers');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const total = customers.length + jobs.length;

    async function handleRestoreCustomer(id: number) {
        await restoreCustomer(id);
        setCustomers(prev => prev.filter(c => c.id !== id));
        router.refresh();
    }

    async function handleRestoreJob(id: number) {
        await restoreJob(id);
        setJobs(prev => prev.filter(j => j.id !== id));
        router.refresh();
    }

    async function handleDeleteCustomer(id: number) {
        if (!confirm('Permanently delete this customer? This CANNOT be undone.')) return;
        await permanentlyDeleteCustomer(id);
        setCustomers(prev => prev.filter(c => c.id !== id));
    }

    async function handleDeleteJob(id: number) {
        if (!confirm('Permanently delete this job card? This CANNOT be undone.')) return;
        await permanentlyDeleteJob(id);
        setJobs(prev => prev.filter(j => j.id !== id));
    }

    async function handleEmptyTrash() {
        if (!confirm('Empty all trash? This will permanently delete everything and cannot be undone.')) return;
        startTransition(async () => {
            await emptyTrash();
            setCustomers([]);
            setJobs([]);
        });
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center p-4 rounded-2xl border mb-6" style={{ background: 'rgba(51, 65, 85, 0.05)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <AlertTriangle size={16} className="text-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">Items are permanently deleted after 30 days</span>
                </div>
                {total > 0 && (
                    <button
                        onClick={handleEmptyTrash}
                        disabled={isPending}
                        className="btn flex items-center gap-2"
                        style={{
                            background: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            borderRadius: '12px',
                            padding: '10px 22px',
                            fontWeight: 700,
                            fontSize: '13px',
                        }}
                    >
                        <Trash2 size={15} />
                        Empty Trash
                    </button>
                )}
            </div>

            {/* ── Tabs (same class as Inventory) ── */}
            <div className="catalog-tabs">
                <button
                    onClick={() => setTab('customers')}
                    className={`tab ${tab === 'customers' ? 'active' : ''}`}
                >
                    <Users size={16} />
                    Customers
                    {customers.length > 0 && (
                        <span className="ml-2" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '10px', fontWeight: 900, padding: '2px 6px', borderRadius: '10px' }}>
                            {customers.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setTab('jobs')}
                    className={`tab ${tab === 'jobs' ? 'active' : ''}`}
                >
                    <ClipboardList size={16} />
                    Job Cards
                    {jobs.length > 0 && (
                        <span className="ml-2" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '10px', fontWeight: 900, padding: '2px 6px', borderRadius: '10px' }}>
                            {jobs.length}
                        </span>
                    )}
                </button>
            </div>

            {/* ── Content ── */}
            <div className="grid grid-cols-1 gap-8">
                {tab === 'customers' && (
                    customers.length === 0 ? (
                        <EmptyState label="No deleted customers" />
                    ) : (
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th className="pl-6">Customer</th>
                                            <th>Mobile</th>
                                            <th>Deleted On</th>
                                            <th>Purge In</th>
                                            <th className="text-center pr-6">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customers.map(c => {
                                            const initials = c.name ? c.name.charAt(0).toUpperCase() : '?';
                                            return (
                                                <tr key={c.id}>
                                                    <td className="pl-6">
                                                        <div className="name-cell">
                                                            <div className="avatar">{initials}</div>
                                                            <span className="name-text">{c.name}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="cell-icon">
                                                            <Phone size={14} />
                                                            {c.mobile || '—'}
                                                        </span>
                                                    </td>
                                                    <td className="text-slate-400 text-[13px] font-medium">
                                                        {new Date(c.deleted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td>
                                                        <PurgeBadge days={daysLeft(c.deleted_at)} />
                                                    </td>
                                                    <td className="pr-6">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleRestoreCustomer(c.id)}
                                                                className="btn-icon success animate-icon"
                                                                title="Restore"
                                                            >
                                                                <RotateCcw size={15} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCustomer(c.id)}
                                                                className="btn-icon danger animate-icon"
                                                                title="Delete Permanently"
                                                            >
                                                                <X size={15} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                )}

                {tab === 'jobs' && (
                    jobs.length === 0 ? (
                        <EmptyState label="No deleted job cards" />
                    ) : (
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th className="pl-6">Job #</th>
                                            <th>Vehicle</th>
                                            <th>Customer</th>
                                            <th>Deleted On</th>
                                            <th>Purge In</th>
                                            <th className="text-center pr-6">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {jobs.map(j => {
                                            const initials = j.model ? j.model.charAt(0).toUpperCase() : 'V';
                                            return (
                                                <tr key={j.id}>
                                                    <td className="pl-6 font-mono font-bold text-slate-400 text-[13px]">
                                                        #{j.job_no || j.id}
                                                    </td>
                                                    <td>
                                                        <div className="name-cell">
                                                            <div className="avatar" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
                                                                <Car size={16} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="name-text">{j.model}</span>
                                                                <span className="text-[12px] text-primary font-bold">{j.vehicle_number}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="cell-icon">
                                                            <User size={14} />
                                                            {j.customer_name || '—'}
                                                        </span>
                                                    </td>
                                                    <td className="text-slate-400 text-[13px] font-medium">
                                                        {new Date(j.deleted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td>
                                                        <PurgeBadge days={daysLeft(j.deleted_at)} />
                                                    </td>
                                                    <td className="pr-6">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleRestoreJob(j.id)}
                                                                className="btn-icon success animate-icon"
                                                                title="Restore"
                                                            >
                                                                <RotateCcw size={15} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteJob(j.id)}
                                                                className="btn-icon danger animate-icon"
                                                                title="Delete Permanently"
                                                            >
                                                                <X size={15} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="card rounded-3xl shadow-sm py-24" style={{ textAlign: 'center', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(51, 65, 85, 0.05)', color: 'var(--text-muted)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid var(--border)', flexShrink: 0, marginLeft: 'auto', marginRight: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                    <Trash2 size={28} />
                </div>
            </div>
            <h3 style={{ color: 'var(--text-main)', fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{label}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Items deleted from customers or job board will appear here.</p>
        </div>
    );
}

function PurgeBadge({ days }: { days: number }) {
    const urgent = days <= 3;
    const bgColor = urgent ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)';
    const textColor = urgent ? '#ef4444' : '#f59e0b';
    const borderColor = urgent ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)';

    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, background: bgColor, color: textColor, border: `1px solid ${borderColor}` }}>
            {urgent && <AlertTriangle size={10} />}
            {days}d left
        </span>
    );
}

import { getMechanicPerformance } from '@/app/actions/analytics';
import { getSession } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { Wrench, TrendingUp, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function MechanicPerformancePage() {
    const session = await getSession();
    if (session?.role !== 'admin') {
        redirect('/dashboard');
    }

    const result = await getMechanicPerformance();

    if ('error' in result) {
        return (
            <div className="dashboard-container">
                <div className="alert alert-error">{result.error}</div>
            </div>
        );
    }

    const mechanics = result.data || [];

    return (
        <div className="dashboard-container">
            <div className="page-header mb-8">
                <div>
                    <nav className="breadcrumbs text-muted mb-2">
                        <Link href="/dashboard/reports" className="breadcrumb-item hover:text-primary">Reports</Link>
                        <span className="breadcrumb-separator mx-1">/</span>
                        <span className="breadcrumb-item active text-primary font-medium">Mechanic Performance</span>
                    </nav>
                    <h1 className="page-title">Mechanic Performance</h1>
                    <p className="page-subtitle">Jobs completed and performance metrics</p>
                </div>
                <Link href="/dashboard/reports" className="btn btn-outline flex items-center gap-2">
                    <ArrowLeft size={18} />
                    Back to Reports
                </Link>
            </div>

            {mechanics.length === 0 ? (
                <div className="card p-12 rounded-3xl text-center">
                    <Wrench size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold">No mechanic performance data available yet</p>
                </div>
            ) : (
                <div className="card p-8 rounded-3xl">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-slate-200">
                                    <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-widest text-slate-400">
                                        Mechanic
                                    </th>
                                    <th className="text-center py-4 px-6 text-xs font-black uppercase tracking-widest text-slate-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <Wrench size={14} />
                                            Jobs Completed
                                        </div>
                                    </th>
                                    <th className="text-center py-4 px-6 text-xs font-black uppercase tracking-widest text-slate-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <Clock size={14} />
                                            Avg Days/Job
                                        </div>
                                    </th>
                                    <th className="text-center py-4 px-6 text-xs font-black uppercase tracking-widest text-slate-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <TrendingUp size={14} />
                                            Performance
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {mechanics.map((mechanic: any, index: number) => (
                                    <tr key={mechanic.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="py-5 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <span className="text-sm font-black text-primary">
                                                        {mechanic.name.charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900">{mechanic.name}</div>
                                                    <div className="text-xs text-slate-400">ID: {mechanic.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6 text-center">
                                            <span className="text-2xl font-black text-slate-900">
                                                {mechanic.jobs_completed}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6 text-center">
                                            <span className="text-lg font-bold text-slate-600">
                                                {mechanic.avg_days ? `${mechanic.avg_days} days` : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {mechanic.jobs_completed > 20 ? (
                                                    <span className="px-4 py-2 rounded-xl bg-green-100 text-green-700 text-xs font-black uppercase">
                                                        Excellent
                                                    </span>
                                                ) : mechanic.jobs_completed > 10 ? (
                                                    <span className="px-4 py-2 rounded-xl bg-blue-100 text-blue-700 text-xs font-black uppercase">
                                                        Good
                                                    </span>
                                                ) : (
                                                    <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-black uppercase">
                                                        Average
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

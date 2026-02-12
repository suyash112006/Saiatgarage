import { getPopularServices } from '@/app/actions/analytics';
import { getSession } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ServicePopularityPage() {
    const session = await getSession();
    if (session?.role !== 'admin') {
        redirect('/dashboard');
    }

    const result = await getPopularServices();

    if ('error' in result) {
        return (
            <div className="dashboard-container">
                <div className="alert alert-error">{result.error}</div>
            </div>
        );
    }

    const services = result.data || [];

    return (
        <div className="dashboard-container">
            <div className="page-header mb-8">
                <div>
                    <nav className="breadcrumbs text-muted mb-2">
                        <Link href="/dashboard/reports" className="breadcrumb-item hover:text-primary">Reports</Link>
                        <span className="breadcrumb-separator mx-1">/</span>
                        <span className="breadcrumb-item active text-primary font-medium">Service Popularity</span>
                    </nav>
                    <h1 className="page-title">Service Popularity</h1>
                    <p className="page-subtitle">Top services and revenue contribution</p>
                </div>
                <Link href="/dashboard/reports" className="btn btn-outline flex items-center gap-2">
                    Back to Reports
                </Link>
            </div>

            {services.length === 0 ? (
                <div className="card p-12 rounded-3xl text-center">
                    <BarChart3 size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold">No service data available yet</p>
                </div>
            ) : (
                <div className="card p-8 rounded-3xl">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-slate-200">
                                    <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-widest text-slate-400">
                                        Rank
                                    </th>
                                    <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-widest text-slate-400">
                                        Service Name
                                    </th>
                                    <th className="text-center py-4 px-6 text-xs font-black uppercase tracking-widest text-slate-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <TrendingUp size={14} />
                                            Usage Count
                                        </div>
                                    </th>
                                    <th className="text-right py-4 px-6 text-xs font-black uppercase tracking-widest text-slate-400">
                                        <div className="flex items-center justify-end gap-2">
                                            <DollarSign size={14} />
                                            Total Revenue
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map((service: any, index: number) => (
                                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="py-5 px-6">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="text-sm font-black text-primary">#{index + 1}</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="font-black text-slate-900">{service.service_name}</div>
                                        </td>
                                        <td className="py-5 px-6 text-center">
                                            <span className="text-xl font-black text-slate-900">
                                                {service.usage_count}
                                            </span>
                                            <span className="text-xs text-slate-400 ml-1">times</span>
                                        </td>
                                        <td className="py-5 px-6 text-right">
                                            <span className="text-lg font-black text-green-600">
                                                ₹{service.total_revenue?.toLocaleString() || 0}
                                            </span>
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

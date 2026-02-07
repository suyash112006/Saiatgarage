import { getMonthlyRevenue } from '@/app/actions/analytics';
import { getSession } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { DollarSign, TrendingUp, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function RevenueReportPage() {
    const session = await getSession();
    if (session?.role !== 'admin') {
        redirect('/dashboard');
    }

    // Get current month data by default
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const result = await getMonthlyRevenue(currentYear, currentMonth);

    if ('error' in result) {
        return (
            <div className="dashboard-container">
                <div className="alert alert-error">{result.error}</div>
            </div>
        );
    }

    const { dailyBreakdown, monthTotal } = result;

    return (
        <div className="dashboard-container">
            <div className="page-header mb-8">
                <div>
                    <nav className="breadcrumbs text-muted mb-2">
                        <Link href="/dashboard/reports" className="breadcrumb-item hover:text-primary">Reports</Link>
                        <span className="breadcrumb-separator mx-1">/</span>
                        <span className="breadcrumb-item active text-primary font-medium">Revenue Analysis</span>
                    </nav>
                    <h1 className="page-title">Revenue Analysis</h1>
                    <p className="page-subtitle">
                        {new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <Link href="/dashboard/reports" className="btn btn-outline flex items-center gap-2">
                    <ArrowLeft size={18} />
                    Back to Reports
                </Link>
            </div>

            {/* Month Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="card p-6 rounded-3xl border-2 border-green-200 bg-green-50">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-2xl bg-green-100 border border-green-200">
                            <DollarSign size={24} className="text-green-600" />
                        </div>
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                        Total Revenue
                    </h3>
                    <p className="text-3xl font-black text-slate-900">
                        ₹{monthTotal.total_revenue?.toLocaleString() || 0}
                    </p>
                </div>

                <div className="card p-6 rounded-3xl border-2 border-blue-200 bg-blue-50">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-2xl bg-blue-100 border border-blue-200">
                            <TrendingUp size={24} className="text-blue-600" />
                        </div>
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                        Total Invoices
                    </h3>
                    <p className="text-3xl font-black text-slate-900">
                        {monthTotal.total_invoices || 0}
                    </p>
                </div>
            </div>

            {/* Daily Breakdown */}
            <div className="card p-8 rounded-3xl">
                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    <Calendar size={24} className="text-primary" />
                    Daily Breakdown
                </h2>

                {!dailyBreakdown || dailyBreakdown.length === 0 ? (
                    <div className="p-12 text-center">
                        <DollarSign size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 font-bold">No revenue data for this month</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-slate-200">
                                    <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-widest text-slate-400">
                                        Date
                                    </th>
                                    <th className="text-center py-4 px-6 text-xs font-black uppercase tracking-widest text-slate-400">
                                        Invoices
                                    </th>
                                    <th className="text-right py-4 px-6 text-xs font-black uppercase tracking-widest text-slate-400">
                                        Revenue
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {dailyBreakdown.map((day: any, index: number) => (
                                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="py-5 px-6">
                                            <div className="font-black text-slate-900">
                                                {new Date(day.date).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="py-5 px-6 text-center">
                                            <span className="text-lg font-black text-slate-900">
                                                {day.invoice_count}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6 text-right">
                                            <span className="text-xl font-black text-green-600">
                                                ₹{day.daily_total?.toLocaleString() || 0}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

import { getRepeatCustomers } from '@/app/actions/analytics';
import { getSession } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { Users, TrendingUp, Calendar, DollarSign, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CustomerRetentionPage() {
    const session = await getSession();
    if (session?.role !== 'admin') {
        redirect('/dashboard');
    }

    const result = await getRepeatCustomers();

    if ('error' in result) {
        return (
            <div className="dashboard-container">
                <div className="alert alert-error">{result.error}</div>
            </div>
        );
    }

    const customers = result.data || [];

    return (
        <div className="dashboard-container">
            <div className="page-header mb-8">
                <div>
                    <nav className="breadcrumbs text-muted mb-2">
                        <Link href="/dashboard/reports" className="breadcrumb-item hover:text-primary">Reports</Link>
                        <span className="breadcrumb-separator mx-1">/</span>
                        <span className="breadcrumb-item active text-primary font-medium">Customer Retention</span>
                    </nav>
                    <h1 className="page-title">Customer Retention</h1>
                    <p className="page-subtitle">Repeat customers and visit frequency</p>
                </div>
                <Link href="/dashboard/reports" className="btn btn-outline flex items-center gap-2">
                    <ArrowLeft size={18} />
                    Back to Reports
                </Link>
            </div>

            {customers.length === 0 ? (
                <div className="card p-12 rounded-3xl text-center">
                    <Users size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold">No repeat customers yet</p>
                </div>
            ) : (
                <div className="card p-8 rounded-3xl">
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl">
                        <p className="text-sm text-green-900">
                            <strong className="font-black">{customers.length}</strong> repeat customers found. These are your most valuable clients!
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-slate-200">
                                    <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-widest text-slate-400">
                                        Customer
                                    </th>
                                    <th className="text-center py-4 px-6 text-xs font-black uppercase tracking-widest text-slate-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <TrendingUp size={14} />
                                            Total Visits
                                        </div>
                                    </th>
                                    <th className="text-center py-4 px-6 text-xs font-black uppercase tracking-widest text-slate-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <Calendar size={14} />
                                            Last Visit
                                        </div>
                                    </th>
                                    <th className="text-right py-4 px-6 text-xs font-black uppercase tracking-widest text-slate-400">
                                        <div className="flex items-center justify-end gap-2">
                                            <DollarSign size={14} />
                                            Total Spent
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer: any) => (
                                    <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="py-5 px-6">
                                            <div>
                                                <div className="font-black text-slate-900">{customer.name}</div>
                                                <div className="text-xs text-slate-400">{customer.mobile}</div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6 text-center">
                                            <span className="text-xl font-black text-slate-900">
                                                {customer.total_visits}
                                            </span>
                                            <span className="text-xs text-slate-400 ml-1">visits</span>
                                        </td>
                                        <td className="py-5 px-6 text-center">
                                            <span className="text-sm font-bold text-slate-600">
                                                {customer.last_visit ? new Date(customer.last_visit).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6 text-right">
                                            <span className="text-lg font-black text-green-600">
                                                ₹{customer.total_spent?.toLocaleString() || 0}
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

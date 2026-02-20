import { getMonthlyRevenue } from '@/app/actions/analytics';
import { getSession } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { DollarSign, TrendingUp, Calendar, ArrowLeft, IndianRupee } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function RevenueReportPage() {
    const session = await getSession();
    if (session?.role !== 'admin') redirect('/dashboard');

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
    const totalRev = Number(monthTotal.total_revenue ?? 0);
    const totalInv = Number(monthTotal.total_invoices ?? 0);
    const avgPerInvoice = totalInv > 0 ? Math.round(totalRev / totalInv) : 0;

    return (
        <div className="dashboard-container">

            {/* ── Header ── */}
            <div className="page-header mb-8">
                <div>
                    <nav className="breadcrumbs">
                        <Link href="/dashboard/reports" className="breadcrumb-item hover:text-primary">Reports</Link>
                        <span className="breadcrumb-separator">/</span>
                        <span className="breadcrumb-item active">Revenue Analysis</span>
                    </nav>
                    <h1 className="page-title">Revenue Analysis</h1>
                    <p className="page-subtitle">
                        {new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <Link href="/dashboard/reports" className="btn btn-outline flex items-center gap-2">
                    <ArrowLeft size={16} /> Back to Reports
                </Link>
            </div>

            {/* ── KPI Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', marginBottom: '28px' }}>
                {/* Total Revenue */}
                <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(22, 163, 74, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                        <IndianRupee size={24} color="#16a34a" />
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Revenue</p>
                    <p style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>
                        ₹{totalRev.toLocaleString()}
                    </p>
                </div>

                {/* Total Invoices */}
                <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                        <TrendingUp size={24} color="#2563eb" />
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Invoices</p>
                    <p style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>
                        {totalInv}
                    </p>
                </div>

                {/* Avg per Invoice */}
                <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                        <DollarSign size={24} color="#7c3aed" />
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Avg per Invoice</p>
                    <p style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>
                        ₹{avgPerInvoice.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* ── Daily Breakdown Table ── */}
            <div className="card" style={{ borderRadius: '20px', overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', background: 'transparent', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(51, 65, 85, 0.05)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={18} color="var(--text-muted)" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-main)' }}>Daily Breakdown</h2>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>Revenue per day this month</p>
                    </div>
                </div>

                {!dailyBreakdown || dailyBreakdown.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '20px', background: 'var(--bg-main)', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <DollarSign size={28} color="var(--text-muted)" />
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '15px' }}>No revenue data for this month</p>
                    </div>
                ) : (
                    <table className="data-table w-full">
                        <thead>
                            <tr style={{ background: 'transparent', borderBottom: '1px solid var(--border)' }}>
                                <th className="text-left" style={{ padding: '16px 24px', fontSize: '18px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                                <th className="text-center" style={{ padding: '16px 24px', fontSize: '18px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invoices</th>
                                <th className="text-right" style={{ padding: '16px 24px', fontSize: '18px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue</th>
                                <th className="text-right" style={{ padding: '16px 28px 16px 24px', fontSize: '18px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Share</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dailyBreakdown.map((day: any, index: number) => {
                                const totalRevForPct = totalRev > 0 ? totalRev : 1;
                                const dayTotal = Number(day.daily_total ?? 0);
                                const pct = Math.round((dayTotal / totalRevForPct) * 100);
                                return (
                                    <tr key={index} style={{ borderBottom: index === dailyBreakdown.length - 1 ? 'none' : '1px solid var(--border)' }}>
                                        <td style={{ padding: '18px 24px' }}>
                                            <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '15px' }}>
                                                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </span>
                                        </td>
                                        <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '8px', background: 'rgba(51, 65, 85, 0.05)', color: 'var(--text-main)', fontWeight: 800, fontSize: '14px', border: '1px solid var(--border)' }}>
                                                {day.invoice_count}
                                            </span>
                                        </td>
                                        <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                                            <span style={{ fontSize: '18px', fontWeight: 900, color: '#16a34a' }}>
                                                ₹{dayTotal.toLocaleString()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                                                <div style={{ width: 80, height: 8, borderRadius: 99, background: 'var(--bg-main)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: '#16a34a' }} />
                                                </div>
                                                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', minWidth: '35px', textAlign: 'right' }}>{pct}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

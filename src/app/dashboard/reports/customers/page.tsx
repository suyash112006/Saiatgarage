import { getRepeatCustomers } from '@/app/actions/analytics';
import { getSession } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { Users, TrendingUp, Calendar, IndianRupee, ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CustomerRetentionPage() {
    const session = await getSession();
    if (session?.role !== 'admin') redirect('/dashboard');

    const result = await getRepeatCustomers();

    if ('error' in result) {
        return (
            <div className="dashboard-container">
                <div className="alert alert-error">{result.error}</div>
            </div>
        );
    }

    const customers = result.data || [];
    const totalSpent = customers.reduce((sum: number, c: any) => sum + Number(c.total_spent ?? 0), 0);
    const totalVisits = customers.reduce((sum: number, c: any) => sum + Number(c.total_visits ?? 0), 0);

    return (
        <div className="dashboard-container">

            {/* ── Header ── */}
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
                    <ArrowLeft size={16} /> Back to Reports
                </Link>
            </div>

            {/* ── KPI Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', marginBottom: '28px' }}>
                <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                        <Users size={24} color="#2563eb" />
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Repeat Customers</p>
                    <p style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{customers.length}</p>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(22, 163, 74, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                        <IndianRupee size={24} color="#16a34a" />
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Lifetime Value</p>
                    <p style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>₹{totalSpent.toLocaleString()}</p>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(147, 51, 234, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                        <TrendingUp size={24} color="#9333ea" />
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Visits</p>
                    <p style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{totalVisits}</p>
                </div>
            </div>

            {/* ── Table ── */}
            {customers.length === 0 ? (
                <div className="card" style={{ padding: '60px', textAlign: 'center', borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '20px', background: 'rgba(51, 65, 85, 0.05)', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Users size={28} color="var(--text-muted)" />
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '15px' }}>No repeat customers yet</p>
                </div>
            ) : (
                <div className="card" style={{ borderRadius: '20px', overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Star size={18} color="#2563eb" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-main)' }}>Top Loyal Customers</h2>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>{customers.length} customers with 2+ visits</p>
                        </div>
                    </div>
                    <table className="data-table w-full">
                        <thead>
                            <tr>
                                <th className="text-left" style={{ fontSize: '18px' }}>#</th>
                                <th className="text-left" style={{ fontSize: '18px' }}>Customer</th>
                                <th className="text-center" style={{ fontSize: '18px' }}>Visits</th>
                                <th className="text-center" style={{ fontSize: '18px' }}>Last Visit</th>
                                <th className="text-right" style={{ fontSize: '18px' }}>Total Spent</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer: any, index: number) => (
                                <tr key={customer.id}>
                                    <td style={{ padding: '18px 24px', width: 60 }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '8px', background: index === 0 ? 'rgba(217, 119, 6, 0.1)' : 'rgba(51, 65, 85, 0.05)', color: index === 0 ? '#d97706' : 'var(--text-muted)', fontWeight: 900, fontSize: '13px', border: '1px solid var(--border)' }}>
                                            {index + 1}
                                        </span>
                                    </td>
                                    <td style={{ padding: '18px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(37, 99, 235, 0.05)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <span style={{ fontSize: '15px', fontWeight: 900, color: '#2563eb' }}>
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '15px' }}>{customer.name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{customer.mobile || '—'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '6px', background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed', fontWeight: 800, fontSize: '14px' }}>
                                            {Number(customer.total_visits)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>
                                            {customer.last_visit ? new Date(customer.last_visit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                                        <span style={{ fontSize: '18px', fontWeight: 900, color: '#16a34a' }}>
                                            ₹{Number(customer.total_spent ?? 0).toLocaleString()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

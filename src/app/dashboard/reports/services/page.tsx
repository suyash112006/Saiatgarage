import { getPopularServices } from '@/app/actions/analytics';
import { getSession } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { BarChart3, TrendingUp, IndianRupee, ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ServicePopularityPage() {
    const session = await getSession();
    if (session?.role !== 'admin') redirect('/dashboard');

    const result = await getPopularServices();

    if ('error' in result) {
        return (
            <div className="dashboard-container">
                <div className="alert alert-error">{result.error}</div>
            </div>
        );
    }

    const services = result.data || [];
    const totalRevenue = services.reduce((sum: number, s: any) => sum + Number(s.total_revenue ?? 0), 0);
    const totalUsage = services.reduce((sum: number, s: any) => sum + Number(s.usage_count ?? 0), 0);

    const rankColors = ['#f59e0b', '#94a3b8', '#b45309'];

    return (
        <div className="dashboard-container">

            {/* ── Header ── */}
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
                    <ArrowLeft size={16} /> Back to Reports
                </Link>
            </div>

            {/* ── KPI Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', marginBottom: '28px' }}>
                <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(147, 51, 234, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                        <BarChart3 size={24} color="#9333ea" />
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Unique Services</p>
                    <p style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{services.length}</p>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(22, 163, 74, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                        <IndianRupee size={24} color="#16a34a" />
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Revenue</p>
                    <p style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>₹{totalRevenue.toLocaleString()}</p>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(217, 119, 6, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                        <TrendingUp size={24} color="#d97706" />
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Jobs Serviced</p>
                    <p style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{totalUsage}</p>
                </div>
            </div>

            {/* ── Table ── */}
            {services.length === 0 ? (
                <div className="card" style={{ padding: '60px', textAlign: 'center', borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '20px', background: 'rgba(51, 65, 85, 0.05)', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <BarChart3 size={28} color="var(--text-muted)" />
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '15px' }}>No service data available yet</p>
                </div>
            ) : (
                <div className="card" style={{ borderRadius: '20px', overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(147, 51, 234, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Zap size={18} color="#9333ea" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-main)' }}>Top 10 Services</h2>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>Ranked by usage count</p>
                        </div>
                    </div>
                    <table className="data-table w-full">
                        <thead>
                            <tr>
                                <th className="text-left" style={{ fontSize: '18px' }}>Rank</th>
                                <th className="text-left" style={{ fontSize: '18px' }}>Service Name</th>
                                <th className="text-center" style={{ fontSize: '18px' }}>Usage</th>
                                <th className="text-right" style={{ fontSize: '18px' }}>Revenue</th>
                                <th className="text-right" style={{ paddingRight: '28px', fontSize: '18px' }}>Contribution</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((service: any, index: number) => {
                                const pct = totalRevenue > 0 ? Math.round((Number(service.total_revenue) / totalRevenue) * 100) : 0;
                                return (
                                    <tr key={index}>
                                        <td style={{ padding: '18px 24px', width: 70 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '8px', background: index < 3 ? 'rgba(217, 119, 6, 0.1)' : 'rgba(51, 65, 85, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                                                <span style={{ fontSize: '14px', fontWeight: 900, color: index < 3 ? rankColors[index] : 'var(--text-muted)' }}>
                                                    {index + 1}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '18px 24px' }}>
                                            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '15px' }}>{service.service_name}</div>
                                        </td>
                                        <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '6px', background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed', fontWeight: 800, fontSize: '14px' }}>
                                                {Number(service.usage_count)}
                                                <span style={{ fontWeight: 500, fontSize: '11px', color: '#7c3aed', opacity: 0.5 }}>×</span>
                                            </span>
                                        </td>
                                        <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                                            <div style={{ fontSize: '18px', fontWeight: 900, color: '#16a34a' }}>
                                                ₹{Number(service.total_revenue ?? 0).toLocaleString()}
                                            </div>
                                        </td>
                                        <td style={{ padding: '18px 28px 18px 24px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                                                <div style={{ width: 80, height: 6, borderRadius: 99, background: 'rgba(51, 65, 85, 0.05)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: '#9333ea' }} />
                                                </div>
                                                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', minWidth: '30px', textAlign: 'right' }}>{pct}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

import { getMechanicPerformance } from '@/app/actions/analytics';
import { getSession } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { Wrench, TrendingUp, Clock, ArrowLeft, Award } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function MechanicPerformancePage() {
    const session = await getSession();
    if (session?.role !== 'admin') redirect('/dashboard');

    const result = await getMechanicPerformance();

    if ('error' in result) {
        return (
            <div className="dashboard-container">
                <div className="alert alert-error">{result.error}</div>
            </div>
        );
    }

    const mechanics = result.data || [];
    const totalJobs = mechanics.reduce((sum: number, m: any) => sum + Number(m.jobs_completed || 0), 0);
    const topPerformer = mechanics[0];

    return (
        <div className="dashboard-container">

            {/* ── Header ── */}
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
                    <ArrowLeft size={16} /> Back to Reports
                </Link>
            </div>

            {/* ── KPI Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', marginBottom: '28px' }}>
                <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(217, 119, 6, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                        <Wrench size={24} color="#d97706" />
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Active Mechanics</p>
                    <p style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{mechanics.length}</p>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(22, 163, 74, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                        <TrendingUp size={24} color="#16a34a" />
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Billed Jobs</p>
                    <p style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{totalJobs}</p>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                        <Award size={24} color="#2563eb" />
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Top Performer</p>
                    <p style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.2 }}>
                        {topPerformer?.name ?? '—'}
                    </p>
                </div>
            </div>

            {/* ── Table ── */}
            {mechanics.length === 0 ? (
                <div className="card" style={{ padding: '60px', textAlign: 'center', borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '20px', background: 'rgba(51, 65, 85, 0.05)', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Wrench size={28} color="var(--text-muted)" />
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '15px' }}>No mechanic performance data yet</p>
                </div>
            ) : (
                <div className="card" style={{ borderRadius: '20px', overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(217, 119, 6, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Award size={18} color="#d97706" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-main)' }}>Team Leaderboard</h2>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>Ranked by completed jobs</p>
                        </div>
                    </div>
                    <table className="data-table w-full">
                        <thead>
                            <tr>
                                <th className="text-left" style={{ fontSize: '18px' }}>Mechanic</th>
                                <th className="text-center" style={{ fontSize: '18px' }}>Jobs Completed</th>
                                <th className="text-center" style={{ fontSize: '18px' }}>Avg Days/Job</th>
                                <th className="text-center" style={{ fontSize: '18px' }}>Workload</th>
                                <th className="text-center" style={{ fontSize: '18px' }}>Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mechanics.map((mechanic: any, index: number) => {
                                const jobs = Number(mechanic.jobs_completed) || 0;
                                const pct = totalJobs > 0 ? Math.round((jobs / totalJobs) * 100) : 0;
                                const rating = jobs > 20 ? { label: 'Excellent', bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' }
                                    : jobs > 10 ? { label: 'Good', bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' }
                                        : { label: 'Average', bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
                                return (
                                    <tr key={mechanic.id}>
                                        <td style={{ padding: '18px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ position: 'relative' }}>
                                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(217, 119, 6, 0.05)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <span style={{ fontSize: '16px', fontWeight: 900, color: '#d97706' }}>
                                                            {mechanic.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    {index === 0 && (
                                                        <div style={{ position: 'absolute', top: -6, right: -6, fontSize: '14px' }}>🏆</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '15px' }}>{mechanic.name}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mechanic</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                                            <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-main)' }}>{jobs}</span>
                                        </td>
                                        <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                                            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-muted)' }}>
                                                {mechanic.avg_days ? `${mechanic.avg_days}d` : '—'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                                <div style={{ width: 80, height: 6, borderRadius: 99, background: 'rgba(51, 65, 85, 0.05)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: '#d97706' }} />
                                                </div>
                                                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', minWidth: '30px' }}>{pct}%</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                                            <span style={{ display: 'inline-block', padding: '5px 14px', borderRadius: '8px', background: 'rgba(51, 65, 85, 0.05)', color: rating.color, border: `1.5px solid var(--border)`, fontSize: '11px', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                                                {rating.label}
                                            </span>
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

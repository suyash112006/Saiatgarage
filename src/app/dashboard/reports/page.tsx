import { getSession } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import styles from './reports.module.css';
import {
    BarChart3,
    DollarSign,
    TrendingUp,
    Users,
    Wrench,
    ArrowRight,
} from 'lucide-react';
import { Suspense } from 'react';
import ReportsSummary from '@/components/reports/ReportsSummary';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
    const session = await getSession();
    if (session?.role !== 'admin') {
        redirect('/dashboard');
    }

    const reports = [
        {
            title: 'Revenue Analysis',
            description: 'Daily & monthly breakdown of billed invoices. Track income trends over time.',
            href: '/dashboard/reports/revenue',
            icon: DollarSign,
            accent: '#16a34a',
            accentBg: '#f0fdf4',
            accentBorder: '#bbf7d0',
            accentIcon: '#dcfce7',
            tag: 'Finance',
        },
        {
            title: 'Customer Retention',
            description: 'Identify your top repeat customers, visit frequency, and lifetime value.',
            href: '/dashboard/reports/customers',
            icon: Users,
            accent: '#2563eb',
            accentBg: '#eff6ff',
            accentBorder: '#bfdbfe',
            accentIcon: '#dbeafe',
            tag: 'Customers',
        },
        {
            title: 'Service Popularity',
            description: 'See which services are most in-demand and their revenue contribution.',
            href: '/dashboard/reports/services',
            icon: TrendingUp,
            accent: '#7c3aed',
            accentBg: '#f5f3ff',
            accentBorder: '#ddd6fe',
            accentIcon: '#ede9fe',
            tag: 'Services',
        },
        {
            title: 'Mechanic Performance',
            description: 'Jobs completed, average turnaround time, and performance ratings per mechanic.',
            href: '/dashboard/reports/mechanics',
            icon: Wrench,
            accent: '#d97706',
            accentBg: '#fffbeb',
            accentBorder: '#fde68a',
            accentIcon: '#fef3c7',
            tag: 'Team',
        },
    ];

    const liveDataBadgeStyle: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        borderRadius: '99px',
        fontSize: '11px',
        fontWeight: 800,
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        background: 'rgba(34, 197, 94, 0.1)',
        border: '1.5px solid rgba(34, 197, 94, 0.2)',
        color: '#22c55e',
    };

    return (
        <div className="dashboard-container">
            {/* ── Page Header ── */}
            <div className="page-header mb-8">
                <div>
                    <nav className="breadcrumbs">
                        <span className="breadcrumb-item active">Reports</span>
                    </nav>
                    <h1 className="page-title">Reports & Analytics</h1>
                    <p className="page-subtitle">Business intelligence and performance insights</p>
                </div>
                <div className="flex items-center gap-3">
                    <span style={liveDataBadgeStyle}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                        Live Data
                    </span>
                </div>
            </div>

            {/* ── KPI Summary Row ── */}
            <Suspense fallback={<div className="p-10 text-center text-muted">Loading analytics...</div>}>
                <ReportsSummary />
            </Suspense>

            {/* ── Section Heading ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <BarChart3 size={18} color="var(--primary)" />
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-.01em' }}>
                    Report Categories
                </h2>
            </div>

            {/* ── Report Cards Grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {reports.map((report) => (
                    <Link
                        key={report.href}
                        href={report.href}
                        style={{ textDecoration: 'none' }}
                    >
                        <div
                            className={`card ${styles.reportCard}`}
                            style={{
                                padding: '28px',
                                borderRadius: '20px',
                                height: '100%',
                            }}
                        >
                            {/* Card header */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div
                                        style={{
                                            width: 52,
                                            height: 52,
                                            borderRadius: '14px',
                                            background: 'rgba(51, 65, 85, 0.05)',
                                            border: '1.5px solid var(--border)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <report.icon size={24} color={report.accent} />
                                    </div>
                                    <div>
                                        <span
                                            style={{
                                                fontSize: '11px',
                                                fontWeight: 800,
                                                letterSpacing: '.08em',
                                                textTransform: 'uppercase',
                                                color: report.accent,
                                                background: 'rgba(51, 65, 85, 0.05)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '6px',
                                                padding: '2px 8px',
                                                display: 'inline-block',
                                                marginBottom: '6px',
                                            }}
                                        >
                                            {report.tag}
                                        </span>
                                        <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.2 }}>
                                            {report.title}
                                        </h3>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: '10px',
                                        background: 'var(--bg-main)',
                                        border: '1.5px solid var(--border)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    <ArrowRight size={15} color="var(--text-muted)" />
                                </div>
                            </div>

                            {/* Divider */}
                            <div style={{ height: '1px', background: 'var(--border)', marginBottom: '16px', opacity: 0.5 }} />

                            {/* Description */}
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.65, fontWeight: 500 }}>
                                {report.description}
                            </p>

                            {/* View Report CTA */}
                            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 800, color: report.accent }}>
                                    View Report
                                </span>
                                <ArrowRight size={13} color={report.accent} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

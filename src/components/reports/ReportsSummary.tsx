import { getAnalyticsDashboard } from '@/app/actions/analytics';
import {
    IndianRupee,
    Calendar,
    CheckCircle2,
    RefreshCcw,
} from 'lucide-react';

export default async function ReportsSummary() {
    const stats = await getAnalyticsDashboard();
    const hasStats = !('error' in stats);

    const kpis = [
        {
            label: "Today's Revenue",
            value: hasStats ? `₹${(stats as any).todayRevenue?.toLocaleString() ?? 0}` : '—',
            icon: IndianRupee,
            color: '#16a34a',
            bg: 'rgba(22, 163, 74, 0.05)',
            border: 'rgba(22, 163, 74, 0.2)',
            iconBg: 'rgba(22, 163, 74, 0.1)',
        },
        {
            label: 'This Month',
            value: hasStats ? `₹${(stats as any).monthRevenue?.toLocaleString() ?? 0}` : '—',
            icon: Calendar,
            color: '#2563eb',
            bg: 'rgba(37, 99, 235, 0.05)',
            border: 'rgba(37, 99, 235, 0.2)',
            iconBg: 'rgba(37, 99, 235, 0.1)',
        },
        {
            label: 'Billed Jobs',
            value: hasStats ? (stats as any).completedJobs ?? 0 : '—',
            icon: CheckCircle2,
            color: '#7c3aed',
            bg: 'rgba(124, 58, 237, 0.05)',
            border: 'rgba(124, 58, 237, 0.2)',
            iconBg: 'rgba(124, 58, 237, 0.1)',
        },
        {
            label: 'Repeat Customers',
            value: hasStats ? (stats as any).repeatCustomers ?? 0 : '—',
            icon: RefreshCcw,
            color: '#d97706',
            bg: 'rgba(217, 119, 6, 0.05)',
            border: 'rgba(217, 119, 6, 0.2)',
            iconBg: 'rgba(217, 119, 6, 0.1)',
        },
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
            {kpis.map((kpi) => (
                <div
                    key={kpi.label}
                    style={{
                        background: 'var(--bg-card)',
                        border: `1.5px solid var(--border)`,
                        borderRadius: '20px',
                        padding: '24px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: '12px',
                                background: kpi.iconBg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <kpi.icon size={22} color={kpi.color} />
                        </div>
                        <div style={{ background: kpi.bg, padding: '4px 8px', borderRadius: '6px', border: `1px solid ${kpi.border}` }}>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: kpi.color, textTransform: 'uppercase' }}>Stats</span>
                        </div>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                        {kpi.label}
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>
                        {kpi.value}
                    </p>
                </div>
            ))}
        </div>
    );
}

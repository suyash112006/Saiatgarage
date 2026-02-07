import { getAnalyticsDashboard } from '@/app/actions/analytics';
import { getSession } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { TrendingUp, Users, Wrench, DollarSign, BarChart3, FileText } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
    const session = await getSession();
    if (session?.role !== 'admin') {
        redirect('/dashboard');
    }

    const analytics = await getAnalyticsDashboard();

    if ('error' in analytics) {
        return (
            <div className="dashboard-container">
                <div className="alert alert-error">{analytics.error}</div>
            </div>
        );
    }

    const stats = [
        {
            title: "Today's Revenue",
            value: `₹${analytics.todayRevenue?.toLocaleString() || 0}`,
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            link: '/dashboard/reports/revenue'
        },
        {
            title: "This Month Revenue",
            value: `₹${analytics.monthRevenue?.toLocaleString() || 0}`,
            icon: TrendingUp,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            link: '/dashboard/reports/revenue'
        },
        {
            title: "Completed Jobs",
            value: analytics.completedJobs?.toString() || '0',
            icon: Wrench,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            link: '/dashboard/reports/mechanics'
        },
        {
            title: "Repeat Customers",
            value: analytics.repeatCustomers?.toString() || '0',
            icon: Users,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            link: '/dashboard/reports/customers'
        }
    ];

    const reports = [
        {
            title: 'Revenue Analysis',
            description: 'Daily and monthly revenue breakdown with trends',
            icon: DollarSign,
            link: '/dashboard/reports/revenue',
            color: 'text-green-600'
        },
        {
            title: 'Mechanic Performance',
            description: 'Jobs completed and performance metrics per mechanic',
            icon: Wrench,
            link: '/dashboard/reports/mechanics',
            color: 'text-blue-600'
        },
        {
            title: 'Service Popularity',
            description: 'Top services and revenue contribution analysis',
            icon: BarChart3,
            link: '/dashboard/reports/services',
            color: 'text-purple-600'
        },
        {
            title: 'Customer Retention',
            description: 'Repeat customers and visit frequency tracking',
            icon: Users,
            link: '/dashboard/reports/customers',
            color: 'text-orange-600'
        }
    ];

    return (
        <div className="dashboard-container">
            <div className="page-header mb-8">
                <div>
                    <h1 className="page-title">Reports & Analytics</h1>
                    <p className="page-subtitle">Business intelligence and performance insights</p>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <Link
                        key={index}
                        href={stat.link}
                        className={`card p-6 rounded-3xl border-2 ${stat.borderColor} ${stat.bgColor} hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bgColor} border ${stat.borderColor}`}>
                                <stat.icon size={24} className={stat.color} />
                            </div>
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                            {stat.title}
                        </h3>
                        <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                    </Link>
                ))}
            </div>

            {/* Detailed Reports */}
            <div className="card p-8 rounded-3xl">
                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    <FileText size={24} className="text-primary" />
                    Detailed Reports
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reports.map((report, index) => (
                        <Link
                            key={index}
                            href={report.link}
                            className="p-6 rounded-2xl border-2 border-slate-200 hover:border-primary hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer bg-white"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                    <report.icon size={24} className={report.color} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-black text-slate-900 mb-1">{report.title}</h3>
                                    <p className="text-sm text-slate-500">{report.description}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
                <p className="text-sm text-blue-900">
                    <strong className="font-black">Note:</strong> All reports show data from BILLED jobs only. This ensures accurate financial tracking and business insights.
                </p>
            </div>
        </div>
    );
}

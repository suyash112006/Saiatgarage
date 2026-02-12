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
            <nav className="breadcrumbs text-muted mb-2">
                <Link href="/dashboard" className="breadcrumb-item hover:text-primary transition-colors">Dashboard</Link>
                <span className="breadcrumb-separator mx-2">/</span>
                <span className="breadcrumb-item active text-primary font-bold">Reports & Analytics</span>
            </nav>

            <div className="page-header mb-8">
                <div>
                    <h1 className="page-title">Reports & Analytics</h1>
                    <p className="page-subtitle text-slate-500">Business intelligence and performance insights</p>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 w-full">
                {stats.map((stat, index) => (
                    <Link
                        key={index}
                        href={stat.link}
                        className="stat-card p-6 rounded-2xl bg-white border-2 border-slate-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bgColor} flex items-center justify-center border ${stat.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon size={22} className={stat.color} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.title}</div>
                                <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Detailed Reports */}
            <div className="card p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <FileText size={20} />
                    </div>
                    Business Analysis Modules
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reports.map((report, index) => (
                        <Link
                            key={index}
                            href={report.link}
                            className="p-6 rounded-2xl border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all group bg-white"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                    <report.icon size={22} className={report.color + " group-hover:text-white"} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-black text-slate-900 mb-0.5">{report.title}</h3>
                                    <p className="text-xs text-slate-500 font-bold">{report.description}</p>
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

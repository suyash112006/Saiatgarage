import { getSession } from '@/app/actions/auth';
import { Zap } from 'lucide-react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import DashboardStats from '@/components/DashboardStats';
import RecentActivity from '@/components/RecentActivity';
import { StatsSkeleton, RecentActivitySkeleton } from '@/components/DashboardSkeletons';

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    return (
        <div className="dashboard-container">
            <nav className="breadcrumbs mb-4">
                <span className="breadcrumb-item active text-primary font-bold">Dashboard Overview</span>
            </nav>

            <div className="page-header mb-8">
                <div>
                    <h1 className="page-title text-[var(--text-main)]">Welcome, {session.name}</h1>
                    <p className="page-subtitle text-[var(--text-muted)]">
                        {new Date().toLocaleDateString('en-IN', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </p>
                </div>
            </div>

            <div className="mb-8">
                <Link href="/dashboard/customers/add" className="btn btn-primary btn-lg shadow-xl shadow-primary/30 flex items-center justify-center py-6 gap-3 rounded-[2rem] w-full text-xl font-black uppercase tracking-wider">
                    <Zap size={28} />
                    Open New Job Card
                </Link>
            </div>

            <Suspense fallback={<RecentActivitySkeleton />}>
                <RecentActivity />
            </Suspense>

            <Suspense fallback={<StatsSkeleton />}>
                <DashboardStats role={session.role} userId={session.id} />
            </Suspense>
        </div>
    );
}

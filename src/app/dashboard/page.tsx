import { getSession } from '@/app/actions/auth';
import db from '@/lib/db';
import { ClipboardList, CheckCircle, Clock, Search, User, Zap, Activity, Plus, Car } from 'lucide-react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getRecentActivity } from '@/app/actions/search';
import DashboardSearch from '@/components/DashboardSearch';

async function getAdminStats() {
    // Phase 1: OPEN, IN_PROGRESS, COMPLETED, BILLED
    const openJobs = db.prepare("SELECT COUNT(*) as count FROM job_cards WHERE status = 'OPEN'").get() as any;
    const activeJobs = db.prepare("SELECT COUNT(*) as count FROM job_cards WHERE status = 'IN_PROGRESS'").get() as any;
    const completedMonth = db.prepare("SELECT COUNT(*) as count FROM job_cards WHERE status IN ('COMPLETED', 'BILLED') AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')").get() as any;

    return {
        open: openJobs.count || 0,
        active: activeJobs.count || 0,
        completed: completedMonth.count || 0
    };
}

async function getMechanicStats(userId: number) {
    const open = db.prepare("SELECT COUNT(*) as count FROM job_cards WHERE assigned_mechanic_id = ? AND status = 'OPEN'").get(userId) as any;
    const inProgress = db.prepare("SELECT COUNT(*) as count FROM job_cards WHERE assigned_mechanic_id = ? AND status = 'IN_PROGRESS'").get(userId) as any;
    const completed = db.prepare("SELECT COUNT(*) as count FROM job_cards WHERE assigned_mechanic_id = ? AND status = 'COMPLETED'").get(userId) as any;

    return {
        open: open.count || 0,
        inProgress: inProgress.count || 0,
        completed: completed.count || 0
    };
}

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const isAdmin = session.role === 'admin';
    const stats: any = isAdmin ? await getAdminStats() : await getMechanicStats(session.id);
    const recentActivity = await getRecentActivity();

    // Fetch assigned jobs for mechanics
    const myJobs = !isAdmin ? db.prepare(`
        SELECT j.*, v.model, v.vehicle_number, c.name as customer_name
        FROM job_cards j
        JOIN vehicles v ON j.vehicle_id = v.id
        JOIN customers c ON j.customer_id = c.id
        WHERE j.assigned_mechanic_id = ? AND j.status NOT IN ('COMPLETED', 'BILLED')
        ORDER BY j.created_at DESC
        LIMIT 5
    `).all(session.id) as any[] : [];

    return (
        <div className="dashboard-container">
            <nav className="breadcrumbs text-muted mb-2">
                <span className="breadcrumb-item active text-primary font-bold">Dashboard Overview</span>
            </nav>

            <div className="page-header mb-8">
                <div>
                    <h1 className="page-title">Welcome, {session.name}</h1>
                    <p className="page-subtitle text-slate-500">
                        {new Date().toLocaleDateString('en-IN', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </p>
                </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <Link href="/dashboard/customers/add" className="btn btn-primary btn-lg shadow-xl shadow-primary/30 flex items-center justify-center py-6 gap-3 rounded-[2rem] w-full text-xl font-black uppercase tracking-wider">
                    <Zap size={28} />
                    Open New Job Card
                </Link>
            </div>
            <div style={{ marginBottom: '40px' }}>
                <DashboardSearch initialActivity={recentActivity} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {isAdmin ? (
                    <>
                        <div className="stat-card p-6 rounded-2xl bg-white border-2 border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <Activity size={18} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Open</div>
                                        <div className="text-2xl font-black text-slate-900">{stats.open}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="stat-card p-6 rounded-2xl bg-white border-2 border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                                        <Clock size={18} className="text-orange-500" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">In Progress</div>
                                        <div className="text-2xl font-black text-slate-900">{stats.active}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="stat-card p-6 rounded-2xl bg-white border-2 border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                                        <CheckCircle size={18} className="text-green-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Monthly Done</div>
                                        <div className="text-2xl font-black text-slate-900">{stats.completed}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="stat-card p-6 rounded-2xl bg-white border-2 border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <ClipboardList size={18} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Open Jobs</div>
                                        <div className="text-2xl font-black text-slate-900">{stats.open}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="stat-card p-6 rounded-2xl bg-white border-2 border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                                        <Clock size={18} className="text-orange-500" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">In Progress</div>
                                        <div className="text-2xl font-black text-slate-900">{stats.inProgress}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="stat-card p-6 rounded-3xl border border-slate-100 shadow-sm bg-white">
                            <div className="stat-icon bg-green-50 text-green-600 mb-4">
                                <CheckCircle size={20} />
                            </div>
                            <div className="stat-label text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Completed</div>
                            <div className="stat-value text-3xl font-black text-slate-900">{stats.completed}</div>
                        </div>
                    </>
                )}
            </div>



            {
                !isAdmin && myJobs.length === 0 && (
                    <div className="card p-8 text-center bg-slate-50 border-dashed border-slate-200 rounded-3xl">
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No active jobs assigned to you</p>
                    </div>
                )
            }

            {
                !isAdmin && myJobs.length > 0 && (
                    <div className="space-y-4">
                        {myJobs.map((job) => (
                            <Link href={`/dashboard/jobs/${job.id}`} key={job.id} className="card p-5 rounded-3xl border border-slate-100 flex items-center justify-between hover:shadow-md transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Car size={24} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-slate-900">{job.model}</div>
                                        <div className="text-[10px] font-mono font-bold text-primary uppercase">{job.vehicle_number}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${job.status === 'OPEN' ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-600'}`}>
                                        {job.status}
                                    </span>
                                    <div className="text-[10px] text-slate-400 mt-1 font-bold">{job.customer_name}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )
            }
        </div >
    );
}
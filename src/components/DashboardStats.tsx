import { getAdminStats, getMechanicStats } from '@/app/actions/stats';
import { Activity, Clock, CheckCircle, ClipboardList } from 'lucide-react';

interface DashboardStatsProps {
    role: string;
    userId: number;
}

export default async function DashboardStats({ role, userId }: DashboardStatsProps) {
    const isAdmin = role === 'admin';
    const stats: any = await (isAdmin ? getAdminStats() : getMechanicStats(userId));

    if (isAdmin) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 w-full">
                <div className="stat-card p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:shadow-2xl hover:border-blue-500/20 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800/30">
                                <Activity size={22} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Open</div>
                                <div className="text-3xl font-black text-[var(--text-main)]">{stats.open}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stat-card p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:shadow-2xl hover:border-orange-500/20 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center border border-orange-100 dark:border-orange-800/30">
                                <Clock size={22} className="text-orange-500 dark:text-orange-400" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">In Progress</div>
                                <div className="text-3xl font-black text-[var(--text-main)]">{stats.active}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stat-card p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:shadow-2xl hover:border-green-500/20 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center border border-green-100 dark:border-green-800/30">
                                <CheckCircle size={22} className="text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Monthly Done</div>
                                <div className="text-3xl font-black text-[var(--text-main)]">{stats.completed}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Mechanic View
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 w-full">
            <div className="stat-card p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:shadow-2xl hover:border-blue-500/20 transition-all duration-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800/30">
                            <ClipboardList size={22} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Open Jobs</div>
                            <div className="text-3xl font-black text-[var(--text-main)]">{stats.open}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="stat-card p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:shadow-2xl hover:border-orange-500/20 transition-all duration-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center border border-orange-100 dark:border-orange-800/30">
                            <Clock size={22} className="text-orange-500 dark:text-orange-400" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">In Progress</div>
                            <div className="text-3xl font-black text-[var(--text-main)]">{stats.inProgress}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="stat-card p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:shadow-2xl hover:border-green-500/20 transition-all duration-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center border border-green-100 dark:border-green-800/30">
                            <CheckCircle size={22} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Completed</div>
                            <div className="text-3xl font-black text-[var(--text-main)]">{stats.completed}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

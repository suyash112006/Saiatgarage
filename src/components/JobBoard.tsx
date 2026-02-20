import { getSession } from '@/app/actions/auth';
import db from '@/lib/db';
import JobRow from '@/components/JobRow';
import { Clock } from 'lucide-react';

async function getJobs(status?: string, role?: string, userId?: number) {
    let query = `
    SELECT j.*, c.name as customer_name, v.model, v.vehicle_number, u.name as mechanic_name
    FROM job_cards j
    JOIN customers c ON j.customer_id = c.id
    JOIN vehicles v ON j.vehicle_id = v.id
    LEFT JOIN users u ON j.assigned_mechanic_id = u.id
  `;

    const whereClauses = [];
    const params = [];

    let paramIdx = 1;

    if (status && status !== 'ALL') {
        whereClauses.push(`j.status = $${paramIdx++}`);
        params.push(status);
    }

    if (role === 'mechanic' && userId) {
        whereClauses.push(`j.assigned_mechanic_id = $${paramIdx++}`);
        params.push(userId);
    }

    // Always exclude soft-deleted jobs
    whereClauses.push(`j.deleted_at IS NULL`);

    if (whereClauses.length > 0) {
        query += ` WHERE ` + whereClauses.join(' AND ');
    }

    query += ` ORDER BY j.created_at DESC `;

    const res = await db.query(query, params);
    return res.rows;
}

interface JobBoardProps {
    status: string;
}

export default async function JobBoard({ status }: JobBoardProps) {
    const session = await getSession();
    const isAdmin = session?.role === 'admin';
    const jobs = await getJobs(status, session?.role, session?.id);

    return (
        <div className="card shadow-sm border-slate-100 rounded-3xl overflow-hidden">
            <div className="table-responsive">
                <table className="data-table">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">ID</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Vehicle & Model</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Assignee</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                            {isAdmin && (
                                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {jobs.length === 0 ? (
                            <tr>
                                <td colSpan={isAdmin ? 7 : 6} className="py-20 text-center">
                                    <div className="flex flex-col items-center opacity-40">
                                        <Clock size={48} className="mb-4" />
                                        <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">No jobs found in this category</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            jobs.map((job: any) => (
                                <JobRow key={job.id} job={job} isAdmin={isAdmin} />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

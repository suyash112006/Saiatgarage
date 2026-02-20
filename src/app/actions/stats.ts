'use server';

import db from '@/lib/db';

export async function getAdminStats() {
    // Phase 1: OPEN, IN_PROGRESS, COMPLETED, BILLED
    const [openRes, activeRes, completedRes] = await Promise.all([
        db.query("SELECT COUNT(*) as count FROM job_cards WHERE status = 'OPEN'"),
        db.query("SELECT COUNT(*) as count FROM job_cards WHERE status = 'IN_PROGRESS'"),
        db.query("SELECT COUNT(*) as count FROM job_cards WHERE status IN ('COMPLETED', 'BILLED') AND TO_CHAR(created_at, 'YYYY-MM') = TO_CHAR(CURRENT_DATE, 'YYYY-MM')")
    ]);

    return {
        open: Number(openRes.rows[0]?.count || 0),
        active: Number(activeRes.rows[0]?.count || 0),
        completed: Number(completedRes.rows[0]?.count || 0)
    };
}

export async function getMechanicStats(userId: number) {
    const [openRes, inProgressRes, completedRes] = await Promise.all([
        db.query("SELECT COUNT(*) as count FROM job_cards WHERE assigned_mechanic_id = $1 AND status = 'OPEN'", [userId]),
        db.query("SELECT COUNT(*) as count FROM job_cards WHERE assigned_mechanic_id = $1 AND status = 'IN_PROGRESS'", [userId]),
        db.query("SELECT COUNT(*) as count FROM job_cards WHERE assigned_mechanic_id = $1 AND status = 'COMPLETED'", [userId])
    ]);

    return {
        open: Number(openRes.rows[0]?.count || 0),
        inProgress: Number(inProgressRes.rows[0]?.count || 0),
        completed: Number(completedRes.rows[0]?.count || 0)
    };
}

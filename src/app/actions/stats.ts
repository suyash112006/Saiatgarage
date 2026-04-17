'use server';

import db from '@/lib/db';
import { cache } from 'react';

export const getAdminStats = cache(async () => {
    try {
        const res = await db.query(`
            SELECT 
                SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) as open,
                SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status IN ('COMPLETED', 'BILLED') AND TO_CHAR(created_at, 'YYYY-MM') = TO_CHAR(CURRENT_DATE, 'YYYY-MM') THEN 1 ELSE 0 END) as completed
            FROM job_cards
            WHERE deleted_at IS NULL
        `);
        
        const stats = res.rows[0];
        return {
            open: Number(stats?.open || 0),
            active: Number(stats?.active || 0),
            completed: Number(stats?.completed || 0)
        };
    } catch (err) {
        console.error('getAdminStats error:', err);
        return { open: 0, active: 0, completed: 0 };
    }
});

export const getMechanicStats = cache(async (userId: number) => {
    try {
        const res = await db.query(`
            SELECT 
                SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) as open,
                SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed
            FROM job_cards
            WHERE assigned_mechanic_id = $1 AND deleted_at IS NULL
        `, [userId]);

        const stats = res.rows[0];
        return {
            open: Number(stats?.open || 0),
            inProgress: Number(stats?.active || 0),
            completed: Number(stats?.completed || 0)
        };
    } catch (err) {
        console.error('getMechanicStats error:', err);
        return { open: 0, inProgress: 0, completed: 0 };
    }
});

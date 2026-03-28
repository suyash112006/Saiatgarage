'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

import { getSession } from './auth';

export async function createNotification(
    message: string,
    type: 'JOB' | 'CUSTOMER' | 'VEHICLE' | 'OTHER' = 'OTHER',
    referenceId?: number | string,
    recipientId?: number,
    recipientRole?: string
) {
    try {
        await db.query(`
            INSERT INTO notifications (message, type, reference_id, recipient_id, recipient_role)
            VALUES ($1, $2, $3, $4, $5)
        `, [message, type, referenceId || null, recipientId || null, recipientRole || null]);

        // Revalidate layout to update badges/lists
        revalidatePath('/dashboard');
        return { success: true };
    } catch (err) {
        console.error('Failed to create notification:', err);
        return { error: 'Failed' };
    }
}

export async function getUnreadNotifications() {
    const session = await getSession();
    if (!session) return [];

    try {
        let sql = '';
        let params: any[] = [];

        if (session.role === 'admin') {
            // Admin only sees notifications explicitly flagged for them (e.g. from mechanics)
            sql = `
                SELECT * FROM notifications 
                WHERE is_read = 0 
                AND recipient_role = 'admin'
                ORDER BY created_at DESC 
                LIMIT 20
            `;
            params = [];
        } else if (session.role === 'mechanic') {
            // Mechanic exclusively sees direct assignments
            sql = `
                SELECT * FROM notifications 
                WHERE is_read = 0 
                AND recipient_id = $1
                ORDER BY created_at DESC 
                LIMIT 20
            `;
            params = [session.id];
        } else {
            // Other roles see global alerts + personal alerts
            sql = `
                SELECT * FROM notifications 
                WHERE is_read = 0 
                AND (
                    (recipient_id IS NULL AND recipient_role IS NULL) 
                    OR (recipient_id = $1)
                    OR (recipient_role = $2)
                )
                ORDER BY created_at DESC 
                LIMIT 20
            `;
            params = [session.id, session.role];
        }

        const res = await db.query(sql, params);
        return res.rows;
    } catch (err) {
        console.error('Error fetching notifications:', err);
        return [];
    }
}

export async function markNotificationRead(id: number) {
    try {
        await db.query('UPDATE notifications SET is_read = 1 WHERE id = $1', [id]);
        revalidatePath('/dashboard');
        return { success: true };
    } catch (err) {
        return { error: 'Failed' };
    }
}

export async function markAllNotificationsRead() {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    try {
        if (session.role === 'admin') {
            await db.query("UPDATE notifications SET is_read = 1 WHERE is_read = 0 AND recipient_role = 'admin'");
        } else if (session.role === 'mechanic') {
            await db.query("UPDATE notifications SET is_read = 1 WHERE is_read = 0 AND recipient_id = $1", [session.id]);
        } else {
            await db.query(`
                UPDATE notifications SET is_read = 1 
                WHERE is_read = 0 
                AND (
                    (recipient_id IS NULL AND recipient_role IS NULL) 
                    OR (recipient_id = $1)
                    OR (recipient_role = $2)
                )
            `, [session.id, session.role]);
        }
        revalidatePath('/dashboard');
        return { success: true };
    } catch (err) {
        return { error: 'Failed' };
    }
}

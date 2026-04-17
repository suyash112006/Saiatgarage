'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { updateJobTotals } from '@/lib/job-utils';
import { getSession } from '@/app/actions/auth';
import { cache } from 'react';

export const getGeneralSettings = cache(async () => {
    try {
        const res = await db.query('SELECT key, value FROM settings');
        const settings: Record<string, string> = {};
        res.rows.forEach((row: any) => { settings[row.key] = row.value; });
        return { settings };
    } catch (err) {
        console.error('Error fetching settings:', err);
        return { error: 'Failed to fetch settings', settings: {} as Record<string, string> };
    }
});

export async function updateGeneralSettings(formData: FormData) {
    // ─── Admin only ───
    const session = await getSession();
    if (!session) return { error: 'Unauthorized - please log in again' };
    if (session.role !== 'admin') return { error: 'Only admins can change general settings' };

    const garageName = (formData.get('garageName') as string)?.trim();
    const taxRateRaw = formData.get('taxRate') as string;
    const taxRate = parseFloat(taxRateRaw);

    // ─── Validation ───
    if (!garageName || garageName.length < 2) {
        return { error: 'Garage name must be at least 2 characters' };
    }
    if (garageName.length > 100) {
        return { error: 'Garage name cannot exceed 100 characters' };
    }
    if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
        return { error: 'Tax rate must be between 0 and 100' };
    }

    const taxRateFormatted = parseFloat(taxRate.toFixed(2)).toString();

    try {
        // Upsert both settings
        await db.query(
            `INSERT INTO settings (key, value) VALUES ('garage_name', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
            [garageName]
        );
        await db.query(
            `INSERT INTO settings (key, value) VALUES ('tax_rate', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
            [taxRateFormatted]
        );

        // Recalculate totals for all non-deleted active jobs so tax change reflects immediately
        const activeJobsRes = await db.query(
            `SELECT id FROM job_cards WHERE status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED') AND deleted_at IS NULL`
        );
        for (const job of activeJobsRes.rows) {
            try {
                await updateJobTotals(job.id);
            } catch (jobErr) {
                console.warn(`Failed to update totals for job ${job.id}:`, jobErr);
            }
        }

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/settings');
        revalidatePath('/dashboard/jobs');

        console.log(`✅ Settings updated by ${session.name}: garage="${garageName}", tax=${taxRateFormatted}%`);
        return { success: true };
    } catch (err: any) {
        console.error('Error updating settings:', err);
        return { error: `Failed to save settings: ${err.message}` };
    }
}

// ─── Get a single setting value ───
export async function getSetting(key: string): Promise<string | null> {
    try {
        const res = await db.query('SELECT value FROM settings WHERE key = $1', [key]);
        return res.rows[0]?.value ?? null;
    } catch {
        return null;
    }
}

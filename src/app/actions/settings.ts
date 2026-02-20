'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { updateJobTotals } from '@/lib/job-utils';

export async function getGeneralSettings() {
    try {
        const res = await db.query('SELECT key, value FROM settings');
        const rows = res.rows;
        const settings: Record<string, string> = {};
        rows.forEach((row: any) => {
            settings[row.key] = row.value;
        });
        return { settings };
    } catch (err) {
        console.error('Error fetching settings:', err);
        return { error: 'Failed to fetch settings' };
    }
}

export async function updateGeneralSettings(formData: FormData) {
    const garageName = formData.get('garageName') as string;
    const taxRate = formData.get('taxRate') as string;

    try {
        const queries = [
            `INSERT INTO settings (key, value) VALUES ('garage_name', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
            `INSERT INTO settings (key, value) VALUES ('tax_rate', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`
        ];

        // Postgres doesn't support INSERT OR REPLACE. Use ON CONFLICT.
        // Assuming 'key' is PRIMARY KEY or UNIQUE
        await db.query(queries[0], [garageName]);
        await db.query(queries[1], [taxRate]);

        // Auto-update totals for all active/recent jobs to reflect new Tax Rate
        const activeJobsRes = await db.query("SELECT id FROM job_cards WHERE status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'BILLED')");
        const activeJobs = activeJobsRes.rows;

        for (const job of activeJobs) {
            await updateJobTotals(job.id);
        }

        revalidatePath('/dashboard/settings');
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/jobs'); // Refresh jobs list tokens

        return { success: true };
    } catch (err) {
        console.error('Error updating settings:', err);
        return { error: 'Failed to update settings' };
    }
}

'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { updateJobTotals } from '@/lib/job-utils';

export async function getGeneralSettings() {
    try {
        const rows = db.prepare('SELECT key, value FROM settings').all() as any[];
        const settings: Record<string, string> = {};
        rows.forEach(row => {
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
        db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('garage_name', garageName);
        db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('tax_rate', taxRate);

        // Auto-update totals for all active jobs to reflect new Tax Rate
        const activeJobs = db.prepare("SELECT id FROM job_cards WHERE status IN ('OPEN', 'IN_PROGRESS')").all() as { id: number }[];
        for (const job of activeJobs) {
            updateJobTotals(job.id);
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

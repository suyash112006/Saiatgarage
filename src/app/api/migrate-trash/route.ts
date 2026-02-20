import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        // Add soft-delete column to customers
        await db.query(`
            ALTER TABLE customers
            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
        `);

        // Add soft-delete column to job_cards
        await db.query(`
            ALTER TABLE job_cards
            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
        `);

        // Index for fast trash queries
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_customers_deleted_at ON customers(deleted_at);
            CREATE INDEX IF NOT EXISTS idx_job_cards_deleted_at ON job_cards(deleted_at);
        `);

        return NextResponse.json({ success: true, message: 'Trash columns migrated successfully' });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

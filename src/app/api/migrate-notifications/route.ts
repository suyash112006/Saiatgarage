import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        await db.query(`
            ALTER TABLE notifications 
            ADD COLUMN IF NOT EXISTS recipient_id INTEGER NULL,
            ADD COLUMN IF NOT EXISTS recipient_role VARCHAR(20) NULL;
        `);
        return NextResponse.json({ success: true, message: 'Notifications table migrated' });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

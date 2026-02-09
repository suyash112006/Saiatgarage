import { NextResponse } from 'next/server';
import db, { getDbProvider } from '@/lib/db';

export async function GET() {
    const provider = getDbProvider();
    const url = process.env.DATABASE_URL;

    // Mask the password in the URL for security
    const maskedUrl = url ? url.replace(/:([^@]+)@/, ':****@') : 'NOT DEFINED';

    const report: any = {
        timestamp: new Date().toISOString(),
        provider: provider,
        env: {
            DATABASE_URL_DEFINED: !!url,
            DATABASE_URL_MASKED: maskedUrl,
            NODE_ENV: process.env.NODE_ENV
        },
        tests: {}
    };

    try {
        console.log(`Running diagnostic test for provider: ${provider}`);
        const start = Date.now();
        const res = await db.query('SELECT 1 as connection_test');
        const end = Date.now();

        report.tests.connection = {
            success: true,
            latency: `${end - start}ms`,
            result: res.rows[0]
        };

        // If it's postgres, check the time to confirm it's really pg
        if (provider === 'postgres') {
            const timeRes = await db.query('SELECT NOW() as cloud_time');
            report.tests.cloud_sync = {
                success: true,
                time: timeRes.rows[0].cloud_time
            };
        }

        // Check user count as a sanity check
        const userRes = await db.query('SELECT COUNT(*) as user_count FROM users');
        report.tests.data_integrity = {
            success: true,
            user_count: userRes.rows[0].user_count
        };

    } catch (err: any) {
        console.error('Diagnostic test failed:', err);
        report.tests.connection = {
            success: false,
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        };
    }

    return NextResponse.json(report);
}

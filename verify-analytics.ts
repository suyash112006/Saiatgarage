import { getAnalyticsDashboard } from './src/app/actions/analytics';

async function main() {
    console.log('--- Verifying Analytics (SQLite Fallback) ---');
    // Ensure DATABASE_URL is not set to postgres
    process.env.DATABASE_URL = "postgresql://postgres:Z6fwq2rt.t*!XHn@db.tfftxnsqoukllkvvmifz.supabase.co:5432/postgres";

    try {
        const result = await getAnalyticsDashboard();
        console.log('✅ Analytics Query Success (Supabase):', result);
    } catch (err: any) {
        console.error('❌ Analytics Query Failed (Supabase):', err.message);
    }
}

main().catch(console.error);

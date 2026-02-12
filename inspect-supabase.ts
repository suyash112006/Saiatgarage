import { query } from './src/lib/db';

async function main() {
    process.env.DATABASE_URL = "postgresql://postgres:Z6fwq2rt.t*!XHn@db.tfftxnsqoukllkvvmifz.supabase.co:5432/postgres";
    console.log('--- Inspecting Supabase Schema ---');
    try {
        const res = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        console.log('Users table columns:');
        console.table(res.rows);

        const res2 = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'job_cards'
        `);
        console.log('Job Cards table columns:');
        console.table(res2.rows);
    } catch (err: any) {
        console.error('❌ Inspection failed:', err.message);
    }
}

main().catch(console.error);

import db from './src/lib/db';

async function checkUsers() {
    process.env.DATABASE_URL = "postgresql://postgres:Z6fwq2rt.t*!XHn@db.tfftxnsqoukllkvvmifz.supabase.co:5432/postgres";

    console.log('--- Checking Users Table ---');
    try {
        const res = await db.query('SELECT id, email, username, password, role, is_active FROM users');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err: any) {
        console.error('❌ Check Failed:', err.message);
    }
}

checkUsers().catch(console.error);

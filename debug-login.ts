import { loginAction } from './src/app/actions/auth';
import db from './src/lib/db';

// Mock Next.js cookies
(global as any).cookies = () => ({
    set: () => { },
    get: () => { },
    delete: () => { }
});

async function testLogin() {
    process.env.DATABASE_URL = "postgresql://postgres:Z6fwq2rt.t*!XHn@db.tfftxnsqoukllkvvmifz.supabase.co:5432/postgres";

    console.log('--- Debugging loginAction ---');

    // Mimic formData
    const formData = new FormData();
    formData.append('email', 'admin@garage.com');
    formData.append('password', 'admin123');

    try {
        console.log('Calling loginAction...');
        const result = await loginAction(formData);
        console.log('Result:', result);
    } catch (err: any) {
        console.error('❌ loginAction Crashed:', err.message);
        if (err.stack) console.error(err.stack);
    }
}

async function testLoginQuery() {
    process.env.DATABASE_URL = "postgresql://postgres:Z6fwq2rt.t*!XHn@db.tfftxnsqoukllkvvmifz.supabase.co:5432/postgres";

    console.log('--- Debugging Login Query ---');
    const email = 'admin@garage.com';
    const queryStr = 'SELECT id, name, email, username, password, role, is_active FROM users WHERE (email = $1 OR username = $1)';
    const params = [email];

    try {
        console.log('Executing query...');
        const res = await db.query(queryStr, params);
        console.log('✅ Query Success!');
        console.log('Rows found:', res.rows.length);
        if (res.rows.length > 0) {
            console.log('User data:', { ...res.rows[0], password: '[REDACTED]' });
        } else {
            console.log('❌ No user found with that email.');
        }
    } catch (err: any) {
        console.error('❌ Query Failed:', err.message);
    }
}

testLogin().catch(console.error);
testLoginQuery().catch(console.error);

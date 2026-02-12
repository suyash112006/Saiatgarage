import { query } from './src/lib/db';
import fs from 'fs';
import path from 'path';

// Manually load .env
try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.join('=').trim();
        }
    });
    console.log('--- Environment Variables Loaded ---');
} catch (err) {
    console.warn('⚠️ Could not load .env file manually');
}

async function verifyNeon() {
    console.log('--- Verifying Neon PostgreSQL Connection ---');
    try {
        const timeRes = await query('SELECT NOW() as neon_time');
        console.log('✅ Connection Successful! Neon time:', timeRes.rows[0].neon_time);

        const tablesRes = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Existing tables in public schema:');
        console.table(tablesRes.rows);

        if (tablesRes.rows.length === 0) {
            console.log('⚠️ No tables found. Database needs initialization.');
        } else {
            const userCount = await query('SELECT COUNT(*) as count FROM users');
            console.log('User count:', userCount.rows[0].count);
        }
    } catch (err: any) {
        console.error('❌ Neon Connection Failed:', err.message);
    }
}

verifyNeon().catch(console.error);

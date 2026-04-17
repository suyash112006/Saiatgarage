import { Pool } from 'pg';

const DATABASE_URL = 'postgresql://neondb_owner:npg_Kqo5JtxEyL2d@ep-billowing-dream-a1586b9e-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('--- Adding category column to parts table ---');
    const client = await pool.connect();
    try {
        await client.query("ALTER TABLE parts ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General'");
        console.log('✅ Done: category column added (or already exists) in parts table');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();

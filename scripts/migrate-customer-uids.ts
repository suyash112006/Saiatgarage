import { Pool } from 'pg';

const DATABASE_URL = 'postgresql://neondb_owner:npg_Kqo5JtxEyL2d@ep-billowing-dream-a1586b9e-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('--- Starting Customer UID Migration ---');
    const client = await pool.connect();
    try {
        // 1. Add column
        console.log('Adding customer_no column...');
        await client.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_no INTEGER UNIQUE');

        // 2. Fetch all customers ordered by id (creation order)
        console.log('Fetching existing customers...');
        const res = await client.query('SELECT id FROM customers ORDER BY id ASC');
        
        console.log(`Found ${res.rowCount} customers to backfill.`);

        // 3. Backfill sequential numbers
        for (let i = 0; i < res.rows.length; i++) {
            const customerId = res.rows[i].id;
            const seqNo = i + 1;
            console.log(`Setting customer_no = ${seqNo} for ID ${customerId}`);
            await client.query('UPDATE customers SET customer_no = $1 WHERE id = $2', [seqNo, customerId]);
        }

        console.log('✅ Migration successful!');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();

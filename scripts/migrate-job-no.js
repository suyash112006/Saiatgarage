const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migration...');
        const res = await client.query(`
      UPDATE job_cards j
      SET job_no = sub.new_id::text
      FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as new_id
        FROM job_cards
      ) sub
      WHERE j.id = sub.id
    `);
        console.log(`✅ Successfully updated ${res.rowCount} job cards.`);
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();

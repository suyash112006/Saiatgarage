const { Pool } = require('pg');

const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_Kqo5JtxEyL2d@ep-billowing-dream-a1586b9e-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

async function checkJobs() {
    try {
        const res = await pool.query('SELECT id, job_no, deleted_at FROM job_cards ORDER BY id DESC LIMIT 20');
        console.log('ID | Job No | Deleted At');
        console.log('---|--------|------------');
        res.rows.forEach(row => {
            console.log(`${row.id.toString().padEnd(3)}| ${row.job_no?.toString().padEnd(7)}| ${row.deleted_at}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkJobs();

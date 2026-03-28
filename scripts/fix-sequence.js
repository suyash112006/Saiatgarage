const { Pool } = require('pg');

const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_Kqo5JtxEyL2d@ep-billowing-dream-a1586b9e-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

async function renumberJob() {
    try {
        // ID 35 is Job #10 from previous check
        const res = await pool.query("UPDATE job_cards SET job_no = '6' WHERE id = 35 RETURNING id, job_no");
        if (res.rowCount > 0) {
            console.log(`Successfully renumbered ID ${res.rows[0].id} to Job #${res.rows[0].job_no}`);
        } else {
            console.log('No Job with ID 35 found.');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

renumberJob();

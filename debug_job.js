
const db = require('better-sqlite3')('garage.db');

const jobId = 1;

console.log(`Checking Job ID: ${jobId}`);

// 1. Check if job exists
const job = db.prepare('SELECT * FROM job_cards WHERE id = ?').get(jobId);
console.log('Job Record:', job);

if (job) {
    // 2. Check Customer
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(job.customer_id);
    console.log('Customer Record:', customer);

    // 3. Check Vehicle
    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(job.vehicle_id);
    console.log('Vehicle Record:', vehicle);

    // 4. Test the JOIN query used in getJobDetails
    const joinQuery = `
      SELECT j.*, 
             c.name as customer_name, c.mobile, c.address,
             v.brand, v.model, v.vehicle_number, v.fuel_type
      FROM job_cards j
      JOIN customers c ON j.customer_id = c.id
      JOIN vehicles v ON j.vehicle_id = v.id
      WHERE j.id = ?
    `;
    const joinResult = db.prepare(joinQuery).get(jobId);
    console.log('JOIN Query Result:', joinResult);
} else {
    console.log('Job does not exist in job_cards table.');
}

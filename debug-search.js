
const db = require('better-sqlite3')('garage.db');

function searchGeneral(query) {
    if (!query || query.length < 2) return [];

    const searchTerm = `%${query}%`;
    console.log(`Searching for: ${query} (${searchTerm})`);

    try {
        // Search Customers
        const customers = db.prepare(`
      SELECT id, name, mobile as phone, 'customer' as type 
      FROM customers 
      WHERE name LIKE ? OR mobile LIKE ?
      LIMIT 5
    `).all(searchTerm, searchTerm);

        console.log(`Found ${customers.length} customers`);

        // Search Vehicles
        const vehicles = db.prepare(`
      SELECT v.id, v.vehicle_number, v.brand, v.model, c.name as owner_name, c.id as owner_id, 'vehicle' as type
      FROM vehicles v
      JOIN customers c ON v.customer_id = c.id
      WHERE v.vehicle_number LIKE ?
      LIMIT 5
    `).all(searchTerm);
        console.log(`Found ${vehicles.length} vehicles`);

        // Search Job Cards
        const jobs = db.prepare(`
      SELECT j.id, j.status, v.vehicle_number, c.name as customer_name, 'job' as type
      FROM job_cards j
      JOIN vehicles v ON j.vehicle_id = v.id
      JOIN customers c ON j.customer_id = c.id
      WHERE v.vehicle_number LIKE ? OR CAST(j.id AS TEXT) LIKE ?
      LIMIT 5
    `).all(searchTerm, searchTerm);

        console.log(`Found ${jobs.length} jobs`);

        return [...customers, ...vehicles, ...jobs];
    } catch (err) {
        console.error('Search error:', err);
        return [];
    }
}

// Test with a sample query
const customers = db.prepare("SELECT name FROM customers LIMIT 1").get();
if (customers) {
    console.log("Testing with customer name:", customers.name);
    const results = searchGeneral(customers.name.substring(0, 3));
    console.log("Results:", results);
} else {
    console.log("No customers in DB to test with.");
}

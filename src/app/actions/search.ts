'use server';

import db from '@/lib/db';

export async function searchGeneral(query: string) {
  if (!query || query.length < 2) return [];

  const searchTerm = `%${query}%`;

  try {
    // Search Customers
    const customersRes = await db.query(`
      SELECT id, name, mobile as phone, address, 'customer' as type,
             (SELECT id FROM job_cards WHERE customer_id = customers.id ORDER BY id DESC LIMIT 1) as latest_job_id
      FROM customers 
      WHERE name ILIKE $1 OR mobile ILIKE $1
      LIMIT 5
    `, [searchTerm]);
    const customers = customersRes.rows;

    // Search Vehicles
    const vehiclesRes = await db.query(`
      SELECT v.id, v.vehicle_number, v.model, c.name as owner_name, c.id as owner_id, c.mobile, c.address, 'vehicle' as type,
             (SELECT id FROM job_cards WHERE vehicle_id = v.id ORDER BY id DESC LIMIT 1) as latest_job_id
      FROM vehicles v
      JOIN customers c ON v.customer_id = c.id
      WHERE v.vehicle_number ILIKE $1
      LIMIT 5
    `, [searchTerm]);
    const vehicles = vehiclesRes.rows;

    // Search Job Cards (by ID or Vehicle)
    const jobsRes = await db.query(`
      SELECT j.id, j.status, v.vehicle_number, c.name as customer_name, c.mobile, c.address, 'job' as type
      FROM job_cards j
      JOIN vehicles v ON j.vehicle_id = v.id
      JOIN customers c ON j.customer_id = c.id
      WHERE v.vehicle_number ILIKE $1 OR CAST(j.id AS TEXT) ILIKE $1
      LIMIT 5
    `, [searchTerm]);
    const jobs = jobsRes.rows;

    return [...customers, ...vehicles, ...jobs];
  } catch (err) {
    console.error('Search error:', err);
    return [];
  }
}

export async function getRecentActivity() {
  try {
    const recentsRes = await db.query(`
      SELECT 
        c.id, 
        c.name, 
        c.mobile, 
        c.address, 
        'customer' as type,
        (SELECT id FROM job_cards WHERE customer_id = c.id ORDER BY id DESC LIMIT 1) as latest_job_id
      FROM customers c
      ORDER BY c.id DESC
      LIMIT 5
    `);
    const recents = recentsRes.rows;

    return recents;
  } catch (err) {
    console.error('Recent activity error:', err);
    return [];
  }
}

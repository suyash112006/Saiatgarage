'use server';

import db from '@/lib/db';

export async function searchGeneral(query: string) {
  if (!query || query.length < 2) return [];

  const searchTerm = `%${query}%`;

  try {
    // Search Customers
    const customers = db.prepare(`
      SELECT id, name, mobile as phone, address, 'customer' as type,
             (SELECT id FROM job_cards WHERE customer_id = customers.id ORDER BY id DESC LIMIT 1) as latest_job_id
      FROM customers 
      WHERE name LIKE ? OR mobile LIKE ?
      LIMIT 5
    `).all(searchTerm, searchTerm) as any[];

    // Search Vehicles
    const vehicles = db.prepare(`
      SELECT v.id, v.vehicle_number, v.model, c.name as owner_name, c.id as owner_id, c.mobile, c.address, 'vehicle' as type,
             (SELECT id FROM job_cards WHERE vehicle_id = v.id ORDER BY id DESC LIMIT 1) as latest_job_id
      FROM vehicles v
      JOIN customers c ON v.customer_id = c.id
      WHERE v.vehicle_number LIKE ?
      LIMIT 5
    `).all(searchTerm) as any[];

    // Search Job Cards (by ID or Vehicle)
    const jobs = db.prepare(`
      SELECT j.id, j.status, v.vehicle_number, c.name as customer_name, c.mobile, c.address, 'job' as type
      FROM job_cards j
      JOIN vehicles v ON j.vehicle_id = v.id
      JOIN customers c ON j.customer_id = c.id
      WHERE v.vehicle_number LIKE ? OR CAST(j.id AS TEXT) LIKE ?
      LIMIT 5
    `).all(searchTerm, searchTerm) as any[];

    return [...customers, ...vehicles, ...jobs];
  } catch (err) {
    console.error('Search error:', err);
    return [];
  }
}

export async function getRecentActivity() {
  try {
    const recents = db.prepare(`
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
    `).all() as any[];

    return recents;
  } catch (err) {
    console.error('Recent activity error:', err);
    return [];
  }
}

'use server';

import db from '@/lib/db';
import { getSession } from '@/app/actions/auth';

/**
 * Get analytics dashboard overview
 * Admin-only access
 */
export async function getAnalyticsDashboard() {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Admin access required' };

    try {
        // Today's revenue - calculate from services and parts
        const today = new Date().toISOString().split('T')[0];
        const todayRevenueRes = await db.query(`
            SELECT COALESCE(SUM(
                (SELECT COALESCE(SUM(price * quantity), 0) FROM job_card_services WHERE job_id = j.id) +
                (SELECT COALESCE(SUM(price * quantity), 0) FROM job_card_parts WHERE job_id = j.id)
            ), 0) as total
            FROM job_cards j
            JOIN invoices i ON j.id = i.job_id
            WHERE DATE(i.created_at) = $1
        `, [today]);
        const todayRevenue = todayRevenueRes.rows[0];

        // This month's revenue
        const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const monthRevenueRes = await db.query(`
            SELECT COALESCE(SUM(
                (SELECT COALESCE(SUM(price * quantity), 0) FROM job_card_services WHERE job_id = j.id) +
                (SELECT COALESCE(SUM(price * quantity), 0) FROM job_card_parts WHERE job_id = j.id)
            ), 0) as total
            FROM job_cards j
            JOIN invoices i ON j.id = i.job_id
            WHERE TO_CHAR(i.created_at, 'YYYY-MM') = $1
        `, [thisMonth]);
        const monthRevenue = monthRevenueRes.rows[0];

        // Total completed jobs
        const completedJobsRes = await db.query(`
            SELECT COUNT(*) as count
            FROM job_cards
            WHERE status = 'BILLED'
        `);
        const completedJobs = completedJobsRes.rows[0];

        // Repeat customers (customers with more than 1 job)
        const repeatCustomersRes = await db.query(`
            SELECT COUNT(DISTINCT customer_id) as count
            FROM (
                SELECT customer_id, COUNT(*) as job_count
                FROM job_cards
                WHERE status = 'BILLED'
                GROUP BY customer_id
                HAVING COUNT(*) > 1
            ) as subquery
        `);
        const repeatCustomers = repeatCustomersRes.rows[0];

        return {
            todayRevenue: Number(todayRevenue?.total || 0),
            monthRevenue: Number(monthRevenue?.total || 0),
            completedJobs: Number(completedJobs?.count || 0),
            repeatCustomers: Number(repeatCustomers?.count || 0)
        };
    } catch (err: any) {
        console.error('Analytics dashboard error:', err);
        return { error: `Failed to load analytics: ${err.message}` };
    }
}

/**
 * Get daily revenue for a specific date
 */
export async function getDailyRevenue(date: string) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Admin access required' };

    try {
        const resultRes = await db.query(`
            SELECT 
                DATE(i.created_at) as date,
                COUNT(DISTINCT i.id) as invoice_count,
                SUM(
                    (SELECT COALESCE(SUM(price * quantity), 0) FROM job_card_services WHERE job_id = j.id) +
                    (SELECT COALESCE(SUM(price * quantity), 0) FROM job_card_parts WHERE job_id = j.id)
                ) as total_revenue
            FROM invoices i
            JOIN job_cards j ON i.job_id = j.id
            WHERE DATE(i.created_at) = $1
            GROUP BY DATE(i.created_at)
        `, [date]);
        const result = resultRes.rows[0];

        return { data: result || { date, invoice_count: 0, total_revenue: 0 } };
    } catch (err: any) {
        console.error('Daily revenue error:', err);
        return { error: `Failed to load daily revenue: ${err.message}` };
    }
}

/**
 * Get monthly revenue breakdown
 */
export async function getMonthlyRevenue(year: number, month: number) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Admin access required' };

    try {
        const yearMonth = `${year}-${String(month).padStart(2, '0')}`;

        const dailyBreakdownRes = await db.query(`
            SELECT 
                DATE(i.created_at) as date,
                COUNT(DISTINCT i.id) as invoice_count,
                SUM(
                    (SELECT COALESCE(SUM(price * quantity), 0) FROM job_card_services WHERE job_id = j.id) +
                    (SELECT COALESCE(SUM(price * quantity), 0) FROM job_card_parts WHERE job_id = j.id)
                ) as daily_total
            FROM invoices i
            JOIN job_cards j ON i.job_id = j.id
            WHERE TO_CHAR(i.created_at, 'YYYY-MM') = $1
            GROUP BY DATE(i.created_at)
            ORDER BY date
        `, [yearMonth]);
        const dailyBreakdown = dailyBreakdownRes.rows;

        const monthTotalRes = await db.query(`
            SELECT 
                COUNT(DISTINCT i.id) as total_invoices,
                SUM(
                    (SELECT COALESCE(SUM(price * quantity), 0) FROM job_card_services WHERE job_id = j.id) +
                    (SELECT COALESCE(SUM(price * quantity), 0) FROM job_card_parts WHERE job_id = j.id)
                ) as total_revenue
            FROM invoices i
            JOIN job_cards j ON i.job_id = j.id
            WHERE TO_CHAR(i.created_at, 'YYYY-MM') = $1
        `, [yearMonth]);
        const monthTotal = monthTotalRes.rows[0];

        return {
            dailyBreakdown,
            monthTotal: monthTotal || { total_invoices: 0, total_revenue: 0 }
        };
    } catch (err: any) {
        console.error('Monthly revenue error:', err);
        return { error: `Failed to load monthly revenue: ${err.message}` };
    }
}

/**
 * Get mechanic performance stats
 */
export async function getMechanicPerformance() {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Admin access required' };

    try {
        const performanceRes = await db.query(`
            SELECT 
                u.id,
                u.name,
                COUNT(j.id) as jobs_completed,
                ROUND(AVG(EXTRACT(EPOCH FROM (j.completed_at - j.started_at)) / 86400)::numeric, 2) as avg_days
            FROM users u
            LEFT JOIN job_cards j ON u.id = j.assigned_mechanic_id AND j.status = 'BILLED'
            WHERE u.role = 'mechanic' AND u.is_active = 1
            GROUP BY u.id, u.name
            ORDER BY jobs_completed DESC
        `);
        const performance = performanceRes.rows;

        return { data: performance };
    } catch (err: any) {
        console.error('Mechanic performance error:', err);
        return { error: `Failed to load mechanic performance: ${err.message}` };
    }
}

/**
 * Get popular services
 */
export async function getPopularServices() {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Admin access required' };

    try {
        const servicesRes = await db.query(`
            SELECT 
                jcs.service_name,
                COUNT(*) as usage_count,
                SUM(jcs.price * jcs.quantity) as total_revenue
            FROM job_card_services jcs
            JOIN job_cards jc ON jcs.job_id = jc.id
            WHERE jc.status = 'BILLED'
            GROUP BY jcs.service_name
            ORDER BY usage_count DESC
            LIMIT 10
        `);
        const services = servicesRes.rows;

        return { data: services };
    } catch (err: any) {
        console.error('Popular services error:', err);
        return { error: `Failed to load popular services: ${err.message}` };
    }
}

/**
 * Get repeat customers
 */
export async function getRepeatCustomers() {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Admin access required' };

    try {
        const customersRes = await db.query(`
            SELECT 
                c.id,
                c.name,
                c.mobile,
                COUNT(j.id) as total_visits,
                MAX(j.service_date) as last_visit,
                SUM(
                    (SELECT COALESCE(SUM(price * quantity), 0) FROM job_card_services WHERE job_id = j.id) +
                    (SELECT COALESCE(SUM(price * quantity), 0) FROM job_card_parts WHERE job_id = j.id)
                ) as total_spent
            FROM customers c
            JOIN job_cards j ON c.id = j.customer_id
            WHERE j.status = 'BILLED'
            GROUP BY c.id, c.name, c.mobile
            HAVING COUNT(j.id) > 1
            ORDER BY total_visits DESC, total_spent DESC
        `);
        const customers = customersRes.rows;

        return { data: customers };
    } catch (err: any) {
        console.error('Repeat customers error:', err);
        return { error: `Failed to load repeat customers: ${err.message}` };
    }
}

/**
 * Export data to CSV format
 */
export async function exportToCSV(reportType: string, data: any[]) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Admin access required' };

    try {
        if (!data || data.length === 0) {
            return { error: 'No data to export' };
        }

        // Convert data to CSV format
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).join(',')).join('\n');
        const csv = `${headers}\n${rows}`;

        return { csv, filename: `${reportType}_${new Date().toISOString().split('T')[0]}.csv` };
    } catch (err: any) {
        console.error('CSV export error:', err);
        return { error: `Failed to export CSV: ${err.message}` };
    }
}

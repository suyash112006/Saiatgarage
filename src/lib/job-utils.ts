import db from '@/lib/db';

export async function updateJobTotals(jobId: number) {
    try {
        console.log(`[UTILS] updateJobTotals starting for Job:${jobId}`);
        // 1. Fetch all components needed for the total calculation
        const res = await db.query(`
            SELECT 
                (SELECT COALESCE(SUM(price * quantity), 0) FROM job_card_services WHERE job_id = $1) as s_total,
                (SELECT COALESCE(SUM(price * quantity), 0) FROM job_card_parts WHERE job_id = $1) as p_total,
                (SELECT COALESCE(CAST(value AS NUMERIC), 18) FROM settings WHERE key = 'tax_rate') as tax_rate
        `, [jobId]);

        if (res.rowCount === 0) return;
        const { s_total, p_total, tax_rate } = res.rows[0];

        const servicesTotal = Number(s_total);
        const partsTotal = Number(p_total);
        const rate = Number(tax_rate);

        const subtotal = servicesTotal + partsTotal;
        const taxAmount = Math.round(subtotal * (rate / 100) * 100) / 100;
        const grandTotal = Math.round((subtotal + taxAmount) * 100) / 100;

        console.log(`[UTILS] Calculated totals: Services:${servicesTotal}, Parts:${partsTotal}, Tax:${taxAmount}, Grand:${grandTotal}`);

        // 2. Perform the update - standard SQL UPDATE
        await db.query(`
            UPDATE job_cards 
            SET total_services_amount = $1, 
                total_parts_amount = $2, 
                tax_amount = $3, 
                grand_total = $4
            WHERE id = $5
        `, [servicesTotal, partsTotal, taxAmount, grandTotal, jobId]);

        console.log(`[UTILS] updateJobTotals completed successfully`);
    } catch (err: any) {
        console.error('❌ updateJobTotals Error:', err);
        throw err;
    }
}

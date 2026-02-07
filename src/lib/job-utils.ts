import db from '@/lib/db';

export async function updateJobTotals(jobId: number) {
    const servicesRes = await db.query('SELECT SUM(price * quantity) as total FROM job_card_services WHERE job_id = $1', [jobId]);
    const partsRes = await db.query('SELECT SUM(price * quantity) as total FROM job_card_parts WHERE job_id = $1', [jobId]);

    const sTotal = Number(servicesRes.rows[0]?.total) || 0;
    const pTotal = Number(partsRes.rows[0]?.total) || 0;

    // Fetch dynamic tax rate
    const taxSettingRes = await db.query("SELECT value FROM settings WHERE key = 'tax_rate'");
    const taxValue = taxSettingRes.rows[0]?.value;
    const taxRate = taxValue ? parseFloat(taxValue) : 18; // Default to 18%

    const subtotal = sTotal + pTotal;
    const tax = subtotal * (taxRate / 100);
    const grandTotal = subtotal + tax;

    await db.query(`
        UPDATE job_cards 
        SET total_services_amount = $1, total_parts_amount = $2, tax_amount = $3, grand_total = $4
        WHERE id = $5
    `, [sTotal, pTotal, tax, grandTotal, jobId]);
}

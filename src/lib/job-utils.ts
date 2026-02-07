import db from '@/lib/db';

export function updateJobTotals(jobId: number) {
    const services = db.prepare('SELECT SUM(price * quantity) as total FROM job_card_services WHERE job_id = ?').get(jobId) as { total: number };
    const parts = db.prepare('SELECT SUM(price * quantity) as total FROM job_card_parts WHERE job_id = ?').get(jobId) as { total: number };

    const sTotal = services.total || 0;
    const pTotal = parts.total || 0;

    // Fetch dynamic tax rate
    const taxSetting = db.prepare("SELECT value FROM settings WHERE key = 'tax_rate'").get() as { value: string };
    const taxRate = taxSetting ? parseFloat(taxSetting.value) : 18; // Default to 18%

    const subtotal = sTotal + pTotal;
    const tax = subtotal * (taxRate / 100);
    const grandTotal = subtotal + tax;

    db.prepare(`
        UPDATE job_cards 
        SET total_services_amount = ?, total_parts_amount = ?, tax_amount = ?, grand_total = ?
        WHERE id = ?
    `).run(sTotal, pTotal, tax, grandTotal, jobId);
}

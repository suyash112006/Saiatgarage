
import Database from 'better-sqlite3';

const db = new Database('garage.db');

try {
    console.log('Applying migrations to job_cards...');

    // Add total_services_amount
    try {
        db.prepare('ALTER TABLE job_cards ADD COLUMN total_services_amount REAL DEFAULT 0').run();
        console.log('✅ Added total_services_amount');
    } catch (e: any) {
        if (!e.message.includes('duplicate column')) console.error(e.message);
    }

    // Add total_parts_amount
    try {
        db.prepare('ALTER TABLE job_cards ADD COLUMN total_parts_amount REAL DEFAULT 0').run();
        console.log('✅ Added total_parts_amount');
    } catch (e: any) {
        if (!e.message.includes('duplicate column')) console.error(e.message);
    }

    // Add tax_amount
    try {
        db.prepare('ALTER TABLE job_cards ADD COLUMN tax_amount REAL DEFAULT 0').run();
        console.log('✅ Added tax_amount');
    } catch (e: any) {
        if (!e.message.includes('duplicate column')) console.error(e.message);
    }

    // Add discount_amount
    try {
        db.prepare('ALTER TABLE job_cards ADD COLUMN discount_amount REAL DEFAULT 0').run();
        console.log('✅ Added discount_amount');
    } catch (e: any) {
        if (!e.message.includes('duplicate column')) console.error(e.message);
    }

    // Add grand_total
    try {
        db.prepare('ALTER TABLE job_cards ADD COLUMN grand_total REAL DEFAULT 0').run();
        console.log('✅ Added grand_total');
    } catch (e: any) {
        if (!e.message.includes('duplicate column')) console.error(e.message);
    }

    console.log('Migration complete.');
} catch (error) {
    console.error('Migration failed:', error);
}

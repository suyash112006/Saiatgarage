import db from '../src/lib/db';

async function applyIndices() {
    console.log('--- Applying Performance Indices ---');
    try {
        await db.query('CREATE INDEX IF NOT EXISTS idx_vehicles_customer ON vehicles(customer_id)');
        await db.query('CREATE INDEX IF NOT EXISTS idx_job_cards_vehicle ON job_cards(vehicle_id)');
        await db.query('CREATE INDEX IF NOT EXISTS idx_job_card_services_service ON job_card_services(service_id)');
        await db.query('CREATE INDEX IF NOT EXISTS idx_job_card_parts_part ON job_card_parts(part_id)');
        await db.query('CREATE INDEX IF NOT EXISTS idx_vehicle_models_brand ON vehicle_models(brand_id)');
        console.log('✅ Indices applied successfully.');
    } catch (err) {
        console.error('❌ Failed to apply indices:', err);
    }
    process.exit(0);
}

applyIndices();

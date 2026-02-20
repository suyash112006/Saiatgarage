
import fs from 'fs';
import path from 'path';

// Manual .env loading
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    console.log('Loading .env from', envPath);
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            process.env[key] = value;
        }
    });
} else {
    console.warn('.env file not found!');
}

// import db from '../src/lib/db'; // Removed static import

async function migrate() {
    // Dynamic import to ensure env vars are loaded first
    const db = (await import('../src/lib/db')).default;

    console.log('Running notifications migration...');
    try {
        await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'OTHER',
        reference_id INTEGER,
        reference_type TEXT,
        is_read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('✅ Created notifications table');

        await db.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
    `);
        console.log('✅ Created index');
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

migrate();

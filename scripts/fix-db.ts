import fs from 'fs';
import path from 'path';

// Manually load .env
try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.join('=').trim();
        }
    });
} catch (err) { }

import db from '../src/lib/db';

async function fixDb() {
    console.log('--- Fixing Database Schema ---');

    const statements = [
        `ALTER TABLE job_card_services ADD COLUMN sort_order INTEGER DEFAULT 0;`,
        `ALTER TABLE job_card_services ADD COLUMN is_future INTEGER DEFAULT 0;`,
        `ALTER TABLE job_card_parts ADD COLUMN sort_order INTEGER DEFAULT 0;`,
        `ALTER TABLE job_card_parts ADD COLUMN is_future INTEGER DEFAULT 0;`
    ];

    for (const sql of statements) {
        try {
            await db.query(sql);
            console.log('✅ Executed:', sql);
        } catch (err: any) {
            if (!err.message.includes('duplicate column')) {
                console.error('❌ Error executing:', sql);
                console.error(err.message);
            } else {
                console.log('✅ Column already exists for:', sql);
            }
        }
    }

    console.log('--- Schema Fix Complete ---');
    process.exit(0);
}

fixDb().catch(console.error);

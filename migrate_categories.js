require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function main() {
    try {
        console.log("Creating part_categories table...");
        await sql`
            CREATE TABLE IF NOT EXISTS part_categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                color VARCHAR(20) DEFAULT '#6b7280'
            );
        `;

        console.log("Inserting default categories...");
        await sql`
            INSERT INTO part_categories (name, color) VALUES 
                ('General', '#6b7280'),
                ('Filters', '#0ea5e9'),
                ('Brakes', '#ef4444'),
                ('Engine', '#f97316'),
                ('Electrical', '#eab308'),
                ('Body & Suspension', '#8b5cf6'),
                ('AC / Heating', '#06b6d4')
            ON CONFLICT (name) DO NOTHING;
        `;

        const res = await sql`SELECT * FROM part_categories`;
        console.log("part_categories ready. Current rows:", res);

        console.log("Success!");
    } catch (e) {
        console.error("Error setting up DB:", e);
    }
}

main();

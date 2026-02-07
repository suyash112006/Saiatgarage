import db from './src/lib/db';

async function migrate() {
    try {
        // Add theme column to users if it doesn't exist
        try {
            await db.query("ALTER TABLE users ADD COLUMN theme TEXT NOT NULL DEFAULT 'light' CHECK(theme IN ('light', 'dark', 'system'))");
            console.log("Added 'theme' column to users table.");
        } catch (e) {
            // Column might already exist
        }

        // Create settings table
        await db.query(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        `);
        console.log("Created 'settings' table.");

        // Insert default settings
        await db.query("INSERT INTO settings (key, value) VALUES ('garage_name', 'GaragePro') ON CONFLICT (key) DO NOTHING");
        await db.query("INSERT INTO settings (key, value) VALUES ('tax_rate', '18') ON CONFLICT (key) DO NOTHING");
        console.log("Initialized default settings.");

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        // Since it's a script, we should probably close the pool if we are done, 
        // but since db.ts exports the pool directly, we might not have an easy way to close it without modifying db.ts
        // or just let it time out.
    }
}

migrate();

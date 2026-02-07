import db from './src/lib/db';

try {
    // Add theme column to users if it doesn't exist
    try {
        db.prepare("ALTER TABLE users ADD COLUMN theme TEXT CHECK(theme IN ('light', 'dark', 'system')) NOT NULL DEFAULT 'light'").run();
        console.log("Added 'theme' column to users table.");
    } catch (e) {
        // Column might already exist
    }

    // Create settings table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    `).run();
    console.log("Created 'settings' table.");

    // Insert default settings
    db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('garage_name', 'GaragePro')").run();
    db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('tax_rate', '18')").run();
    console.log("Initialized default settings.");

} catch (err) {
    console.error("Migration failed:", err);
}

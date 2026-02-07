const Database = require('better-sqlite3');
const db = new Database('./garage.db');

try {
    // Add is_verified column
    try {
        db.prepare('ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0').run();
        console.log('Added is_verified column');
    } catch (err) {
        if (err.message.includes('duplicate column name')) {
            console.log('is_verified column already exists');
        } else {
            throw err;
        }
    }

    // Add verification_token column
    try {
        db.prepare('ALTER TABLE users ADD COLUMN verification_token TEXT').run();
        console.log('Added verification_token column');
    } catch (err) {
        if (err.message.includes('duplicate column name')) {
            console.log('verification_token column already exists');
        } else {
            throw err;
        }
    }

    // Set existing users as verified
    db.prepare('UPDATE users SET is_verified = 1').run();
    console.log('Existing users marked as verified');

} catch (err) {
    console.error('Migration failed:', err);
} finally {
    db.close();
}

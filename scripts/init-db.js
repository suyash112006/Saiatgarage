const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../garage.db');
const schemaPath = path.join(__dirname, '../src/lib/schema.sql');

console.log('Initializing database at:', dbPath);

const db = new Database(dbPath);

try {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
    console.log('Database initialized successfully!');
} catch (error) {
    console.error('Error initializing database:', error);
} finally {
    db.close();
}

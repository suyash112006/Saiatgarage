const Database = require('better-sqlite3');
const db = new Database('garage.db');
const mechanics = db.prepare("SELECT * FROM users WHERE role = 'mechanic'").all();
console.log('Mechanics found:', mechanics);

const allUsers = db.prepare("SELECT * FROM users").all();
console.log('All Users:', allUsers);

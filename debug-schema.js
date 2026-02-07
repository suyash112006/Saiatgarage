
const db = require('better-sqlite3')('garage.db');

const columns = db.prepare("PRAGMA table_info(vehicles)").all();
console.log(columns);

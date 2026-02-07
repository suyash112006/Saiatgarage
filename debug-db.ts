
import Database from 'better-sqlite3';

const db = new Database('garage.db');
const services = db.prepare('SELECT id, name, base_price FROM services').all();
const parts = db.prepare('SELECT id, name, part_no, unit_price FROM parts').all();

console.log('--- Services ---');
console.log(services);
console.log('\n--- Parts ---');
console.log(parts);

import { Pool } from 'pg';
import Database from 'better-sqlite3';
import path from 'path';

// Use a singleton for the pool to avoid multiple connections in development
let pool: Pool | null = null;
let sqliteDb: any = null;

export const getDbProvider = () => {
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('postgresql://') && !process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')) {
        return 'postgres';
    }
    return 'sqlite';
};

const initPostgres = () => {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
    }
    return pool;
};

const initSqlite = () => {
    if (!sqliteDb) {
        const dbPath = path.resolve(process.cwd(), 'garage.db');
        sqliteDb = new Database(dbPath);
    }
    return sqliteDb;
};

// Helper to run queries
export const query = async (text: string, params?: any[]) => {
    const provider = getDbProvider();
    const start = Date.now();

    try {
        if (provider === 'postgres') {
            const p = initPostgres();
            const res = await p.query(text, params);
            return res;
        } else {
            const db = initSqlite();

            // Correctly handle PostgreSQL placeholders ($1, $2, etc.) for SQLite
            // PostgreSQL allows reusing $1 multiple times, but SQLite '?' is positional.
            // We'll extract the placeholders in order and rebuild the params array.
            const placeholders = text.match(/\$\d+/g) || [];
            const sqliteParams = placeholders.map(ph => {
                const index = parseInt(ph.substring(1)) - 1;
                return params ? params[index] : undefined;
            });
            const sqliteQuery = text.replace(/\$\d+/g, '?');

            // Handle RETURNING id for SQLite
            const isInsert = text.trim().toUpperCase().startsWith('INSERT INTO');
            const hasReturning = text.toUpperCase().includes('RETURNING ID');

            if (isInsert && hasReturning) {
                const queryWithoutReturning = text.replace(/RETURNING\s+id/i, '').trim();
                const stmt = db.prepare(queryWithoutReturning.replace(/\$\d+/g, '?'));
                const result = stmt.run(...sqliteParams);
                return {
                    rows: [{ id: result.lastInsertRowid }],
                    rowCount: 1
                };
            }

            const stmt = db.prepare(sqliteQuery);
            if (text.trim().toUpperCase().startsWith('SELECT')) {
                const rows = stmt.all(...sqliteParams);
                return {
                    rows,
                    rowCount: rows.length
                };
            } else {
                const result = stmt.run(...sqliteParams);
                return {
                    rows: [],
                    rowCount: result.changes
                };
            }
        }
    } catch (error: any) {
        console.error(`Database Error (${provider}):`, error.message);
        console.error(`Query: ${text}`);
        console.error(`Params:`, params);
        throw error;
    }
};

export default {
    query
};

import { Pool } from 'pg';
import Database from 'better-sqlite3';
import path from 'path';

// Use a singleton for the pool to avoid multiple connections in development
// In development, Next.js clears the module cache on re-compile, so we need to
// attach the connection to the global object to persist it.

// Add types for global object
declare global {
    // eslint-disable-next-line no-var
    var postgresPool: Pool | undefined;
    // eslint-disable-next-line no-var
    var sqliteConnection: any | undefined;
}

let pool: Pool | null = null;
let sqliteDb: any = null;

const url = process.env.DATABASE_URL;
const maskedUrl = url ? url.replace(/:([^@]+)@/, ':****@') : 'NOT DEFINED';

export const getDbProvider = () => {
    // ALWAYS use Postgres if possible, only fallback to SQLite if URL is completely missing
    // AND we are NOT on Vercel.
    const isPostgresForced = process.env.VERCEL || process.env.NODE_ENV === 'production';

    if (url && (url.startsWith('postgresql://') || url.startsWith('postgres://'))) {
        if (!url.includes('[YOUR-PASSWORD]')) {
            return 'postgres';
        }
    }

    if (isPostgresForced) {
        return 'postgres';
    }

    return 'sqlite';
};

const initPostgres = () => {
    if (global.postgresPool) {
        return global.postgresPool;
    }

    if (!pool) {
        console.log('--- Initializing Postgres Connection Pool ---');
        console.log('URL defined:', !!process.env.DATABASE_URL);

        // Add connection timeout and other config for better performance/debugging
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            },
            max: 10, // Max number of clients in the pool
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        pool.on('error', (err) => console.error('Unexpected pool error:', err));

        // Log when a new client connects
        pool.on('connect', () => {
            // Optional: console.log('New client connected to pool'); 
        });
    }

    // Save to global in development
    if (process.env.NODE_ENV !== 'production') {
        global.postgresPool = pool;
    }

    return pool;
};

const initSqlite = () => {
    if (global.sqliteConnection) {
        return global.sqliteConnection;
    }

    if (!sqliteDb) {
        const dbPath = path.resolve(process.cwd(), 'garage.db');
        console.log('--- Initializing SQLite Connection ---');
        console.log('DB Path:', dbPath);
        sqliteDb = new Database(dbPath);
    }

    // Save to global in development
    if (process.env.NODE_ENV !== 'production') {
        global.sqliteConnection = sqliteDb;
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
            const duration = Date.now() - start;

            // Log slow queries (> 200ms)
            if (duration > 200) {
                console.log(`[DB-SLOW] ${provider} query executed in ${duration}ms: ${text.substring(0, 100)}...`);
            } else if (process.env.NODE_ENV === 'development') {
                // In dev, log all to see activity
                // console.log(`[DB] ${provider} query executed in ${duration}ms`);
            }

            return res;
        } else {
            const db = initSqlite();

            const placeholders = text.match(/\$\d+/g) || [];
            const sqliteParams = placeholders.map(ph => {
                const index = parseInt(ph.substring(1)) - 1;
                return params ? params[index] : undefined;
            });
            const sqliteQuery = text.replace(/\$\d+/g, '?');

            const isInsert = text.trim().toUpperCase().startsWith('INSERT INTO');
            const hasReturning = text.toUpperCase().includes('RETURNING ID');

            let rows = [];
            let rowCount = 0;

            if (isInsert && hasReturning) {
                const queryWithoutReturning = text.replace(/RETURNING\s+id/i, '').trim();
                const stmt = db.prepare(queryWithoutReturning.replace(/\$\d+/g, '?'));
                const result = stmt.run(...sqliteParams);
                rows = [{ id: result.lastInsertRowid }];
                rowCount = 1;
            } else {
                const stmt = db.prepare(sqliteQuery);
                if (text.trim().toUpperCase().startsWith('SELECT')) {
                    rows = stmt.all(...sqliteParams);
                    rowCount = rows.length;
                } else {
                    const result = stmt.run(...sqliteParams);
                    rowCount = result.changes;
                }
            }

            const duration = Date.now() - start;
            if (duration > 200) {
                console.log(`[DB-SLOW] ${provider} query executed in ${duration}ms: ${text.substring(0, 100)}...`);
            }

            return { rows, rowCount };
        }
    } catch (error: any) {
        const isDnsError = error.message?.includes('ENOTFOUND');
        console.error(`❌ Database Error (${provider}):`, isDnsError ? 'DNS RESOLUTION FAILED (Host not found)' : error.message);
        if (isDnsError) {
            console.error('👉 Suggestion: Check your internet connection or your DATABASE_URL hostname.');
        }
        console.error(`Query: ${text}`);
        console.error(`Params:`, params);
        console.error(`Duration until failure: ${Date.now() - start}ms`);
        throw error;
    }
};

export default {
    query
};

// Initial Diagnostic on file load (only in dev to avoid log spam in prod)
if (process.env.NODE_ENV !== 'production') {
    // console.log('--- DATABASE MODULE LOADED ---');
    // console.log('Provider will be:', getDbProvider());
}

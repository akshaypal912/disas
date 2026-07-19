import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema.ts';

export const createPool = () => {
  // FIX CRITICAL #5: Enable SSL for encrypted connections to cloud Postgres instances.
  // Set SQL_SSL=false in .env only for local development without SSL.
  const sslEnabled = process.env.SQL_SSL !== "false";
  return new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 15000,
    ssl: sslEnabled ? { rejectUnauthorized: false } : false,
  });
};

const pool = createPool();

pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

export const db = drizzle(pool, { schema });
export * as schema from './schema.ts';

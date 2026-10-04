// Read-only diagnostics. Does not print credentials or alter the database.
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const { Pool } = require('pg');
const pool = new Pool({ host: process.env.DB_HOST, port: process.env.DB_PORT,
  user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
  connectionTimeoutMillis: 5000 });
async function main() {
  console.log('JWT_SECRET válido:', Buffer.byteLength(process.env.JWT_SECRET || '') >= 32);
  try {
    const result = await pool.query(`SELECT current_database() AS database,
      to_regclass('public.auth_sessions') IS NOT NULL AS sessions_table,
      to_regclass('public.auth_refresh_tokens') IS NOT NULL AS refresh_table`);
    console.log('Conexión PostgreSQL correcta:', JSON.stringify(result.rows[0]));
  } finally { await pool.end(); }
}
main().catch(error => { console.error('Diagnóstico PostgreSQL:', error.code || '', error.message); process.exitCode = 1; });

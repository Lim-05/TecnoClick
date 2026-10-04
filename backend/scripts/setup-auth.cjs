// Run from backend: node scripts/setup-auth.cjs
const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath, quiet: true });
async function main() {
  const pool = new Pool({ host: process.env.DB_HOST, port: process.env.DB_PORT,
    user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
    connectionTimeoutMillis: 5000 });
  try {
    await pool.query(fs.readFileSync(path.join(__dirname, '../sql/003_refresh_tokens.sql'), 'utf8'));
    console.log('Migración de sesiones aplicada. Reinicia el backend.');
  } finally { await pool.end(); }
}
main().catch(error => { console.error('No se pudo preparar autenticación:', error.message); process.exitCode = 1; });

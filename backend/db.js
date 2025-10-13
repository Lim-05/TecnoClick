const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Función para probar la conexión al iniciar
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Conexión exitosa a la base de datos Tecnoclick');

    //Lista tablas en el esquema public
    const res = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public';`);
    console.log('Tablas en el esquema public:', res.rows.map(row => row.table_name));
    

    client.release();
  } catch (err) {
    console.error('Error al conectar a PostgreSQL:', err.message);
  }
}

testConnection();

module.exports = pool;

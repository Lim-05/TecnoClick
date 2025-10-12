const express = require('express');
const app = express();
const db = require('./db');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.use(express.json());

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Servidor Node.js corriendo ✅');
});

// Ruta de prueba de conexión a la DB
app.get('/prueba', async (req, res) => {
  try {
    const client = await db.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    res.send(`Conexión exitosa a PostgreSQL: ${result.rows[0].now}`);
  } catch (err) {
    console.error('Error en /prueba-db:', err.message);
    res.status(500).send('Error en la conexión a la DB');
  }
});


// Inicia el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});

const express = require('express');
const app = express();
const db = require('./db'); // pool de PostgreSQL
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173' // URL donde corre Vite
}));



app.use(express.json());

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Servidor Node.js corriendo');
});

// POST - crear un nuevo usuario
app.post('/api/usuarios', async (req, res) => {
  const {
    nombre,
    apellido,
    telefono,
    correo,
    direccion,
    contra,
    CP,
    estado,
    municipio,
    colonia,
    referencias,
  } = req.body;

  // Validación básica
  if (!nombre || !apellido || !contra || !CP || !estado || !municipio || !colonia) {
    return res.status(400).json({ mensaje: 'Datos requeridos' });
  }

  try {
    const sql = `
      INSERT INTO usuario 
      (nombre_usuario, apellido_usuario, telefono_usuario, correo_usuario, direccion_usuario, contrasena, codigo_postal, estado_usuario, municipio_usuario, colonia_usuario, referencias)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *;
    `;

    const values = [
      nombre,
      apellido,
      telefono,
      correo,
      direccion,
      contra,
      CP,
      estado,
      municipio,
      colonia,
      referencias,
    ];

    const result = await db.query(sql, values);

    res.status(201).json({
      mensaje: 'Usuario creado exitosamente',
      usuario: result.rows[0],
    });
  } catch (err) {
    console.error('Error al crear usuario:', err.message);
    res.status(500).json({ mensaje: 'Error al crear usuario', error: err.message });
  }
});

// Inicia el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});

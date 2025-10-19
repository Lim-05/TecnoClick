const express = require('express'); // Framework web
const app = express(); //instancia a express
const db = require('./config/db'); // conexion a la base de datos - pool de pg
require('dotenv').config(); // Cargar variables de .env

const PORT = process.env.PORT || 3000;

//conexion backend y frontend
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] // URL donde corre Vite
}));

app.use(express.json()); // permite JSON en body

// importamos rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes'); // Rutas de productos

// Ruta raíz. Verificamos que este corriendo el servidor
app.get('/', (req, res) => {
  res.send('Servidor Node.js corriendo');
});

// rutas principales
app.use('/api', authRoutes); // /api/login y /api/usuarios
app.use('/api/productos', productRoutes); // Rutas de productos

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

  // Validación 
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

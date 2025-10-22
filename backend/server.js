const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const db = require('./config/db'); // Pool de PostgreSQL

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173']
}));

// Permitir JSON en requests
app.use(express.json());

// Rutas
const authRoutes = require('./routes/authRoutes');        // login, registro
const productRoutes = require('./routes/productRoutes');  // productos
const userRoutes = require('./routes/userRoutes');   
const tarjetasRoutes = require('./routes/tarjetasRoutes');   // PUT /usuarios/:id
const checkoutRoutes = require('./routes/checkoutRoutes');
const checkoutTarjetaRoutes = require('./routes/checkoutTarjetaRoutes');

// Montar rutas
app.use('/api', authRoutes);            // /api/login y /api/usuarios (POST)
app.use('/api/productos', productRoutes);
app.use('/api', checkoutRoutes);
app.use('/api/datos_tarjeta', tarjetasRoutes);
app.use('/api/usuarios', userRoutes);   // PUT /api/usuarios/:id
app.use('/api', checkoutTarjetaRoutes);

// POST - crear usuario
app.post('/api/usuarios', async (req, res) => {
  const { nombre, apellido, telefono, correo, direccion, contra, CP, estado, municipio, colonia, referencias } = req.body;

  if (!nombre || !apellido || !contra || !CP || !estado || !municipio || !colonia) {
    return res.status(400).json({ mensaje: 'Datos requeridos' });
  }

  try {

    const hashedPassword = await bcrypt.hash(contra, 10);

    const sql = `
      INSERT INTO usuario 
      (nombre_usuario, apellido_usuario, telefono_usuario, correo_usuario, direccion_usuario, contrasena, codigo_postal, estado_usuario, municipio_usuario, colonia_usuario, referencias)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *;
    `;
    const values = [nombre, apellido, telefono, correo, direccion, hashedPassword, CP, estado, municipio, colonia, referencias];
    const result = await db.query(sql, values);

    res.status(201).json({ mensaje: 'Usuario creado exitosamente', usuario: result.rows[0] });
  } catch (err) {
    console.error('Error al crear usuario:', err.message);
    res.status(500).json({ mensaje: 'Error al crear usuario', error: err.message });
  }
});

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Servidor Node.js corriendo');
});

// Inicia servidor y muestra rutas registradas
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});

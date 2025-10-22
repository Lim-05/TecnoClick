const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const db = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173']
}));

app.use(express.json());

// Rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');   
const tarjetasRoutes = require('./routes/tarjetasRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const checkoutTarjetaRoutes = require('./routes/checkoutTarjetaRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');

// Montar rutas
app.use('/api', authRoutes);
app.use('/api/productos', productRoutes);
app.use('/api', checkoutRoutes);
app.use('/api/datos_tarjeta', tarjetasRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api', checkoutTarjetaRoutes);
app.use('/api/pedidos', pedidoRoutes);

// POST - crear usuario (mantener esta ruta aquí si no la tienes en otro archivo)
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

// Inicia servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});
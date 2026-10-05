const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

/*app.use(cors({
  origin: [
    'https://localhost:5173',
    'https://127.0.0.1:5173',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true
}));*/

const allowedOrigins = [
  'https://localhost:5173',
  'https://127.0.0.1:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)){
      return callback(null, true);
    }

    return callback(new Error('Origen no permitido por CORS'));

  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/accessRoutes'));
app.use('/api/productos', require('./routes/productRoutes'));
app.use('/api', require('./routes/contentRoutes'));
app.use('/api', require('./routes/checkoutRoutes'));
app.use('/api/datos_tarjeta', require('./routes/tarjetasRoutes'));
app.use('/api/usuarios', require('./routes/userRoutes'));
app.use('/api', require('./routes/checkoutTarjetaRoutes'));
app.use('/api/pedidos', require('./routes/pedidoRoutes'));
app.use('/api/ingresos', require('./routes/ingresosRoutes'));
app.use('/api/resenas', require('./routes/resenaRoutes'));
app.use('/api/pedidos', require('./routes/pedidosAdminRoutes'));

app.get('/', (req, res) => res.send('Servidor Node.js corriendo con HTTPS'));

if (require.main === module) {
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'certs', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem'))
  };

  https.createServer(httpsOptions, app).listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor seguro corriendo en https://localhost:${PORT}`);
  });
}

module.exports = app;
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { obtenerHistorialCompras, obtenerDetalleCompra } = require('../controllers/pedidoController');

// Rutas del historial de compras - PROTEGIDAS CON AUTENTICACIÓN
router.get('/historial/:idUsuario', authMiddleware, obtenerHistorialCompras);
router.get('/detalle/:idPedido/:idUsuario', authMiddleware, obtenerDetalleCompra);

module.exports = router;
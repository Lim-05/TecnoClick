const express = require('express');
const router = express.Router();
const { obtenerHistorialCompras, obtenerDetalleCompra } = require('../controllers/pedidoController');

// Rutas del historial de compras
router.get('/historial/:idUsuario', obtenerHistorialCompras);
router.get('/detalle/:idPedido/:idUsuario', obtenerDetalleCompra);

module.exports = router;
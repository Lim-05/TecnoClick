const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../middleware/adminAuth');
const { ingresosEfectivo, ingresosTarjeta } = require('../controllers/ingresosController');

// Rutas de ingresos - SOLO ADMINISTRADORES
router.get('/efectivo', adminAuthMiddleware, ingresosEfectivo);
router.get('/tarjeta', adminAuthMiddleware, ingresosTarjeta);

module.exports = router;

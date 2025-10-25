const express = require('express');
const router = express.Router();
const { ingresosEfectivo, ingresosTarjeta } = require('../controllers/ingresosController');

// Rutas de ingresos
router.get('/efectivo', ingresosEfectivo);
router.get('/tarjeta', ingresosTarjeta);

module.exports = router;

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { procesarPagoTarjeta } = require('../controllers/checkoutTarjetaController');

// Ruta para pagos con tarjeta - PROTEGIDA CON AUTENTICACIÓN
router.post('/checkout/tarjeta', authMiddleware, procesarPagoTarjeta);

module.exports = router;

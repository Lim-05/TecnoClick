const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { procesarPagoEfectivo } = require('../controllers/checkoutController');

// Ruta para pagos en efectivo - PROTEGIDA CON AUTENTICACIÓN
router.post('/checkout/efectivo', authMiddleware, procesarPagoEfectivo);

module.exports = router;

const express = require('express');
const router = express.Router();
const { procesarPagoEfectivo } = require('../controllers/checkoutController');

// Ruta para pagos en efectivo
router.post('/checkout/efectivo', procesarPagoEfectivo);

module.exports = router;

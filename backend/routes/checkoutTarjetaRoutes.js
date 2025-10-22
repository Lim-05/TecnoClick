const express = require('express');
const router = express.Router();
const { procesarPagoTarjeta } = require('../controllers/checkoutTarjetaController');

router.post('/checkout/tarjeta', procesarPagoTarjeta);

module.exports = router;

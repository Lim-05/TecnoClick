const express = require('express');
const router = express.Router();
const { guardarDatosTarjeta } = require('../controllers/tarjetaController');

// POST /api/datos_tarjeta
router.post('/', guardarDatosTarjeta);

module.exports = router;

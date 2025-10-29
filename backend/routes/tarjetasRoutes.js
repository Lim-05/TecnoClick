const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { guardarDatosTarjeta,
        obtenerTarjetaUsuario,
        agregarTarjeta, 
        actualizarTarjeta, 
        eliminarTarjeta 
    } = require('../controllers/tarjetaController');

// Rutas de tarjetas - TODAS PROTEGIDAS CON AUTENTICACIÓN
router.get('/:id_usuario', authMiddleware, obtenerTarjetaUsuario);
router.post('/', authMiddleware, guardarDatosTarjeta);
router.put('/:id_tarjeta', authMiddleware, actualizarTarjeta);
router.delete('/:id_usuario/:id_tarjeta', authMiddleware, eliminarTarjeta);

module.exports = router;

const express = require('express');
const router = express.Router();
const { guardarDatosTarjeta,
        obtenerTarjetaUsuario,
        agregarTarjeta, 
        actualizarTarjeta, 
        eliminarTarjeta 
    } = require('../controllers/tarjetaController');

//rutas
router.get('/:id_usuario', obtenerTarjetaUsuario);
router.post('/', guardarDatosTarjeta);
router.put('/:id_tarjeta', actualizarTarjeta);
router.delete('/:id_usuario/:id_tarjeta', eliminarTarjeta);

module.exports = router;

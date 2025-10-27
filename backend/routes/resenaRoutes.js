const express = require('express');
const router = express.Router();
const resenaController = require('../controllers/resenaController');
const verificarToken = require('../middleware/auth');

// Crear una nueva reseña (requiere autenticación)
router.post('/', verificarToken, resenaController.crearResena);

// Obtener reseñas de un producto (público)
router.get('/producto/:id_producto', resenaController.obtenerResenasPorProducto);

// Verificar si el usuario puede reseñar un producto (requiere autenticación)
router.get('/puede-resenar/:id_producto', verificarToken, resenaController.verificarPuedeResenar);

module.exports = router;

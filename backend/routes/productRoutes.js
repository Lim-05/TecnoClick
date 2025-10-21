const express = require('express');
const router = express.Router();
const { getProductos, getProductoPorId } = require('../controllers/productsControllers');

// Rutas de productos
router.get('/products', getProductos);          // Obtener todos
router.get('/products/:id', getProductoPorId);  // Obtener uno por ID
router.delete('/products/:id', deleteProducto);

module.exports = router;

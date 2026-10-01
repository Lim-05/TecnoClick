const express = require('express');
const router = express.Router();
const { getProductos, getProductoPorId, deleteProducto } = require('../controllers/productsControllers');
const auth = require('../middleware/auth');
const { requirePermission } = require('../middleware/permission');

// Rutas de productos
router.get('/products', getProductos);          // Obtener todos
router.get('/products/:id', getProductoPorId);  // Obtener uno por ID
router.delete('/products/:id', auth, requirePermission('productos.eliminar'), deleteProducto);

module.exports = router;

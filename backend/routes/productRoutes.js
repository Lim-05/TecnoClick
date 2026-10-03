const express = require('express');

const router = express.Router();

const {
  getProductos,
  getProductoPorId,
  deleteProducto,
  getCategorias
} = require('../controllers/productsControllers');

const auth = require('../middleware/auth');

const {
  requirePermission
} = require('../middleware/permission');

// =========================
// CATÁLOGO PÚBLICO
// =========================

router.get(
  '/categorias',
  getCategorias
);

router.get(
  '/products',
  getProductos
);

router.get(
  '/products/:id',
  getProductoPorId
);

// =========================
// ADMINISTRACIÓN
// =========================

router.delete(
  '/products/:id',
  auth,
  requirePermission('productos.eliminar'),
  deleteProducto
);

module.exports = router;
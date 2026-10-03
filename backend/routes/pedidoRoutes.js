const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');

const {
  obtenerHistorialCompras,
  obtenerDetalleCompra
} = require('../controllers/pedidoController');

function propioOConPermiso(req, res, next) {
  if (!req.usuario) {
    return res.status(401).json({
      mensaje: 'Debes iniciar sesión para continuar.'
    });
  }

  const idUsuario = String(req.params.idUsuario);
  const idSesion = String(req.usuario.id_usuario);

  if (
    idUsuario === idSesion ||
    req.usuario.permisos?.includes('pedidos.gestionar')
  ) {
    return next();
  }

  return res.status(403).json({
    mensaje: 'No tienes permisos para consultar este historial.'
  });
}

router.get(
  '/historial/:idUsuario',
  auth,
  propioOConPermiso,
  obtenerHistorialCompras
);

router.get(
  '/detalle/:idPedido/:idUsuario',
  auth,
  propioOConPermiso,
  obtenerDetalleCompra
);

module.exports = router;
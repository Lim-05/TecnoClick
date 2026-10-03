const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');

const {
  obtenerTarjetaUsuario,
  guardarDatosTarjeta,
  agregarTarjeta,
  actualizarTarjeta,
  eliminarTarjeta
} = require('../controllers/tarjetaController');

// =========================
// CONSULTAR TARJETAS
// =========================

router.get(
  '/:id_usuario',
  auth,
  (req, res, next) => {

    if (
      String(req.usuario.id_usuario) !==
      String(req.params.id_usuario)
    ) {
      return res.status(403).json({
        mensaje:
          'No puedes consultar las tarjetas de otro usuario.'
      });
    }

    next();
  },
  obtenerTarjetaUsuario
);

// =========================
// GUARDAR DATOS
// =========================

router.post(
  '/',
  auth,
  guardarDatosTarjeta
);

// =========================
// ACTUALIZAR TARJETA
// =========================

router.put(
  '/:id_tarjeta',
  auth,
  actualizarTarjeta
);

// =========================
// ELIMINAR TARJETA
// =========================

router.delete(
  '/:id_usuario/:id_tarjeta',
  auth,
  (req, res, next) => {

    if (
      String(req.usuario.id_usuario) !==
      String(req.params.id_usuario)
    ) {
      return res.status(403).json({
        mensaje:
          'No puedes eliminar una tarjeta de otro usuario.'
      });
    }

    next();
  },
  eliminarTarjeta
);

module.exports = router;
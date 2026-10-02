const express = require('express');

const {
  login,
  logout,
  session,
  solicitarRecuperacion,
  restablecerContrasena
} = require('../controllers/authController');

const auth = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);

router.post('/logout', logout);

router.get('/sesion', auth, session);

router.post('/recuperar', solicitarRecuperacion);

router.post('/restablecer', restablecerContrasena);

module.exports = router;
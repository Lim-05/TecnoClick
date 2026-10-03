const express = require('express');

const {
  login,
  logout,
  session,
  solicitarRecuperacion,
  restablecerContrasena
} = require('../controllers/authController');

const auth = require('../middleware/auth');

const {
  loginLimiter,
  recoveryLimiter,
  resetLimiter
} = require('../middleware/rateLimit');

const router = express.Router();

router.post('/login', loginLimiter, login);

router.post('/logout', logout);

router.get('/sesion', auth, session);

router.post('/recuperar', recoveryLimiter, solicitarRecuperacion);

router.post('/restablecer', resetLimiter, restablecerContrasena);

module.exports = router;
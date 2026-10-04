const express = require('express');

const {
  login,
  refresh,
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
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  // Reject browser requests originating on another site, including logout CSRF.
  if (req.headers['sec-fetch-site'] === 'cross-site') {
    return res.status(403).json({ mensaje: 'Origen no permitido.' });
  }
  next();
});

router.post('/login', loginLimiter, login);

router.post('/logout', logout);
router.post('/refresh', require('../middleware/rateLimit').refreshLimiter, refresh);

router.get('/sesion', auth, session);

router.post('/recuperar', recoveryLimiter, solicitarRecuperacion);

router.post('/restablecer', resetLimiter, restablecerContrasena);

module.exports = router;

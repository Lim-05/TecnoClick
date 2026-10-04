const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 15 minutos
  max: 3, // máximo 5 intentos
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensaje: 'Demasiados intentos de inicio de sesión. Intenta nuevamente en 1 minuto.'
  }
});

const recoveryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // máximo 3 solicitudes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensaje: 'Demasiadas solicitudes de recuperación. Intenta nuevamente en 15 minutos.'
  }
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // máximo 3 intentos
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensaje: 'Demasiados intentos para restablecer la contraseña. Intenta nuevamente en 15 minutos.'
  }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 registros
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensaje: 'Se alcanzó el límite de registros. Intenta nuevamente más tarde.'
  }
});

module.exports = {
  refreshLimiter: rateLimit({ windowMs: 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false,
    message: { mensaje: 'Demasiadas renovaciones. Intenta nuevamente en un minuto.' } }),
  loginLimiter,
  recoveryLimiter,
  resetLimiter,
  registerLimiter
};

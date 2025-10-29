const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'claveSecreta';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      mensaje: 'Token no proporcionado. Por favor, inicia sesión.',
      codigo: 'TOKEN_NO_PROPORCIONADO'
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.usuario = decoded; // Aquí viaja el id_usuario, correo y rol
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        mensaje: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        codigo: 'TOKEN_EXPIRADO'
      });
    }
    return res.status(403).json({ 
      mensaje: 'Token inválido.',
      codigo: 'TOKEN_INVALIDO'
    });
  }
};

module.exports = authMiddleware;

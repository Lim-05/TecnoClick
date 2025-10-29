const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'claveSecreta';

// Middleware para verificar que el usuario esté autenticado Y sea administrador
const adminAuthMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado. Acceso denegado.' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.usuario = decoded;
    
    // Verificar que el usuario tenga rol de administrador (acepta "admin" o "administrador")
    if (decoded.rol !== 'administrador' && decoded.rol !== 'admin') {
      return res.status(403).json({ 
        mensaje: 'Acceso denegado. Se requieren permisos de administrador.',
        rolRecibido: decoded.rol // Para debugging
      });
    }
    
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ mensaje: 'Token expirado. Por favor, inicia sesión nuevamente.' });
    }
    return res.status(403).json({ mensaje: 'Token inválido.' });
  }
};

module.exports = adminAuthMiddleware;

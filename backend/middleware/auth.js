const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'claveSecreta';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ mensaje: 'Token no proporcionado' });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.usuario = decoded; // Aquí viaja el id_usuario
    next();
  } catch (err) {
    res.status(403).json({ mensaje: 'Token inválido' });
  }
};

module.exports = authMiddleware;

const jwt = require('jsonwebtoken');
const { getAccess } = require('../services/access');
const SECRET = process.env.JWT_SECRET || 'claveSecreta';
async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) return res.status(401).json({ mensaje: 'Inicia sesión para continuar.' });
  let decoded;
  try { decoded = jwt.verify(token, SECRET); }
  catch (error) {
    return res.status(401).json({ mensaje: error.name === 'TokenExpiredError'
      ? 'Tu sesión ha expirado.' : 'Token inválido.' });
  }
  try {
    // El JWT identifica al usuario. El acceso vigente se consulta en PostgreSQL.
    const usuario = await getAccess(decoded.id_usuario);
    if (!usuario) return res.status(401).json({ mensaje: 'La cuenta ya no está disponible.' });
    req.usuario = usuario;
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ mensaje: 'No se pudo verificar el acceso.' });
  }
}
module.exports = authMiddleware;

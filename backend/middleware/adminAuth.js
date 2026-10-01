const auth = require('./auth');
module.exports = (req, res, next) => auth(req, res, () => {
  if (req.usuario.rol_codigo !== 'admin') {
    return res.status(403).json({ mensaje: 'Se requiere el rol Administrador.' });
  }
  next();
});

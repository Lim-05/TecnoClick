function requirePermission(...permissions) {
  return (req, res, next) => {
    if (!req.usuario) return res.status(401).json({ mensaje: 'Inicia sesión.' });
    if (!permissions.every(permission => req.usuario.permisos.includes(permission))) {
      return res.status(403).json({ mensaje: 'No tienes permisos para esta acción.' });
    }
    next();
  };
}
function ownUserOrPermission(permission) {
  return (req, res, next) => {
    if (String(req.usuario.id_usuario) === req.params.id || req.usuario.permisos.includes(permission)) {
      return next();
    }
    res.status(403).json({ mensaje: 'No tienes permisos para gestionar este usuario.' });
  };
}
module.exports = { requirePermission, ownUserOrPermission };

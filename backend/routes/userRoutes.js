const router = require('express').Router();
const auth = require('../middleware/auth');
const { requirePermission: permit, ownUserOrPermission: own } = require('../middleware/permission');
const c = require('../controllers/userController');
router.post('/', c.crearUsuario);
router.post('/admin', auth, permit('usuarios.crear'), c.crearUsuario);
router.get('/', auth, permit('usuarios.ver'), c.obtenerUsuarios);
router.get('/:id', auth, own('usuarios.ver'), c.obtenerUsuarioPorId);
router.put('/:id', auth, (req, res, next) => {
  if (req.usuario.permisos.includes('roles.asignar')) return next();
  return own('usuarios.editar')(req, res, next);
}, c.actualizarUsuario);
router.delete('/:id/rol', auth, permit('roles.revocar'), c.revocarRol);
router.delete('/:id', auth, permit('usuarios.eliminar'), c.eliminarUsuario);
module.exports = router;

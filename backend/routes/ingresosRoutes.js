const router = require('express').Router();
const auth = require('../middleware/auth');
const { requirePermission: permit } = require('../middleware/permission');
const { ingresosEfectivo, ingresosTarjeta } = require('../controllers/ingresosController');
router.get('/efectivo', auth, permit('ingresos.ver'), ingresosEfectivo);
router.get('/tarjeta', auth, permit('ingresos.ver'), ingresosTarjeta);
module.exports = router;

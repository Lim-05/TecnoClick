const router = require('express').Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const { requirePermission: permit } = require('../middleware/permission');
const { audit, transaction, positiveId, httpError, respondError } = require('../services/access');
router.get('/pendientes', auth, permit('pedidos.gestionar'), async (req, res) => {
  try {
    const result = await db.query(`SELECT p.id_pedido, p.monto_pedido, p.fecha_pedido, u.nombre_usuario, u.correo_usuario
      FROM pedido p JOIN usuario u ON p.id_usuario = u.id_usuario
      WHERE p.estado_pedido = 'pendiente' ORDER BY p.fecha_pedido DESC`);
    res.json(result.rows);
  } catch (error) { respondError(res, error); }
});
router.put('/:id/completar', auth, permit('pedidos.gestionar'), async (req, res) => {
  try {
    const id = positiveId(req.params.id);
    await transaction(async client => {
      const result = await client.query('SELECT estado_pedido FROM pedido WHERE id_pedido=$1 FOR UPDATE', [id]);
      if (!result.rows[0]) throw httpError(404, 'Pedido no encontrado.');
      if (result.rows[0].estado_pedido !== 'pendiente') throw httpError(409, 'El pedido ya no está pendiente.');
      await client.query("UPDATE pedido SET estado_pedido='completado' WHERE id_pedido=$1", [id]);
      await client.query('INSERT INTO ingresos (fecha_ingreso,id_pedido) VALUES (CURRENT_DATE,$1)', [id]);
      await audit(client, req.usuario, 'pedidos.completar', 'pedido', id);
    });
    res.json({ mensaje: 'Pedido completado e ingreso registrado.' });
  } catch (error) { respondError(res, error); }
});
module.exports = router;

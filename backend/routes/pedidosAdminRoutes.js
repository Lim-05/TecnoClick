const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener pedidos pendientes
router.get('/pendientes', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.id_pedido, p.monto_pedido, p.fecha_pedido, u.nombre_usuario, u.correo_usuario
      FROM pedido p
      JOIN usuario u ON p.id_usuario = u.id_usuario
      WHERE p.estado_pedido = 'pendiente'
      ORDER BY p.fecha_pedido DESC;
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Marcar pedido como completado
router.put('/:id/completar', async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(`UPDATE pedido SET estado_pedido = 'completado' WHERE id_pedido = $1`, [id]);
    await db.query(`INSERT INTO ingresos (fecha_ingreso, id_pedido) VALUES (CURRENT_DATE, $1)`, [id]);

    res.json({ mensaje: 'Pedido completado e ingreso registrado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

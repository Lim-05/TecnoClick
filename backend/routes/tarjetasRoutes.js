const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', (req, res) => {
  const { id_usuario, nombre_titular, numero_tarjeta, fecha_vencimiento, CVV } = req.body;

  if (!id_usuario || !nombre_titular || !numero_tarjeta || !fecha_vencimiento || !CVV) {
    return res.status(400).json({ mensaje: 'Datos requeridos faltantes' });
  }

  const query = `
    INSERT INTO datos_tarjeta (id_usuario, nombre_titular, numero_tarjeta, fecha_vencimiento, CVV)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *;
  `;

  db.query(query, [id_usuario, nombre_titular, numero_tarjeta, fecha_vencimiento, CVV], (err, result) => {
    if (err) return res.status(500).json({ mensaje: 'Error al guardar tarjeta', error: err.message });
    res.status(201).json({ mensaje: 'Tarjeta guardada', tarjeta: result.rows[0] });
  });
});

module.exports = router;

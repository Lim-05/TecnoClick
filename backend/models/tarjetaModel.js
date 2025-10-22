const pool = require('../config/db');

// Inserta los datos de la tarjeta
const insertarDatosTarjeta = async (nombre_titular, numero_tarjeta, fecha_vencimiento, cvv, id_usuario) => {
  const query = `
    INSERT INTO datos_tarjeta (nombre_titular, numero_tarjeta, fecha_vencimiento, cvv, id_usuario)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id_tarjeta;
  `;
  const values = [nombre_titular, numero_tarjeta, fecha_vencimiento, cvv, id_usuario];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Busca si ya existe una tarjeta registrada para el usuario (opcional)
const buscarTarjetaPorUsuario = async (id_usuario) => {
  const query = 'SELECT * FROM datos_tarjeta WHERE id_usuario = $1;';
  const result = await pool.query(query, [id_usuario]);
  return result.rows;
};

module.exports = {
  insertarDatosTarjeta,
  buscarTarjetaPorUsuario
};

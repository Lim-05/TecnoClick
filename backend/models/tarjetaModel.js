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

// Busca tarjeta por usuario
const obtenerPorUsuario = async (id_usuario) => {
  const result = await pool.query('SELECT * FROM datos_tarjeta WHERE id_usuario = $1;', [id_usuario]);
  return result.rows;
};

const Tarjeta = {
  obtenerPorUsuario: async (id_usuario) => {
    const result = await pool.query('SELECT * FROM datos_tarjeta WHERE id_usuario = $1;', [id_usuario]);
    return result.rows;
  },
  agregar: async (id_usuario, datos) => {
    const { nombre_titular, numero_tarjeta, fecha_vencimiento, cvv } = datos;
    await pool.query(
      'INSERT INTO datos_tarjeta (nombre_titular, numero_tarjeta, fecha_vencimiento, cvv, id_usuario) VALUES ($1,$2,$3,$4,$5);',
      [nombre_titular, numero_tarjeta, fecha_vencimiento, cvv, id_usuario]
    );
  },
  actualizar: async (id_tarjeta, datos) => {
  console.log('Actualizando tarjeta', id_tarjeta, datos); // <- VERIFICAR DATOS
  const { nombre_titular, numero_tarjeta, fecha_vencimiento, cvv } = datos;

  const query = `
    UPDATE datos_tarjeta
    SET nombre_titular = $1, numero_tarjeta = $2, fecha_vencimiento = $3, cvv = $4
    WHERE id_tarjeta = $5
    RETURNING *;
  `;

  const values = [nombre_titular, numero_tarjeta, fecha_vencimiento, cvv, id_tarjeta];
  const result = await pool.query(query, values);
  console.log('Resultado actualización:', result.rows);
  return result.rows[0];
}

};

module.exports = {
  insertarDatosTarjeta,
  obtenerPorUsuario,
  Tarjeta
};

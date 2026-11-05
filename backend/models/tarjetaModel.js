const pool = require('../config/db');
const { cifrar, descifrar } = require('../services/encryption');

// Conserva los demás campos y descifra únicamente el número.
function descifrarTarjeta(tarjeta) {
  return {
    ...tarjeta,
    numero_tarjeta: descifrar(tarjeta.numero_tarjeta)
  };
}

// Inserta una tarjeta: cifra el número antes de enviarlo a PostgreSQL.
const insertarDatosTarjeta = async (
  nombre_titular,
  numero_tarjeta,
  fecha_vencimiento,
  cvv,
  id_usuario
) => {
  const query = `
    INSERT INTO datos_tarjeta (
      nombre_titular,
      numero_tarjeta,
      fecha_vencimiento,
      cvv,
      id_usuario
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id_tarjeta;
  `;

  const values = [
    nombre_titular,
    cifrar(numero_tarjeta),
    fecha_vencimiento,
    cvv,
    id_usuario
  ];

  const result = await pool.query(query, values);

  // Aquí solo se devuelve el identificador.
  return result.rows[0];
};

// Consulta las tarjetas y descifra sus números.
const obtenerPorUsuario = async (id_usuario) => {
  const result = await pool.query(
    'SELECT * FROM datos_tarjeta WHERE id_usuario = $1;',
    [id_usuario]
  );

  return result.rows.map(descifrarTarjeta);
};

const Tarjeta = {
  obtenerPorUsuario: async (id_usuario) => {
    const result = await pool.query(
      'SELECT * FROM datos_tarjeta WHERE id_usuario = $1;',
      [id_usuario]
    );

    return result.rows.map(descifrarTarjeta);
  },

  agregar: async (id_usuario, datos) => {
    const {
      nombre_titular,
      numero_tarjeta,
      fecha_vencimiento,
      cvv
    } = datos;

    await pool.query(
      `INSERT INTO datos_tarjeta (
        nombre_titular,
        numero_tarjeta,
        fecha_vencimiento,
        cvv,
        id_usuario
      )
      VALUES ($1, $2, $3, $4, $5);`,
      [
        nombre_titular,
        cifrar(numero_tarjeta),
        fecha_vencimiento,
        cvv,
        id_usuario
      ]
    );
  },

  actualizar: async (id_tarjeta, datos, id_usuario) => {
    const {
      nombre_titular,
      numero_tarjeta,
      fecha_vencimiento,
      cvv
    } = datos;

    const query = `
      UPDATE datos_tarjeta
      SET nombre_titular = $1,
          numero_tarjeta = $2,
          fecha_vencimiento = $3,
          cvv = $4
      WHERE id_tarjeta = $5 AND id_usuario = $6
      RETURNING *;
    `;

    const values = [
      nombre_titular,
      cifrar(numero_tarjeta),
      fecha_vencimiento,
      cvv,
      id_tarjeta,
      id_usuario
    ];

    const result = await pool.query(query, values);

    // Devuelve una tarjeta descifrada, si se encontró.
    return result.rows[0]
      ? descifrarTarjeta(result.rows[0])
      : undefined;
  }
};

module.exports = {
  insertarDatosTarjeta,
  obtenerPorUsuario,
  Tarjeta
};
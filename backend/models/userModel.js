
const db = require('../config/db');

// Obtener todos los usuarios
async function getAllUsers() {
  try {
    const result = await db.query(`
      SELECT 
        id_usuario,
        nombre_usuario,
        apellido_usuario,
        telefono_usuario,
        correo_usuario,
        direccion_usuario,
        codigo_postal,
        estado_usuario,
        municipio_usuario,
        colonia_usuario,
        referencias
      FROM usuario
      ORDER BY id_usuario ASC;
    `);
    return result.rows;
  } catch (error) {
    console.error('Error en getAllUsers:', error.message);
    throw error;
  }
}


// Eliminar usuario por ID
async function deleteUserById(id) {
  try {
    const result = await db.query(
      `DELETE FROM usuario WHERE id_usuario = $1 RETURNING *;`,
      [id]
    );
    return result.rows[0]; // devuelve el usuario eliminado
  } catch (error) {
    console.error('Error en deleteUserById:', error.message);
    throw error;
  }
}


const Usuario = {
  obtenerPorId: async (id) => {
    const sql = 'SELECT * FROM usuario WHERE id_usuario = $1';
    const result = await db.query(sql, [id]);
    return result.rows[0];
  },

  actualizar: async (id, datos) => {
    const usuarioActual = await db.query(
      'SELECT contrasena FROM usuario WHERE id_usuario=$1',
      [id]
    );
    const contrasenaActual = usuarioActual.rows[0].contrasena;

    const {
      nombre_usuario,
      apellido_usuario,
      telefono_usuario,
      correo_usuario,
      direccion_usuario,
      contrasena,
      codigo_postal,
      estado_usuario,
      municipio_usuario,
      colonia_usuario,
      referencias
    } = datos;

    const sql = `
      UPDATE usuario
      SET nombre_usuario = $1,
          apellido_usuario = $2,
          telefono_usuario = $3,
          correo_usuario = $4,
          direccion_usuario = $5,
          contrasena = $6,
          codigo_postal = $7,
          estado_usuario = $8,
          municipio_usuario = $9,
          colonia_usuario = $10,
          referencias = $11
      WHERE id_usuario = $12
      RETURNING *;
    `;

    const values = [
      nombre_usuario,
      apellido_usuario,
      telefono_usuario,
      correo_usuario,
      direccion_usuario,
      contrasena || contrasenaActual,
      codigo_postal,
      estado_usuario,
      municipio_usuario,
      colonia_usuario,
      referencias,
      id
    ];

    const result = await db.query(sql, values);
    return result.rows[0];
  }
};

module.exports = {
  getAllUsers,
  deleteUserById,
  ...Usuario
};


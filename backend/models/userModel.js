const db = require('../config/db');

// Obtener todos los usuarios
async function getAllUsers() {
  try {
    const result = await db.query(`
      SELECT 
        id_usuario,
        nombre_usuario,
        correo_usuario,
        estado_usuario
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

module.exports = { getAllUsers, deleteUserById };

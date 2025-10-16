const db = require('../config/db'); // conexión desde pool de PostgreSQL

// Obtener todos los productos con información de categoría
async function getAllProducts() {
  try {
    const result = await db.query(`
      SELECT 
        p.id_producto,
        p.nombre AS nombre_producto,
        p.marca,
        p.descripcion,
        p.precio,
        c.nombre_categoria AS categoria
      FROM productos p
      LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
      ORDER BY p.id_producto ASC;
    `);
    return result.rows;
  } catch (error) {
    console.error('Error en getAllProducts:', error.message);
    throw error;
  }
}

// Obtener un solo producto por ID con información de categoría
async function getProductById(id) {
  try {
    const result = await db.query(`
      SELECT 
        p.id_producto,
        p.nombre AS nombre_producto,
        p.marca,
        p.descripcion,
        p.precio,
        c.nombre_categoria AS categoria
      FROM productos p
      LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
      WHERE p.id_producto = $1;
    `, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error en getProductById:', error.message);
    throw error;
  }
}

module.exports = { getAllProducts, getProductById };

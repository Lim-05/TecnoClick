const db = require('../config/db'); // conexión desde pool de PostgreSQL

// Obtener todos los productos con información de categoría
async function getAllProducts() {
  try {
    const result = await db.query(`
      SELECT 
        p.id_producto,
        p.id_categoria,
        p.nombre AS nombre_producto,
        p.marca,
        p.descripcion,
        p.precio,
        p.imagen,
        p.stock,
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
        p.id_categoria,
        p.nombre AS nombre_producto,
        p.marca,
        p.descripcion,
        p.precio,
        p.imagen,
        p.stock,
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

async function deleteProductById(id) {
  try {
    const result = await db.query(
      `DELETE FROM productos WHERE id_producto = $1 RETURNING *;`,
      [id]
    );
    return result.rowCount > 0; // true si se eliminó correctamente
  } catch (error) {
    console.error('Error en deleteProductById:', error.message);
    throw error;
  }
}

async function getCategoriesWithCounts() {
  const result = await db.query(`
    SELECT c.id_categoria, c.nombre_categoria,
           COUNT(p.id_producto)::int AS count
    FROM categoria c
    LEFT JOIN productos p ON p.id_categoria = c.id_categoria
    GROUP BY c.id_categoria, c.nombre_categoria
    ORDER BY c.id_categoria`);
  return result.rows;
}

module.exports = { getAllProducts, getProductById, deleteProductById, getCategoriesWithCounts };

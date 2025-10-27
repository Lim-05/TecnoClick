const db = require('../config/db');

// Crear una nueva reseña
async function createResena(resenaData) {
  try {
    const { resena, id_usuario, id_producto } = resenaData;
    
    const result = await db.query(
      `INSERT INTO resena (resena, id_usuario, id_producto)
       VALUES ($1, $2, $3)
       RETURNING *;`,
      [resena, id_usuario, id_producto]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error en createResena:', error.message);
    throw error;
  }
}

// Obtener reseñas por producto
async function getResenasByProducto(id_producto) {
  try {
    const result = await db.query(
      `SELECT 
        r.id_resena,
        r.resena,
        r.id_usuario,
        r.id_producto,
        u.nombre_usuario,
        u.apellido_usuario
       FROM resena r
       INNER JOIN usuario u ON r.id_usuario = u.id_usuario
       WHERE r.id_producto = $1
       ORDER BY r.id_resena DESC;`,
      [id_producto]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Error en getResenasByProducto:', error.message);
    throw error;
  }
}

// Verificar si el usuario ha agregado alguna reseña para el producto
async function hasUserReviewed(id_usuario, id_producto) {
  try {
    const result = await db.query(
      `SELECT id_resena FROM resena 
       WHERE id_usuario = $1 AND id_producto = $2;`,
      [id_usuario, id_producto]
    );
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error en hasUserReviewed:', error.message);
    throw error;
  }
}

// Verificar si el usuario compró el producto
async function hasUserPurchasedProduct(id_usuario, id_producto) {
  try {
    const result = await db.query(
      `SELECT 1 
       FROM detalle_pedido dp
       INNER JOIN pedido p ON dp.id_pedido = p.id_pedido
       WHERE p.id_usuario = $1 AND dp.id_producto = $2
       LIMIT 1;`,
      [id_usuario, id_producto]
    );
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error en hasUserPurchasedProduct:', error.message);
    throw error;
  }
}

// Obtener total de reseñas de un producto 
async function getAverageRating(id_producto) {
  try {
    const result = await db.query(
      `SELECT 
        COUNT(*) as total_resenas
       FROM resena 
       WHERE id_producto = $1;`,
      [id_producto]
    );
    
    // Retornar formato compatible 
    return {
      promedio: 0,
      total_resenas: result.rows[0].total_resenas
    };
  } catch (error) {
    console.error('Error en getAverageRating:', error.message);
    throw error;
  }
}

module.exports = {
  createResena,
  getResenasByProducto,
  hasUserReviewed,
  hasUserPurchasedProduct,
  getAverageRating
};

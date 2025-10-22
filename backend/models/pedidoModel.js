const db = require('../config/db');

// Obtener historial de pedidos por usuario
async function getPedidosByUsuario(idUsuario) {
  try {
    console.log(' Ejecutando consulta para usuario:', idUsuario);
    
    const query = `
      SELECT 
        p.id_pedido,
        p.monto_pedido,
        p.fecha_pedido,
        p.estado_pedido,
        p.id_producto,
        COALESCE(pe.folio, 'N/A') as folio_pago,
        CASE 
          WHEN pe.id_pedido IS NOT NULL THEN 'efectivo'
          ELSE 'tarjeta'
        END as metodo_pago,
        pr.nombre as nombre_producto,
        pr.marca,
        pr.descripcion,
        pr.precio,
        pr.imagen,
        1 as cantidad,
        p.monto_pedido as subtotal
      FROM pedido p
      LEFT JOIN pago_efectivo pe ON p.id_pedido = pe.id_pedido
      LEFT JOIN productos pr ON p.id_producto = pr.id_producto
      WHERE p.id_usuario = $1
      ORDER BY p.fecha_pedido DESC;
    `;
    
    console.log(' Query:', query);
    console.log(' Parámetros:', [idUsuario]);
    
    const result = await db.query(query, [idUsuario]);
    
    console.log(' Resultado de la consulta:', result.rows.length, 'filas');
    console.log(' Datos:', result.rows);
    
    return result.rows;
  } catch (error) {
    console.error(' Error en getPedidosByUsuario:', error.message);
    console.error(' Query que falló:', error.query);
    throw error;
  }
}

// Obtener detalle de un pedido específico
async function getPedidoById(idPedido, idUsuario) {
  try {
    const result = await db.query(`
      SELECT 
        p.id_pedido,
        p.monto_pedido,
        p.fecha_pedido,
        p.estado_pedido,
        p.id_producto,
        COALESCE(pe.folio, 'N/A') as folio_pago,
        CASE 
          WHEN pe.id_pedido IS NOT NULL THEN 'efectivo'
          ELSE 'tarjeta'
        END as metodo_pago,
        pr.nombre as nombre_producto,
        pr.marca,
        pr.descripcion,
        pr.precio,
        pr.imagen,
        1 as cantidad,
        p.monto_pedido as subtotal
      FROM pedido p
      LEFT JOIN pago_efectivo pe ON p.id_pedido = pe.id_pedido
      LEFT JOIN productos pr ON p.id_producto = pr.id_producto
      WHERE p.id_pedido = $1 AND p.id_usuario = $2;
    `, [idPedido, idUsuario]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error en getPedidoById:', error.message);
    throw error;
  }
}

module.exports = {
  getPedidosByUsuario,
  getPedidoById
};
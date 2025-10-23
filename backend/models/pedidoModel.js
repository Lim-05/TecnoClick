const db = require('../config/db');

// Obtener historial de pedidos por usuario
async function getPedidosByUsuario(idUsuario) {
  try {
    const result = await db.query(`
      SELECT 
        p.id_pedido,
        p.monto_pedido,
        p.fecha_pedido,
        p.estado_pedido,
        COALESCE(pe.folio, 'N/A') as folio_pago,
        CASE 
          WHEN pe.id_pedido IS NOT NULL THEN 'efectivo'
          ELSE 'tarjeta'
        END as metodo_pago,
        json_agg(
          json_build_object(
            'id_producto', dp.id_producto,
            'nombre_producto', pr.nombre,
            'marca', pr.marca,
            'cantidad', dp.cantidad,
            'precio_unitario', pr.precio,
            'subtotal', dp.subtotal,
            'imagen', pr.imagen
          )
        ) as productos
      FROM pedido p
      LEFT JOIN pago_efectivo pe ON p.id_pedido = pe.id_pedido
      LEFT JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
      LEFT JOIN productos pr ON dp.id_producto = pr.id_producto
      WHERE p.id_usuario = $1
      GROUP BY p.id_pedido, p.monto_pedido, p.fecha_pedido, p.estado_pedido, pe.folio, pe.id_pedido
      ORDER BY p.fecha_pedido DESC;
    `, [idUsuario]);
    
    return result.rows;
  } catch (error) {
    console.error('Error en getPedidosByUsuario:', error.message);
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
        COALESCE(pe.folio, 'N/A') as folio_pago,
        CASE 
          WHEN pe.id_pedido IS NOT NULL THEN 'efectivo'
          ELSE 'tarjeta'
        END as metodo_pago,
        json_agg(
          json_build_object(
            'id_producto', dp.id_producto,
            'nombre_producto', pr.nombre,
            'marca', pr.marca,
            'descripcion', pr.descripcion,
            'cantidad', dp.cantidad,
            'precio_unitario', pr.precio,
            'subtotal', dp.subtotal,
            'imagen', pr.imagen
          )
        ) as productos
      FROM pedido p
      LEFT JOIN pago_efectivo pe ON p.id_pedido = pe.id_pedido
      LEFT JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
      LEFT JOIN productos pr ON dp.id_producto = pr.id_producto
      WHERE p.id_pedido = $1 AND p.id_usuario = $2
      GROUP BY p.id_pedido, p.monto_pedido, p.fecha_pedido, p.estado_pedido, pe.folio, pe.id_pedido;
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
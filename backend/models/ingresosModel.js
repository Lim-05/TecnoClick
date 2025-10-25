const db = require('../config/db');

// Obtener ingresos por pago en efectivo
async function getIngresosEfectivo() {
  try {
    const result = await db.query(`
      SELECT 
        u.nombre_usuario || ' ' || u.apellido_usuario AS cliente,
        u.correo_usuario,
        i.fecha_ingreso,
        pe.folio AS folio_pago,
        pr.nombre AS producto,
        dp.cantidad,
        dp.subtotal
      FROM ingresos i
      JOIN pedido p ON i.id_pedido = p.id_pedido
      JOIN pago_efectivo pe ON p.id_pedido = pe.id_pedido
      JOIN usuario u ON p.id_usuario = u.id_usuario
      JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
      JOIN productos pr ON dp.id_producto = pr.id_producto
      ORDER BY i.fecha_ingreso DESC, p.id_pedido;
    `);
    return result.rows;
  } catch (error) {
    console.error('Error en getIngresosEfectivo:', error.message);
    throw error;
  }
}

// Obtener ingresos por pago con tarjeta
async function getIngresosTarjeta() {
  try {
    const result = await db.query(`
      SELECT 
        u.nombre_usuario || ' ' || u.apellido_usuario AS cliente,
        u.correo_usuario,
        i.fecha_ingreso,
        pt.folio AS folio_pago,
        pr.nombre AS producto,
        dp.cantidad,
        dp.subtotal
      FROM ingresos i
      JOIN pedido p ON i.id_pedido = p.id_pedido
      JOIN pago_tarjeta pt ON p.id_pedido = pt.id_pedido
      JOIN usuario u ON p.id_usuario = u.id_usuario
      JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
      JOIN productos pr ON dp.id_producto = pr.id_producto
      ORDER BY i.fecha_ingreso DESC, p.id_pedido;
    `);
    return result.rows;
  } catch (error) {
    console.error('Error en getIngresosTarjeta:', error.message);
    throw error;
  }
}

module.exports = { getIngresosEfectivo, getIngresosTarjeta };

const db = require('../config/db');

async function crearPedido(idUsuario, productos, total) {
  const fecha = new Date();

  // Inserta pedido principal
  const pedidoResult = await db.query(
    `INSERT INTO pedido (monto_pedido, fecha_pedido, estado_pedido, id_usuario)
     VALUES ($1, $2, $3, $4)
     RETURNING id_pedido;`,
    [total, fecha, 'completado', idUsuario]
  );

  const idPedido = pedidoResult.rows[0].id_pedido;

  // Registrar detalle de productos
  for (const producto of productos) {
    const precioProducto = await obtenerPrecioProducto(producto.id);
    const subtotal = precioProducto * producto.quantity;

    // Insertar en detalle_pedido
    await registrarDetallePedido(idPedido, producto.id, producto.quantity, subtotal);

    // Descontar stock
    await db.query(
      `UPDATE productos SET stock = stock - $1 WHERE id_producto = $2 AND stock >= $1;`,
      [producto.quantity, producto.id]
    );
  }

  return idPedido;
}

async function registrarDetallePedido(idPedido, idProducto, cantidad, subtotal) {
  await db.query(
    `INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, subtotal)
     VALUES ($1, $2, $3, $4);`,
    [idPedido, idProducto, cantidad, subtotal]
  );
}

async function obtenerPrecioProducto(idProducto) {
  const result = await db.query(
    `SELECT precio FROM productos WHERE id_producto = $1;`,
    [idProducto]
  );
  return parseFloat(result.rows[0].precio);
}

async function registrarPagoEfectivo(idPedido, idUsuario, folio) {
  const result = await db.query(
    `INSERT INTO pago_efectivo (folio, id_pedido, id_usuario)
     VALUES ($1, $2, $3)
     RETURNING *;`,
    [folio, idPedido, idUsuario]
  );
  return result.rows[0];
}

async function registrarIngreso(idPedido) {
  const fecha = new Date();

  const result = await db.query(
    `INSERT INTO ingresos (fecha_ingreso, id_pedido)
     VALUES ($1, $2)
     RETURNING *;`,
    [fecha, idPedido]
  );
  return result.rows[0];
}

async function registrarPagoTarjeta(idPedido, idUsuario, idTarjeta, folio) {
  const result = await db.query(
    `INSERT INTO pago_tarjeta (folio, id_pedido, id_usuario, id_tarjeta)
     VALUES ($1, $2, $3, $4)
     RETURNING *;`,
    [folio, idPedido, idUsuario, idTarjeta]
  );
  return result.rows[0];
}


module.exports = {
  crearPedido,
  registrarPagoEfectivo,
  registrarIngreso,
  registrarPagoTarjeta
};

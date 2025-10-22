const db = require('../config/db');

async function crearPedido(idUsuario, productos, total) {
  const fecha = new Date();

  // Inserta pedido
  const pedidoResult = await db.query(
    `INSERT INTO pedido (monto_pedido, fecha_pedido, estado_pedido, id_usuario)
     VALUES ($1, $2, $3, $4)
     RETURNING id_pedido;`,
    [total, fecha, 'completado', idUsuario]
  );

  const idPedido = pedidoResult.rows[0].id_pedido;

  // Descontar stock de cada producto
  for (const producto of productos) {
    await db.query(
      `UPDATE productos SET stock = stock - $1 WHERE id_producto = $2 AND stock >= $1;`,
      [producto.quantity, producto.id]
    );
  }

  return idPedido;
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

module.exports = {
  crearPedido,
  registrarPagoEfectivo,
  registrarIngreso
};

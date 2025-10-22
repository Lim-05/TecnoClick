const { getPedidosByUsuario, getPedidoById } = require('../models/pedidoModel');

// Obtener historial de compras del usuario
async function obtenerHistorialCompras(req, res) {
  try {
    const { idUsuario } = req.params;

    console.log(' Buscando historial para usuario:', idUsuario);

    // Llamar al modelo
    const pedidos = await getPedidosByUsuario(idUsuario);

    console.log(' Pedidos encontrados:', pedidos);

    // Si no hay pedidos, devolver array vacío
    if (!pedidos || pedidos.length === 0) {
      console.log('📭 No hay pedidos para este usuario');
      return res.status(200).json({
        mensaje: 'No hay compras registradas',
        historial: [],
        totalCompras: 0
      });
    }

    // Formatear la respuesta para un solo producto por pedido
    const historial = pedidos.map(pedido => ({
      id: pedido.id_pedido,
      fecha: pedido.fecha_pedido,
      total: parseFloat(pedido.monto_pedido),
      estado: pedido.estado_pedido,
      folio: pedido.folio_pago,
      metodoPago: pedido.metodo_pago,
      productos: [
        {
          id: pedido.id_producto,
          nombre: pedido.nombre_producto,
          cantidad: pedido.cantidad,
          precioUnitario: parseFloat(pedido.precio),
          subtotal: parseFloat(pedido.subtotal),
          imagen: pedido.imagen,
          marca: pedido.marca
        }
      ],
      cantidadProductos: 1
    }));

    console.log(' Historial formateado:', historial.length, 'pedidos');

    res.status(200).json({
      mensaje: 'Historial de compras obtenido exitosamente',
      historial,
      totalCompras: historial.length
    });

  } catch (error) {
    console.error(' Error en obtenerHistorialCompras:', error.message);
    console.error(' Stack trace:', error.stack);
    res.status(500).json({ 
      mensaje: 'Error al obtener el historial de compras', 
      error: error.message 
    });
  }
}

// Obtener detalle de una compra específica
async function obtenerDetalleCompra(req, res) {
  try {
    const { idPedido, idUsuario } = req.params;

    console.log('🔍 Buscando detalle del pedido:', idPedido, 'para usuario:', idUsuario);

    const pedido = await getPedidoById(idPedido, idUsuario);

    if (!pedido) {
      return res.status(404).json({ 
        mensaje: 'Pedido no encontrado o no pertenece al usuario' 
      });
    }

    // Formatear la respuesta para un solo producto
    const detalle = {
      id: pedido.id_pedido,
      fecha: pedido.fecha_pedido,
      total: parseFloat(pedido.monto_pedido),
      estado: pedido.estado_pedido,
      folio: pedido.folio_pago,
      metodoPago: pedido.metodo_pago,
      productos: [
        {
          id: pedido.id_producto,
          nombre: pedido.nombre_producto,
          cantidad: pedido.cantidad,
          precioUnitario: parseFloat(pedido.precio),
          subtotal: parseFloat(pedido.subtotal),
          imagen: pedido.imagen,
          marca: pedido.marca,
          descripcion: pedido.descripcion
        }
      ]
    };

    res.status(200).json({
      mensaje: 'Detalle de compra obtenido exitosamente',
      compra: detalle
    });

  } catch (error) {
    console.error(' Error en obtenerDetalleCompra:', error.message);
    res.status(500).json({ 
      mensaje: 'Error al obtener el detalle de la compra', 
      error: error.message 
    });
  }
}

module.exports = {
  obtenerHistorialCompras,
  obtenerDetalleCompra
};
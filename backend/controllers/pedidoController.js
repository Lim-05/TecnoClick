const { getPedidosByUsuario, getPedidoById } = require('../models/pedidoModel');

// Obtener historial de compras del usuario
async function obtenerHistorialCompras(req, res) {
  try {
    const { idUsuario } = req.params;

    console.log('Buscando historial para usuario:', idUsuario);

    const pedidos = await getPedidosByUsuario(idUsuario);

    console.log('Pedidos encontrados:', pedidos.length);

    // Formatear la respuesta con múltiples productos por pedido
    const historial = pedidos.map(pedido => ({
      id: pedido.id_pedido,
      fecha: pedido.fecha_pedido,
      total: parseFloat(pedido.monto_pedido),
      estado: pedido.estado_pedido,
      folio: pedido.folio_pago,
      metodoPago: pedido.metodo_pago,
      productos: pedido.productos || [],
      cantidadProductos: pedido.productos ? pedido.productos.reduce((sum, prod) => sum + prod.cantidad, 0) : 0
    }));

    res.status(200).json({
      mensaje: 'Historial de compras obtenido exitosamente',
      historial,
      totalCompras: historial.length
    });

  } catch (error) {
    console.error('Error en obtenerHistorialCompras:', error.message);
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

    console.log('Buscando detalle del pedido:', idPedido, 'para usuario:', idUsuario);

    const pedido = await getPedidoById(idPedido, idUsuario);

    if (!pedido) {
      return res.status(404).json({ 
        mensaje: 'Pedido no encontrado o no pertenece al usuario' 
      });
    }

    
    const detalle = {
      id: pedido.id_pedido,
      fecha: pedido.fecha_pedido,
      total: parseFloat(pedido.monto_pedido),
      estado: pedido.estado_pedido,
      folio: pedido.folio_pago,
      metodoPago: pedido.metodo_pago,
      productos: (pedido.productos || []).map(producto => ({
        id: producto.id_producto,
        nombre: producto.nombre_producto,
        marca: producto.marca,
        descripcion: producto.descripcion,
        cantidad: producto.cantidad,
        precioUnitario: parseFloat(producto.precio_unitario),
        subtotal: parseFloat(producto.subtotal),
        imagen: producto.imagen
      }))
    };

    res.status(200).json({
      mensaje: 'Detalle de compra obtenido exitosamente',
      compra: detalle
    });

  } catch (error) {
    console.error('Error en obtenerDetalleCompra:', error.message);
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
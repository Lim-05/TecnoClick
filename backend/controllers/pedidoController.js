const { getPedidosByUsuario, getPedidoById } = require('../models/pedidoModel');
const { firmarDatos, verificarFirma } = require('../services/asymmetric');

// Obtener historial de compras del usuario
async function obtenerHistorialCompras(req, res) {
  try {
    const idUsuario = req.usuario.id_usuario;

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
    const { idPedido } = req.params;
    const idUsuario = req.usuario.id_usuario;

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

    // Firma asimétrica del comprobante de compra (Punto 2)
    const datosCertificados = {
      idPedido: detalle.id,
      folio: detalle.folio,
      total: detalle.total,
      fecha: detalle.fecha,
      metodoPago: detalle.metodoPago
    };
    const firmaDigital = firmarDatos(datosCertificados);

    res.status(200).json({
      mensaje: 'Detalle de compra obtenido exitosamente',
      compra: detalle,
      comprobanteDigital: {
        datosCertificados,
        firmaDigital,
        algoritmo: 'RSA-SHA256'
      }
    });

  } catch (error) {
    console.error('Error en obtenerDetalleCompra:', error.message);
    res.status(500).json({ 
      mensaje: 'Error al obtener el detalle de la compra', 
      error: error.message 
    });
  }
}

// Endpoint para verificar la autenticidad e integridad de un comprobante digital
async function verificarComprobante(req, res) {
  try {
    const { datos, firma } = req.body;
    if (!datos || !firma) {
      return res.status(400).json({ mensaje: 'Datos y firma son requeridos.' });
    }

    const esValido = verificarFirma(datos, firma);
    res.json({
      autentico: esValido,
      mensaje: esValido
        ? 'El comprobante es auténtico y su integridad fue verificada con la clave pública RSA.'
        : 'La firma es inválida o el comprobante ha sido alterado.'
    });
  } catch (error) {
    console.error('Error en verificarComprobante:', error.message);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  obtenerHistorialCompras,
  obtenerDetalleCompra,
  verificarComprobante
};
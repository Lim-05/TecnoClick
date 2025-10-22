const { crearPedido, registrarPagoEfectivo, registrarIngreso } = require('../models/checkoutModel');

async function procesarPagoEfectivo(req, res) {
  try {
    const { idUsuario, productos, total, folio } = req.body;

    if (!idUsuario || !productos || productos.length === 0) {
      return res.status(400).json({ mensaje: 'Datos incompletos para procesar el pago' });
    }

    // Crear pedido + detalle + actualizar stock
    const idPedido = await crearPedido(idUsuario, productos, total);

    // Registrar pago en efectivo
    await registrarPagoEfectivo(idPedido, idUsuario, folio);

    // Registrar ingreso
    await registrarIngreso(idPedido);

    res.status(201).json({
      mensaje: 'Compra en efectivo registrada exitosamente',
      folio,
      idPedido
    });

  } catch (error) {
    console.error('Error al procesar pago en efectivo:', error.message);
    res.status(500).json({ mensaje: 'Error al registrar el pago', error: error.message });
  }
}

module.exports = { procesarPagoEfectivo };

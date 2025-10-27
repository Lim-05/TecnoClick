const { crearPedido, registrarPagoEfectivo, registrarIngreso } = require('../models/checkoutModel');

async function procesarPagoEfectivo(req, res) {
  try {
    const { idUsuario, productos, total, folio } = req.body;

    if (!idUsuario || !productos || productos.length === 0) {
      return res.status(400).json({ mensaje: 'Datos incompletos para procesar el pago' });
    }

    // Crear pedido como pendiente
    const idPedido = await crearPedido(idUsuario, productos, total, 'pendiente');

    // Registrar pago en efectivo
    await registrarPagoEfectivo(idPedido, idUsuario, folio);

    // No registrar ingreso aún, eso lo hará el admin

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

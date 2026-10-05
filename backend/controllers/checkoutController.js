const { crearPedido, registrarPagoEfectivo } = require('../models/checkoutModel');
const { products, text } = require('../services/inputValidation');
const { respondError } = require('../services/access');

async function procesarPagoEfectivo(req, res) {
  try {
    const { productos, total, folio } = req.body;
    const idUsuario = req.usuario.id_usuario;

    const productosValidados = products(productos);
    const folioValidado = text(folio, 'El folio', 40);

    const idPedido = await crearPedido(idUsuario, productosValidados, null, 'pendiente');

    // Registrar pago en efectivo
    await registrarPagoEfectivo(idPedido, idUsuario, folioValidado);

    // No registrar ingreso aún, eso lo hará el admin

    res.status(201).json({
      mensaje: 'Compra en efectivo registrada exitosamente',
      folio: folioValidado,
      idPedido
    });

  } catch (error) {
    console.error('Error al procesar pago en efectivo:', error.message);
    respondError(res, error);
  }
}

module.exports = { procesarPagoEfectivo };

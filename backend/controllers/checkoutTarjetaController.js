const { crearPedido, registrarPagoTarjeta, registrarIngreso } = require('../models/checkoutModel');
const { insertarDatosTarjeta } = require('../models/tarjetaModel');
const { products, card } = require('../services/inputValidation');
const { respondError } = require('../services/access');

async function procesarPagoTarjeta(req, res) {
  try {
    const { productos, total, tarjeta } = req.body;
    const idUsuario = req.usuario.id_usuario;

    const productosValidados = products(productos);
    const tarjetaValidada = card(tarjeta);

    // Crear pedido + detalle + actualizar stock
    const idPedido = await crearPedido(idUsuario, productosValidados, null);

    // Insertar nueva tarjeta sin bloquear por usuario

  const tarjetaGuardada = await insertarDatosTarjeta(
    tarjetaValidada.nombre_titular,
    tarjetaValidada.numero_tarjeta,
    tarjetaValidada.fecha_vencimiento,
    tarjetaValidada.cvv,
    idUsuario
  );

  const idTarjeta = tarjetaGuardada.id_tarjeta;


    const folio = 'TEC' + Date.now().toString().slice(-8);
    await registrarPagoTarjeta(idPedido, idUsuario, idTarjeta, folio);

    await registrarIngreso(idPedido);

    res.status(201).json({
      mensaje: 'Pago con tarjeta registrado exitosamente',
      folio,
      idPedido
    });

  } catch (error) {
    console.error('Error al procesar pago con tarjeta:', error.message);
    respondError(res, error);
  }
}

module.exports = { procesarPagoTarjeta };

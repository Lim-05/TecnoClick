const { crearPedido, registrarPagoTarjeta, registrarIngreso } = require('../models/checkoutModel');
const { insertarDatosTarjeta, obtenerPorUsuario } = require('../models/tarjetaModel');

async function procesarPagoTarjeta(req, res) {
  try {
    const { idUsuario, productos, total, tarjeta } = req.body;

    if (!idUsuario || !productos || productos.length === 0) {
      return res.status(400).json({ mensaje: 'Datos incompletos para procesar el pago' });
    }

    // Crear pedido + detalle + actualizar stock
    const idPedido = await crearPedido(idUsuario, productos, total);

    // Guardar o reutilizar tarjeta
    let tarjetaExistente = await obtenerPorUsuario(idUsuario);
    let idTarjeta;
    if (tarjetaExistente.length > 0) {
      idTarjeta = tarjetaExistente[0].id_tarjeta;
    } else {
      const tarjetaGuardada = await insertarDatosTarjeta(
        tarjeta.nombre_titular,
        tarjeta.numero_tarjeta,
        tarjeta.fecha_vencimiento,
        tarjeta.cvv,
        idUsuario
      );
      idTarjeta = tarjetaGuardada.id_tarjeta;
    }

    const folio = 'TEC' + Date.now().toString().slice(-8);
    await registrarPagoTarjeta(idPedido, idUsuario, idTarjeta, folio);

    await registrarIngreso(idPedido);

    res.status(201).json({
      mensaje: 'Pago con tarjeta registrado exitosamente',
      folio,
      idPedido
    });

  } catch (error) {
    console.error('Error al procesar pago con tarjeta:', error);
    res.status(500).json({ mensaje: 'Error al registrar el pago', error: error.message });
  }
}

module.exports = { procesarPagoTarjeta };

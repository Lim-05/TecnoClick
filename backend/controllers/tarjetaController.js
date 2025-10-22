const { insertarDatosTarjeta, buscarTarjetaPorUsuario } = require('../models/tarjetaModel');

const guardarDatosTarjeta = async (req, res) => {
  try {
    const { nombre_titular, numero_tarjeta, fecha_vencimiento, cvv, id_usuario } = req.body;

    if (!id_usuario) {
      return res.status(400).json({ error: 'Falta el id_usuario' });
    }

    // Validar si el usuario ya tiene tarjeta registrada (opcional)
    const tarjetasExistentes = await buscarTarjetaPorUsuario(id_usuario);
    if (tarjetasExistentes.length > 0) {
      return res.status(400).json({ error: 'Ya existe una tarjeta registrada para este usuario' });
    }

    // Guardar en la base de datos
    const tarjeta = await insertarDatosTarjeta(nombre_titular, numero_tarjeta, fecha_vencimiento, cvv, id_usuario);

    res.status(201).json({
      message: 'Datos de tarjeta guardados correctamente',
      id_tarjeta: tarjeta.id_tarjeta
    });

  } catch (error) {
    console.error('Error en guardarDatosTarjeta:', error);
    res.status(500).json({ error: 'Error al guardar los datos de la tarjeta' });
  }
};

module.exports = {
  guardarDatosTarjeta
};

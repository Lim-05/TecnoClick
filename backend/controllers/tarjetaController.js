const { insertarDatosTarjeta } = require('../models/tarjetaModel');
const {Tarjeta} = require('../models/tarjetaModel');
const { card, positiveId } = require('../services/inputValidation');

const guardarDatosTarjeta = async (req, res) => {
  try {
    const tarjeta = card(req.body.tarjeta);
    const id_usuario = req.usuario.id_usuario;
    
    // Guardar en la base de datos
    const tarjetaInsertada = await insertarDatosTarjeta(
      tarjeta.nombre_titular,
      tarjeta.numero_tarjeta,
      tarjeta.fecha_vencimiento,
      tarjeta.cvv,
      id_usuario);

    res.status(201).json({
      message: 'Datos de tarjeta guardados correctamente',
      id_tarjeta: tarjetaInsertada.id_tarjeta
    });

  } catch (error) {
    console.error('Error en guardarDatosTarjeta:', error);
    res.status(500).json({ error: 'Error al guardar los datos de la tarjeta' });
  }
};

const obtenerTarjetaUsuario = async (req, res) => {
  try {
    const id_usuario = positiveId(req.params.id_usuario);
    const tarjetas = await Tarjeta.obtenerPorUsuario(id_usuario);

    if (tarjetas.length === 0) {
      return res.status(404).json({ error: 'No se encontró tarjeta para este usuario' });
    }

    // TODAS tarjetas
    res.json(tarjetas);
  } catch (error) {
    console.error('Error en obtenerTarjetaUsuario:', error);
    res.status(500).json({ error: 'Error al obtener la tarjeta' });
  }
};

const agregarTarjeta = async (req, res) => {
  try {
    const datos = card(req.body);
    await Tarjeta.agregar(req.usuario.id_usuario, datos);
    res.status(201).json({ message: 'Tarjeta agregada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarTarjeta = async (req, res) => {
  try {
    const id_tarjeta = positiveId(req.params.id_tarjeta);
    const tarjetaActualizada = await Tarjeta.actualizar(
      id_tarjeta,
      card(req.body),
      req.usuario.id_usuario
    );

    if (!tarjetaActualizada) {
      return res.status(404).json({ error: 'Tarjeta no encontrada' });
    }

    res.json({ mensaje: 'Tarjeta actualizada correctamente', tarjeta: tarjetaActualizada });
  } catch (error) {
    console.error('Error actualizando tarjeta:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};


const eliminarTarjeta = async (req, res) => {
  try {
    const id_usuario = positiveId(req.params.id_usuario);
    const id_tarjeta = positiveId(req.params.id_tarjeta);
    await Tarjeta.eliminar(id_usuario, id_tarjeta);
    res.json({ message: 'Tarjeta eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  guardarDatosTarjeta,
  obtenerTarjetaUsuario,
  agregarTarjeta,
  actualizarTarjeta, 
  eliminarTarjeta
};

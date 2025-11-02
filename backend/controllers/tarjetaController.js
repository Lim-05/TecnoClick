const { insertarDatosTarjeta, buscarTarjetaPorUsuario } = require('../models/tarjetaModel');
const {Tarjeta} = require('../models/tarjetaModel');
const db = require('../config/db');

const guardarDatosTarjeta = async (req, res) => {
  try {
    console.log('Datos recibidos en el backend:', req.body); 
    const { id_usuario, tarjeta } = req.body;
    const {nombre_titular, numero_tarjeta, fecha_vencimiento, cvv} = tarjeta;

    if (!id_usuario) {
      return res.status(400).json({ error: 'Falta el id_usuario' });
    }
    
    // Guardar en la base de datos
    const tarjetaInsertada = await insertarDatosTarjeta(
      nombre_titular, 
      numero_tarjeta, 
      fecha_vencimiento, 
      cvv, 
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
    const { id_usuario } = req.params;
    console.log('ID de user', id_usuario);
    const tarjetas = await Tarjeta.obtenerPorUsuario(id_usuario);
    console.log('Tarjetas encontradas: ', tarjetas);

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
  const { id_usuario } = req.params;
  const datos = req.body;
  try {
    await Tarjeta.agregar(id_usuario, datos);
    res.status(201).json({ message: 'Tarjeta agregada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarTarjeta = async (req, res) => {
  const { id_tarjeta } = req.params;
  const { nombre_titular, numero_tarjeta, fecha_vencimiento, cvv } = req.body;

  try {
    const tarjetaActualizada = await Tarjeta.actualizar(id_tarjeta, { nombre_titular, numero_tarjeta, fecha_vencimiento, cvv });

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
  const { id_usuario, id_tarjeta } = req.params;
  try {
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

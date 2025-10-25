const { getIngresosEfectivo, getIngresosTarjeta } = require('../models/ingresosModel');

// Controlador para ingresos en efectivo
async function ingresosEfectivo(req, res) {
  try {
    const ingresos = await getIngresosEfectivo();
    res.json(ingresos);
  } catch (error) {
    console.error('Error al obtener ingresos en efectivo:', error.message);
    res.status(500).json({ mensaje: 'Error al obtener ingresos en efectivo' });
  }
}

// Controlador para ingresos con tarjeta
async function ingresosTarjeta(req, res) {
  try {
    const ingresos = await getIngresosTarjeta();
    res.json(ingresos);
  } catch (error) {
    console.error('Error al obtener ingresos con tarjeta:', error.message);
    res.status(500).json({ mensaje: 'Error al obtener ingresos con tarjeta' });
  }
}

module.exports = { ingresosEfectivo, ingresosTarjeta };

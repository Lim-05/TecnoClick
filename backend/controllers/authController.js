// controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');

const login = async (req, res) => {
  const { correo, contra } = req.body;

  // Validar que existan datos
  if (!correo || !contra) {
    return res.status(400).json({ mensaje: 'Correo y contraseña son requeridos' });
  }

  try {
    // Buscar el usuario por correo
    const sql = 'SELECT * FROM usuario WHERE correo_usuario = $1';
    const result = await db.query(sql, [correo]);

    if (result.rows.length === 0) {
      return res.status(401).json({ mensaje: 'Usuario no encontrado' });
    }

    const usuario = result.rows[0];

    const esValida = await bcrypt.compare(contra, usuario.contrasena);
    if (!esValida) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    delete usuario.contrasena;

    const rol = usuario.rol || 'cliente';

    res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        apellido_usuario: usuario.apellido_usuario,
        telefono_usuario: usuario.telefono_usuario,
        correo_usuario: usuario.correo_usuario,
        direccion_usuario: usuario.direccion_usuario,
        codigo_postal: usuario.codigo_postal,
        estado_usuario: usuario.estado_usuario,
        municipio_usuario: usuario.municipio_usuario,
        colonia_usuario: usuario.colonia_usuario,
        referencias: usuario.referencias,
        rol, // devolvemos el rol
      },
    });

  } catch (err) {
    console.error('Error en login:', err.message);
    res.status(500).json({ mensaje: 'Error del servidor', error: err.message });
  }
};

module.exports = { login };

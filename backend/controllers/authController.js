const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { 
  getAccess, safeUser, audit, transaction, respondError 
} = require('../services/access');

const { 
  enviarCorreoRecuperacion 
} = require('../services/email');

const SECRET = process.env.JWT_SECRET || 'claveSecreta';
async function login(req, res) {
  const { correo, contra } = req.body;
  if (typeof correo !== 'string' || typeof contra !== 'string' || !correo || !contra) {
    return res.status(400).json({ mensaje: 'Correo y contraseña son requeridos.' });
  }
  try {
    const result = await db.query('SELECT * FROM usuario WHERE correo_usuario = $1', [correo.trim()]);
    const usuario = result.rows[0];
    if (!usuario || !(await bcrypt.compare(contra, usuario.contrasena))) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos.' });
    }
    const access = await getAccess(usuario.id_usuario);
    if (!access) return res.status(403).json({ mensaje: 'La cuenta no tiene un rol válido.' });
    await transaction(client => audit(client, access, 'sesion.iniciar', 'usuario', usuario.id_usuario));
    const token = jwt.sign({ id_usuario: usuario.id_usuario }, SECRET, { expiresIn: '2d' });
    res.json({ mensaje: 'Inicio de sesión exitoso', token, usuario: { ...safeUser(usuario), ...access } });
  } catch (error) { respondError(res, error); }
}

async function solicitarRecuperacion(req, res) {
  try {
    const { correo } = req.body;

    if (typeof correo !== 'string' || !correo.trim()) {
      return res.status(400).json({
        mensaje: 'El correo es requerido.'
      });
    }

    const correoLimpio = correo.trim();

    const result = await db.query(
      'SELECT id_usuario, correo_usuario FROM usuario WHERE correo_usuario = $1',
      [correoLimpio]
    );

    const usuario = result.rows[0];

    // No revelar si el correo existe o no
    if (!usuario) {
      return res.json({
        mensaje: 'Si el correo está registrado, recibirás un enlace de recuperación.'
      });
    }

    // Generar token aleatorio
    const token = crypto.randomBytes(32).toString('hex');

    // Expira en 30 minutos
    const expiracion = new Date(Date.now() + 30 * 60 * 1000);

    // Invalidar tokens anteriores
    await db.query(
      `UPDATE recuperacion_contrasena
       SET usado = TRUE
       WHERE id_usuario = $1
       AND usado = FALSE`,
      [usuario.id_usuario]
    );

    // Guardar nuevo token
    await db.query(
      `INSERT INTO recuperacion_contrasena
       (id_usuario, token, expiracion)
       VALUES ($1, $2, $3)`,
      [
        usuario.id_usuario,
        token,
        expiracion
      ]
    );

    const enlace =
      `http://localhost:5173/restablecer-contrasena/${token}`;

    await enviarCorreoRecuperacion(
      usuario.correo_usuario,
      enlace
    );

    res.json({
      mensaje: 'Si el correo está registrado, recibirás un enlace de recuperación.'
    });

  } catch (error) {
    respondError(res, error);
  }
}

async function restablecerContrasena(req, res) {
  try {
    const { token, contrasena } = req.body;

    if (
      typeof token !== 'string' ||
      typeof contrasena !== 'string' ||
      !token ||
      !contrasena
    ) {
      return res.status(400).json({
        mensaje: 'Token y contraseña son requeridos.'
      });
    }

    if (Buffer.byteLength(contrasena, 'utf8') > 72) {
      return res.status(400).json({
        mensaje: 'La contraseña no puede superar 72 bytes.'
      });
    }

    const result = await db.query(
      `SELECT id_recuperacion, id_usuario
       FROM recuperacion_contrasena
       WHERE token = $1
         AND usado = FALSE
         AND expiracion > NOW()`,
      [token]
    );

    const recuperacion = result.rows[0];

    if (!recuperacion) {
      return res.status(400).json({
        mensaje: 'El enlace de recuperación es inválido o ha expirado.'
      });
    }

    const hash = await bcrypt.hash(contrasena, 10);

    await transaction(async client => {

      await client.query(
        `UPDATE usuario
         SET contrasena = $1
         WHERE id_usuario = $2`,
        [
          hash,
          recuperacion.id_usuario
        ]
      );

      await client.query(
        `UPDATE recuperacion_contrasena
         SET usado = TRUE
         WHERE id_recuperacion = $1`,
        [recuperacion.id_recuperacion]
      );

      await audit(
        client,
        null,
        'contrasena.recuperar',
        'usuario',
        recuperacion.id_usuario
      );
    });

    res.json({
      mensaje: 'Contraseña restablecida correctamente.'
    });

  } catch (error) {
    respondError(res, error);
  }
}


async function session(req, res) {
  try {
    const result = await db.query('SELECT * FROM usuario WHERE id_usuario = $1', [req.usuario.id_usuario]);
    res.json({ usuario: { ...safeUser(result.rows[0]), ...req.usuario } });
  } catch (error) { respondError(res, error); }
}
module.exports = { 
  login,
  session,
  solicitarRecuperacion,
  restablecerContrasena
};

const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getAccess, safeUser, audit, transaction, respondError } = require('../services/access');
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
async function session(req, res) {
  try {
    const result = await db.query('SELECT * FROM usuario WHERE id_usuario = $1', [req.usuario.id_usuario]);
    res.json({ usuario: { ...safeUser(result.rows[0]), ...req.usuario } });
  } catch (error) { respondError(res, error); }
}
module.exports = { login, session };

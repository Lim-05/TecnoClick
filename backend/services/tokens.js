const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { transaction, getAccess } = require('./access');

const SECRET = process.env.JWT_SECRET;
if (!SECRET || Buffer.byteLength(SECRET) < 32) {
  throw new Error('Configura JWT_SECRET con un secreto aleatorio de al menos 32 bytes.');
}
const ACCESS_SECONDS = 15 * 60;
const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;
const cookieOptions = { httpOnly: true, secure: true, sameSite: 'strict', path: '/' };
const refreshOptions = { ...cookieOptions, path: '/api/auth' };
const hashToken = token => crypto.createHash('sha256').update(token).digest('hex');
const validRefresh = token => typeof token === 'string' && /^[a-f0-9]{64}$/.test(token);

async function addRefresh(client, session) {
  const refreshToken = crypto.randomBytes(32).toString('hex');
  await client.query('INSERT INTO auth_refresh_tokens (token_hash, session_id) VALUES ($1, $2)',
    [hashToken(refreshToken), session.id]);
  return { session, refreshToken };
}
async function createSession(client, userId) {
  const session = { id: crypto.randomUUID(), id_usuario: userId, expires_at: new Date(Date.now() + REFRESH_MS) };
  await client.query('INSERT INTO auth_sessions (id, id_usuario, expires_at) VALUES ($1, $2, $3)',
    [session.id, userId, session.expires_at]);
  return addRefresh(client, session);
}
async function rotateRefresh(token) {
  if (!validRefresh(token)) return null;
  return transaction(async client => {
    // The session lock serializes rotation, replay detection and logout.
    const result = await client.query(`SELECT s.*, t.used_at FROM auth_sessions s
      JOIN auth_refresh_tokens t ON t.session_id = s.id
      WHERE t.token_hash = $1 FOR UPDATE OF s, t`, [hashToken(token)]);
    const session = result.rows[0];
    if (!session || session.revoked_at || new Date(session.expires_at) <= new Date()) return null;
    if (session.used_at) {
      await client.query('UPDATE auth_sessions SET revoked_at = NOW() WHERE id = $1', [session.id]);
      // Return rather than throw so revocation is committed.
      return null;
    }
    const usuario = await getAccess(session.id_usuario, client);
    if (!usuario) return null;
    await client.query('UPDATE auth_refresh_tokens SET used_at = NOW() WHERE token_hash = $1', [hashToken(token)]);
    return { ...await addRefresh(client, session), usuario };
  });
}
async function revokeRefresh(token) {
  if (!validRefresh(token)) return;
  await db.query(`UPDATE auth_sessions SET revoked_at = NOW() WHERE id IN
    (SELECT session_id FROM auth_refresh_tokens WHERE token_hash = $1)`, [hashToken(token)]);
}
async function revokeUserSessions(client, userId) {
  await client.query('UPDATE auth_sessions SET revoked_at = NOW() WHERE id_usuario = $1', [userId]);
}
function setCookies(res, { session, refreshToken }) {
  const token = jwt.sign({ id_usuario: session.id_usuario, sid: session.id, type: 'access' }, SECRET,
    { algorithm: 'HS256', expiresIn: ACCESS_SECONDS, issuer: 'tecnoclick', audience: 'tecnoclick-api' });
  res.set('Cache-Control', 'no-store');
  res.cookie('token', token, { ...cookieOptions, maxAge: ACCESS_SECONDS * 1000 });
  res.cookie('refresh_token', refreshToken, { ...refreshOptions, maxAge: Math.max(0, new Date(session.expires_at) - Date.now()) });
}
function clearCookies(res) {
  res.set('Cache-Control', 'no-store');
  res.clearCookie('token', cookieOptions);
  res.clearCookie('refresh_token', refreshOptions);
}
function verifyAccess(token) {
  const decoded = jwt.verify(token, SECRET, { algorithms: ['HS256'], issuer: 'tecnoclick', audience: 'tecnoclick-api' });
  if (decoded.type !== 'access' || typeof decoded.sid !== 'string' ||
      !/^[a-f0-9-]{36}$/.test(decoded.sid) || !Number.isInteger(decoded.id_usuario) ||
      !Number.isInteger(decoded.exp) || !Number.isInteger(decoded.iat) || decoded.exp - decoded.iat > ACCESS_SECONDS) {
    throw new Error('Token inválido.');
  }
  return decoded;
}
async function activeSession(decoded) {
  return (await db.query(`SELECT id FROM auth_sessions WHERE id = $1 AND id_usuario = $2
    AND revoked_at IS NULL AND expires_at > NOW()`, [decoded.sid, decoded.id_usuario])).rows.length > 0;
}
module.exports = { createSession, rotateRefresh, revokeRefresh, revokeUserSessions, setCookies, clearCookies, verifyAccess, activeSession };

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
process.env.JWT_SECRET = 'test-only-secret-at-least-32-bytes-long';
const sessions = new Map();
const refreshTokens = new Map();
const user = { id_usuario: 1, correo_usuario: 'test@example.com', contrasena: '' };
const hash = token => crypto.createHash('sha256').update(token).digest('hex');
async function query(sql, v = []) {
  const s = sql.replace(/\s+/g, ' ').trim();
  if (/^(BEGIN|COMMIT|ROLLBACK)$/.test(s) || s.startsWith('INSERT INTO auditoria')) return { rows: [] };
  if (s.startsWith('SELECT * FROM usuario')) return { rows: [user] };
  if (s.includes('array_agg(p.codigo)')) return { rows: [{ id_usuario: 1, rol_codigo: 'cliente', permisos: [] }] };
  if (s.startsWith('INSERT INTO auth_sessions')) sessions.set(v[0], { id: v[0], id_usuario: v[1], expires_at: v[2] });
  else if (s.startsWith('INSERT INTO auth_refresh_tokens')) refreshTokens.set(v[0], { session_id: v[1], used_at: null });
  else if (s.startsWith('SELECT s.*, t.used_at')) {
    const t = refreshTokens.get(v[0]);
    return { rows: t ? [{ ...sessions.get(t.session_id), used_at: t.used_at }] : [] };
  } else if (s.startsWith('UPDATE auth_refresh_tokens')) refreshTokens.get(v[0]).used_at = new Date();
  else if (s.startsWith('UPDATE auth_sessions')) {
    for (const session of sessions.values()) {
      const matches = s.includes('WHERE id_usuario') ? session.id_usuario === v[0]
        : s.includes('WHERE id IN') ? session.id === refreshTokens.get(v[0])?.session_id : session.id === v[0];
      if (matches) session.revoked_at = new Date();
    }
  } else if (s.startsWith('SELECT id FROM auth_sessions')) {
    const session = sessions.get(v[0]);
    return { rows: session && session.id_usuario === v[1] && !session.revoked_at && session.expires_at > new Date() ? [session] : [] };
  } else throw new Error('Unexpected query: ' + s);
  return { rows: [] };
}
const dbPath = require.resolve('../config/db');
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: { query, connect: async () => ({ query, release() {} }) } };
const express = require('express');
const app = express();
app.use(express.json());
app.use(require('cookie-parser')());
app.use('/api/auth', require('../routes/authRoutes'));
const tokens = require('../services/tokens');
let server, base;
before(async () => {
  user.contrasena = await bcrypt.hash('password', 4);
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
});
after(() => new Promise(resolve => server.close(resolve)));
async function request(path, cookie = '', body) {
  const res = await fetch(base + '/api/auth/' + path, { method: path === 'sesion' ? 'GET' : 'POST',
    headers: { cookie, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, cookies: res.headers.getSetCookie(), body: await res.json(), cache: res.headers.get('cache-control') };
}
const cookieValue = (r, name) => r.cookies.find(c => c.startsWith(name + '='))?.split(';')[0].slice(name.length + 1);
async function credentials() {
  const c = await tokens.createSession({ query }, 1);
  const result = { cookies: [] };
  tokens.setCookies({ set() {}, cookie(name, value) { result.cookies.push(name + '=' + value); } }, c);
  return { ...result, ...c };
}

test('login emite JWT de 15 minutos y refresh HttpOnly, Secure y limitado a auth', async () => {
  const r = await request('login', '', { correo: user.correo_usuario, contra: 'password' });
  assert.equal(r.status, 200);
  assert.equal(r.cache, 'no-store');
  const jwtValue = cookieValue(r, 'token');
  const claims = tokens.verifyAccess(jwtValue);
  assert.equal(claims.exp - claims.iat, 900);
  assert.match(r.cookies[0], /Max-Age=900;/);
  const refresh = cookieValue(r, 'refresh_token');
  assert.match(refresh, /^[a-f0-9]{64}$/);
  assert.ok(refreshTokens.has(hash(refresh)));
  assert.equal(refreshTokens.has(refresh), false);
  for (const cookie of r.cookies) {
    assert.match(cookie, /HttpOnly/); assert.match(cookie, /Secure/); assert.match(cookie, /SameSite=Strict/);
  }
  assert.match(r.cookies[1], /Path=\/api\/auth;/);
  assert.equal(r.body.token, undefined);
  assert.equal(r.body.refreshToken, undefined);
});

test('JWT expirado da 401; refresh rota sin JWT y conserva el límite absoluto', async () => {
  const c = await credentials();
  const expired = jwt.sign({ id_usuario: 1, sid: c.session.id, type: 'access' }, process.env.JWT_SECRET,
    { expiresIn: -1, issuer: 'tecnoclick', audience: 'tecnoclick-api' });
  assert.equal((await request('sesion', 'token=' + expired)).status, 401);
  const r = await request('refresh', 'refresh_token=' + c.refreshToken);
  assert.equal(r.status, 200);
  assert.notEqual(cookieValue(r, 'refresh_token'), c.refreshToken);
  assert.equal(sessions.get(c.session.id).expires_at.getTime(), c.session.expires_at.getTime());
  assert.equal((await request('sesion', 'token=' + cookieValue(r, 'token'))).status, 200);
});

test('reutilizar refresh revoca la familia y su JWT vigente', async () => {
  const c = await credentials();
  const first = await request('refresh', 'refresh_token=' + c.refreshToken);
  assert.equal(first.status, 200);
  assert.equal((await request('refresh', 'refresh_token=' + c.refreshToken)).status, 401);
  assert.equal((await request('refresh', 'refresh_token=' + cookieValue(first, 'refresh_token'))).status, 401);
  assert.equal((await request('sesion', 'token=' + cookieValue(first, 'token'))).status, 401);
});

test('logout revoca acceso y refresh y borra cookies con los mismos paths', async () => {
  const c = await credentials();
  const r = await request('logout', 'refresh_token=' + c.refreshToken);
  assert.equal(r.status, 200);
  assert.match(r.cookies[1], /Path=\/api\/auth;/);
  assert.equal((await request('refresh', 'refresh_token=' + c.refreshToken)).status, 401);
  assert.equal((await request('sesion', 'token=' + cookieValue(c, 'token'))).status, 401);
  assert.equal((await request('logout')).status, 200);
});

test('refresh ausente, desconocido o vencido es rechazado', async () => {
  for (const value of ['', 'incorrecto', 'a'.repeat(64)]) {
    assert.equal((await request('refresh', 'refresh_token=' + value)).status, 401);
  }
  const c = await credentials();
  sessions.get(c.session.id).expires_at = new Date(Date.now() - 1);
  assert.equal((await request('refresh', 'refresh_token=' + c.refreshToken)).status, 401);
});

test('revocación por usuario invalida todas sus sesiones', async () => {
  const a = await credentials();
  const b = await credentials();
  await tokens.revokeUserSessions({ query }, 1);
  for (const c of [a, b]) {
    assert.equal((await request('sesion', 'token=' + cookieValue(c, 'token'))).status, 401);
    assert.equal((await request('refresh', 'refresh_token=' + c.refreshToken)).status, 401);
  }
});

test('rechaza emisor, audiencia, tipo, firma y duración incorrectos', async () => {
  const c = await credentials();
  const payload = { id_usuario: 1, sid: c.session.id, type: 'access' };
  const options = { expiresIn: '15m', issuer: 'tecnoclick', audience: 'tecnoclick-api' };
  for (const token of [
    jwt.sign(payload, 'another-secret', options),
    jwt.sign(payload, process.env.JWT_SECRET, { ...options, issuer: 'other' }),
    jwt.sign(payload, process.env.JWT_SECRET, { ...options, audience: 'other' }),
    jwt.sign(payload, process.env.JWT_SECRET, { ...options, expiresIn: '2d' }),
    jwt.sign({ ...payload, type: 'refresh' }, process.env.JWT_SECRET, options),
    c.refreshToken,
  ]) assert.equal((await request('sesion', 'token=' + token)).status, 401);
});

test('rechaza renovación iniciada desde otro sitio', async () => {
  const r = await fetch(base + '/api/auth/refresh', { method: 'POST', headers: { 'Sec-Fetch-Site': 'cross-site' } });
  assert.equal(r.status, 403);
});

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { authFetch } from '../src/utils/authFetch.js';

let calls, events, storage;
beforeEach(() => {
  calls = []; events = []; storage = new Map([['usuario', '{"id_usuario":1}']]);
  globalThis.localStorage = { removeItem: key => storage.delete(key) };
  globalThis.window = { dispatchEvent: event => events.push(event.type) };
});
function respond(status) { return new Response('{}', { status }); }

test('401 concurrentes comparten renovación y reintentan con cookies', async () => {
  let renewed = false;
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (url === '/api/auth/refresh') { renewed = true; return respond(200); }
    return respond(renewed ? 200 : 401);
  };
  const results = await Promise.all([
    authFetch('https://localhost:3000/api/pedidos', { method: 'POST', body: '{"id":1}' }),
    authFetch('/api/usuarios'),
  ]);
  assert.ok(results.every(r => r.status === 200));
  assert.equal(calls.filter(c => c.url === '/api/auth/refresh').length, 1);
  assert.ok(calls.every(c => c.options.credentials === 'include'));
  assert.deepEqual(calls.filter(c => c.url === '/api/pedidos').map(c => c.options.body), ['{"id":1}', '{"id":1}']);
});

test('otra pestaña ya renovó: verifica sesión y evita rotar otra vez', async () => {
  let count = 0;
  globalThis.fetch = async url => { calls.push(url); return respond(++count === 1 ? 401 : 200); };
  assert.equal((await authFetch('/api/pedidos')).status, 200);
  assert.deepEqual(calls, ['/api/pedidos', '/api/auth/sesion', '/api/pedidos']);
});

test('refresh rechazado limpia cache de usuario y notifica vencimiento', async () => {
  globalThis.fetch = async url => { calls.push(url); return respond(401); };
  assert.equal((await authFetch('/api/pedidos')).status, 401);
  assert.equal(storage.has('usuario'), false);
  assert.ok(events.includes('sessionExpired'));
  assert.equal(calls.length, 3);
});

test('no renueva login, logout, recuperación ni respuestas 403', async () => {
  globalThis.fetch = async url => { calls.push(url); return respond(url.includes('/auth/') ? 401 : 403); };
  for (const path of ['login', 'logout', 'recuperar', 'restablecer', 'refresh']) await authFetch('/api/auth/' + path);
  await authFetch('/api/usuarios');
  assert.equal(calls.length, 6);
  assert.equal(events.length, 0);
});

test('errores temporales de renovación conservan la sesión local', async () => {
  globalThis.fetch = async url => respond(url === '/api/auth/refresh' ? 503 : 401);
  await assert.rejects(authFetch('/api/pedidos'), /renovar/);
  assert.equal(storage.has('usuario'), true);
  globalThis.fetch = async () => { throw new Error('sin conexión'); };
  await assert.rejects(authFetch('/api/pedidos'), /sin conexión/);
  assert.equal(events.length, 0);
});

test('un segundo 401 no crea un bucle de renovación', async () => {
  globalThis.fetch = async url => { calls.push(url); return respond(url === '/api/auth/refresh' ? 200 : 401); };
  assert.equal((await authFetch('/api/pedidos')).status, 401);
  assert.equal(calls.filter(c => c === '/api/auth/refresh').length, 1);
  assert.equal(calls.filter(c => c === '/api/pedidos').length, 2);
});

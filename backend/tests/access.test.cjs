const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Pruebas HTTP del backend real con la frontera de PostgreSQL simulada.
// No acceden a la base de datos ni modifican cuentas existentes.
const roles = [
  { id_rol: 1, codigo: 'cliente', nombre: 'Cliente', es_sistema: true },
  { id_rol: 2, codigo: 'admin', nombre: 'Administrador', es_sistema: true },
  { id_rol: 3, codigo: 'editor', nombre: 'Editor', es_sistema: true },
];
const adminPermissions = ['usuarios.ver','usuarios.crear','usuarios.editar','usuarios.eliminar',
  'roles.ver','roles.crear','roles.editar','roles.eliminar','roles.asignar','roles.revocar','auditoria.ver',
  'productos.ver','productos.crear','productos.editar','productos.eliminar','categorias.ver'];
const users = new Map([
  [10, { id_usuario: 10, id_rol: 2, nombre_usuario: 'Admin', correo_usuario: 'admin@test.local', rol: 'admin', contrasena: 'hash' }],
  [20, { id_usuario: 20, id_rol: 3, nombre_usuario: 'Editor', correo_usuario: 'editor@test.local', rol: 'editor', contrasena: 'hash' }],
  [30, { id_usuario: 30, id_rol: 1, nombre_usuario: 'Cliente', correo_usuario: 'cliente@test.local', rol: 'cliente', contrasena: 'hash' }],
]);
const statements = [];
let failAudit = false;
function access(user) {
  if (!user) return [];
  const role = roles.find(r => r.id_rol === user.id_rol);
  return [{ id_usuario: user.id_usuario, id_rol: role.id_rol, rol_codigo: role.codigo,
    rol_nombre: role.nombre, permisos: role.codigo === 'admin' ? adminPermissions : role.codigo === 'editor'
      ? ['productos.ver','productos.crear','productos.editar','productos.eliminar','categorias.ver'] : ['productos.ver'] }];
}
async function query(sql, values = []) {
  statements.push({ sql, values });
  const normalized = sql.replace(/\s+/g, ' ').trim();
  if (/^(BEGIN|COMMIT|ROLLBACK)$/.test(normalized) || normalized.includes('pg_advisory_xact_lock')) return { rows: [] };
  if (normalized.startsWith('INSERT INTO auditoria')) {
    if (failAudit) throw new Error('simulated audit failure');
    return { rows: [] };
  }
  if (normalized.includes('array_agg(p.codigo)')) return { rows: access(users.get(values[0])) };
  if (normalized.startsWith('SELECT id_rol FROM roles')) {
    return { rows: roles.filter(r => normalized.includes("codigo = 'cliente'") ? r.codigo === 'cliente' : r.id_rol === values[0]) };
  }
  if (normalized.startsWith('SELECT codigo FROM roles')) return { rows: roles.filter(r => r.id_rol === values[0]) };
  if (normalized.includes('COUNT(*)::int AS total')) return { rows: [{ total: [...users.values()].filter(u => u.id_rol === 2).length }] };
  if (normalized.startsWith('SELECT * FROM roles')) return { rows: roles.filter(r => r.id_rol === values[0]) };
  if (normalized.startsWith('SELECT id_permiso FROM permisos')) return { rows: values[0].filter(id => [101,102].includes(id)).map(id_permiso => ({ id_permiso })) };
  if (normalized.startsWith('INSERT INTO roles')) {
    const role = { id_rol: 4, codigo: values[0], nombre: values[1], descripcion: values[2], es_sistema: false };
    roles.push(role);
    return { rows: [role] };
  }
  if (normalized.startsWith('INSERT INTO rol_permiso')) return { rows: [] };
  if (normalized.startsWith('SELECT * FROM usuario WHERE correo_usuario')) return { rows: [...users.values()].filter(u => u.correo_usuario === values[0]) };
  if (normalized.startsWith('SELECT id_usuario FROM usuario WHERE correo_usuario')) return { rows: [] };
  if (normalized.startsWith('SELECT * FROM usuario WHERE id_usuario')) return { rows: [users.get(values[0])].filter(Boolean).map(user => ({ ...user })) };
  if (normalized.startsWith('SELECT u.*, r.codigo')) {
    const result = values.length ? [users.get(values[0])].filter(Boolean) : [...users.values()];
    return { rows: result.map(u => ({ ...u, rol_codigo: roles.find(r => r.id_rol === u.id_rol).codigo })) };
  }
  if (normalized.startsWith('INSERT INTO usuario')) {
    const user = { id_usuario: 40, id_rol: values[11], correo_usuario: values[3], contrasena: values[10] };
    users.set(40, user);
    return { rows: [user] };
  }
  if (normalized.startsWith('INSERT INTO productos')) return { rows: [{ id_producto: 99 }] };
  if (normalized.startsWith('UPDATE usuario SET id_rol')) {
    users.get(values[1]).id_rol = values[0];
    return { rows: [] };
  }
  throw new Error('Unexpected test query: ' + normalized);
}
const dbPath = require.resolve('../config/db');
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true,
  exports: { query, connect: async () => ({ query, release() {} }) } };
const app = require('../server');
let server;
let base;
before(async () => {
  users.get(10).contrasena = await bcrypt.hash('test-password', 4);
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
});
after(() => new Promise(resolve => server.close(resolve)));
function token(id) {
  // Un rol obsoleto dentro del JWT no debe conceder acceso.
  return jwt.sign({ id_usuario: id, rol: 'admin' }, process.env.JWT_SECRET || 'claveSecreta', { expiresIn: '1h' });
}
async function request(path, id, method = 'GET', body) {
  const headers = { 'Content-Type': 'application/json' };
  if (id) headers.Authorization = 'Bearer ' + token(id);
  const response = await fetch(base + '/api' + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  return { status: response.status, body: await response.json() };
}
const registration = { nombre: 'Nuevo', apellido: 'Usuario', correo: 'nuevo@test.local',
  contra: 'test-password', CP: '12345', estado: 'Estado', municipio: 'Municipio', colonia: 'Colonia' };

test('las rutas administrativas requieren sesión', async () => {
  assert.equal((await request('/usuarios')).status, 401);
});
test('Editor no puede listar usuarios, asignar roles ni consultar auditoría', async () => {
  assert.equal((await request('/usuarios', 20)).status, 403);
  assert.equal((await request('/usuarios/30', 20, 'PUT', { id_rol: 2 })).status, 403);
  assert.equal((await request('/auditoria', 20)).status, 403);
});
test('Cliente no puede autoasignarse Administrador editando su perfil', async () => {
  assert.equal((await request('/usuarios/30', 30, 'PUT', { id_rol: 2 })).status, 403);
});
test('el registro público rechaza Administrador y Editor incluso con un token administrativo', async () => {
  assert.equal((await request('/usuarios', null, 'POST', { ...registration, id_rol: 2 })).status, 403);
  assert.equal((await request('/usuarios', 10, 'POST', { ...registration, id_rol: 3 })).status, 403);
});
test('el alta administrativa persiste el id numérico y no devuelve contraseña', async () => {
  const result = await request('/usuarios/admin', 10, 'POST', { ...registration, id_rol: 3 });
  assert.equal(result.status, 201);
  assert.equal(result.body.usuario.id_rol, 3);
  assert.equal(result.body.usuario.rol_codigo, 'editor');
  assert.equal(result.body.usuario.contrasena, undefined);
  const insert = statements.findLast(s => s.sql.includes('INSERT INTO usuario'));
  assert.equal(insert.values[11], 3);
  assert.equal(insert.sql.includes(', rol)'), false);
});
test('un registro público normal se guarda con el rol Cliente', async () => {
  const result = await request('/usuarios', null, 'POST', registration);
  assert.equal(result.status, 201);
  assert.equal(result.body.usuario.id_rol, 1);
});
test('Administrador puede asignar y revocar el rol Editor con auditoría', async () => {
  const assign = await request('/usuarios/40', 10, 'PUT', { id_rol: 3 });
  assert.equal(assign.status, 200);
  assert.equal(assign.body.usuario.id_rol, 3);
  assert.equal((await request('/usuarios/40/rol', 10, 'DELETE')).status, 200);
  assert.equal(users.get(40).id_rol, 1);
  assert.ok(statements.some(s => s.sql.includes('INSERT INTO auditoria') && s.values[2] === 'roles.asignar'));
  assert.ok(statements.some(s => s.sql.includes('INSERT INTO auditoria') && s.values[2] === 'roles.revocar'));
});
test('Administrador puede crear roles personalizados con permisos existentes', async () => {
  const result = await request('/roles', 10, 'POST', { codigo: 'editor_limitado', nombre: 'Editor limitado', permisos: [101,102,101] });
  assert.equal(result.status, 201);
  assert.equal(result.body.id_rol, 4);
  assert.deepEqual(result.body.permisos, [101,102]);
  assert.equal((await request('/roles', 10, 'POST', { codigo: 'invalido', nombre: 'Inválido', permisos: [999] })).status, 400);
});
test('las respuestas de usuarios excluyen la contraseña y el rol de texto heredado', async () => {
  const result = await request('/usuarios', 10);
  assert.equal(result.status, 200);
  assert.ok(result.body.every(u => !('contrasena' in u) && !('rol' in u)));
});
test('los permisos revocados se aplican con el mismo JWT todavía vigente', async () => {
  const jwtToken = token(10);
  const first = await fetch(base + '/api/usuarios', { headers: { Authorization: 'Bearer ' + jwtToken } });
  assert.equal(first.status, 200);
  users.get(10).id_rol = 3;
  try {
    const next = await fetch(base + '/api/usuarios', { headers: { Authorization: 'Bearer ' + jwtToken } });
    assert.equal(next.status, 403);
  } finally { users.get(10).id_rol = 2; }
});
test('no permite revocar al último Administrador', async () => {
  assert.equal((await request('/usuarios/10/rol', 10, 'DELETE')).status, 409);
  assert.equal(users.get(10).id_rol, 2);
});
test('los roles de sistema no pueden editarse o eliminarse', async () => {
  assert.equal((await request('/roles/3', 10, 'PUT', { codigo: 'editor', nombre: 'Editor', permisos: [] })).status, 403);
  assert.equal((await request('/roles/3', 10, 'DELETE')).status, 403);
});
test('Editor puede crear contenido y la auditoría usa la misma transacción', async () => {
  const start = statements.length;
  const result = await request('/contenido/productos', 20, 'POST', { nombre: 'Producto', precio: 10, stock: 1 });
  assert.equal(result.status, 201);
  const queries = statements.slice(start);
  assert.ok(queries.some(s => s.sql.includes('INSERT INTO auditoria') && s.values[2] === 'productos.crear'));
  assert.equal(queries.at(-1).sql, 'COMMIT');
});
test('si falla la auditoría se solicita ROLLBACK de la modificación', async () => {
  failAudit = true;
  try {
    const start = statements.length;
    assert.equal((await request('/contenido/productos', 20, 'POST', { nombre: 'Producto', precio: 10, stock: 1 })).status, 500);
    assert.equal(statements.slice(start).at(-1).sql, 'ROLLBACK');
  } finally { failAudit = false; }
});
test('login entrega id_rol y permisos; el JWT solo lleva la identidad', async () => {
  const result = await request('/auth/login', null, 'POST', { correo: 'admin@test.local', contra: 'test-password' });
  assert.equal(result.status, 200);
  assert.equal(result.body.usuario.id_rol, 2);
  assert.ok(result.body.usuario.permisos.includes('roles.asignar'));
  assert.equal(result.body.usuario.contrasena, undefined);
  assert.equal(jwt.decode(result.body.token).rol, undefined);
});

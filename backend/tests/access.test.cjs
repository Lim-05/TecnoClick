const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
process.env.JWT_SECRET = 'test-only-secret-at-least-32-bytes-long';

// Pruebas HTTP del backend real con la frontera de PostgreSQL simulada.
// No acceden a la base de datos ni modifican cuentas existentes.
const roles = [
  { id_rol: 1, codigo: 'cliente', nombre: 'Cliente', es_sistema: true },
  { id_rol: 2, codigo: 'admin', nombre: 'Administrador', es_sistema: true },
  { id_rol: 3, codigo: 'editor', nombre: 'Editor', es_sistema: true },
];
const adminPermissions = ['usuarios.ver','usuarios.crear','usuarios.editar','usuarios.eliminar',
  'roles.ver','roles.crear','roles.editar','roles.eliminar','roles.asignar','roles.revocar','auditoria.ver',
  'productos.ver','productos.crear','productos.editar','productos.eliminar','categorias.ver','categorias.crear'];
const users = new Map([
  [10, { id_usuario: 10, id_rol: 2, nombre_usuario: 'Admin', correo_usuario: 'admin@test.local', rol: 'admin', contrasena: 'hash' }],
  [20, { id_usuario: 20, id_rol: 3, nombre_usuario: 'Editor', correo_usuario: 'editor@test.local', rol: 'editor', contrasena: 'hash' }],
  [30, { id_usuario: 30, id_rol: 1, nombre_usuario: 'Cliente', correo_usuario: 'cliente@test.local', rol: 'cliente', contrasena: 'hash' }],
]);
const statements = [];
let failAudit = false;
let blockDeletion = false;
let laggingSequence = false;
function access(user) {
  if (!user) return [];
  const role = roles.find(r => r.id_rol === user.id_rol);
  return [{ id_usuario: user.id_usuario, id_rol: role.id_rol, rol_codigo: role.codigo,
    rol_nombre: role.nombre, permisos: role.codigo === 'admin' ? adminPermissions : role.codigo === 'editor'
      ? ['productos.ver','productos.crear','productos.editar','productos.eliminar','categorias.ver','categorias.crear'] : ['productos.ver'] }];
}
async function query(sql, values = []) {
  statements.push({ sql, values });
  const normalized = sql.replace(/\s+/g, ' ').trim();
  if (normalized.startsWith('SELECT id FROM auth_sessions')) return { rows: [{ id: values[0] }] };
  if (normalized.startsWith('INSERT INTO auth_sessions') || normalized.startsWith('INSERT INTO auth_refresh_tokens')) return { rows: [] };
  if (/^(BEGIN|COMMIT|ROLLBACK)$/.test(normalized) || normalized.includes('pg_advisory_xact_lock')) return { rows: [] };
  if (normalized.startsWith('LOCK TABLE public.')) return { rows: [] };
  if (normalized.includes('pg_get_serial_sequence')) {
    return { rows: [{ sequence: values[0] === 'productos' ? 'public.productos_id_producto_seq' : null, identity_generation:null }] };
  }
  if (normalized.includes('COALESCE(MAX(')) return { rows: [{ max_id:'98' }] };
  if (normalized.startsWith('SELECT nextval')) return { rows: [{ id:laggingSequence ? '1' : '99' }] };
  if (normalized.startsWith('SELECT setval')) return { rows: [] };
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
  if (normalized.startsWith('INSERT INTO public.productos')) return { rows: [{ id_producto:Number(values[0]),imagen:values[5] }] };
  if (normalized.startsWith('INSERT INTO public.categoria')) return { rows: [{ id_categoria:Number(values[0]) }] };
  if (normalized.startsWith('DELETE FROM usuario')) {
    if (blockDeletion) throw Object.assign(new Error('related records'), { code: '23503' });
    users.delete(values[0]);
    return { rows: [] };
  }
  if (normalized.startsWith('SELECT a.*, u.nombre_usuario')) {
    return { rows: statements.filter(s => s.sql.includes('INSERT INTO auditoria')).map((s,i) => ({ id_auditoria:i+1, accion:s.values[2] })) };
  }
  if (normalized.includes('COUNT(p.id_producto)::int AS count')) {
    return { rows: [{ id_categoria:1,nombre_categoria:'Libros',count:5 },
      { id_categoria:99,nombre_categoria:'Portafolio',count:0 }] };
  }
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
  return jwt.sign({ id_usuario: id, rol: 'admin', type: 'access', sid: '11111111-1111-4111-8111-111111111111' }, process.env.JWT_SECRET,
    { expiresIn: '15m', issuer: 'tecnoclick', audience: 'tecnoclick-api' });
}
async function request(path, id, method = 'GET', body) {
  const headers = { 'Content-Type': 'application/json' };
  if (id) headers.Authorization = 'Bearer ' + token(id);
  const response = await fetch(base + '/api' + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  return { status: response.status, body: await response.json(), cookie: response.headers.get('set-cookie') };
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
  assert.equal(result.body.token, undefined);
  assert.match(result.cookie, /HttpOnly/i);
  const cookieToken = result.cookie.match(/token=([^;]+)/)[1];
  assert.equal(jwt.decode(cookieToken).rol, undefined);
});

test('Administrador y Editor pueden crear categorías', async () => {
  for (const actor of [10,20]) {
    const result = await request('/categorias', actor, 'POST', { nombre_categoria:'Prueba', descripcion_categoria:'Categoría de prueba' });
    assert.equal(result.status, 201);
    assert.equal(result.body.id_categoria, 99);
  }
});
test('eliminar un usuario sin relaciones lo retira y registra auditoría', async () => {
  users.set(50, { id_usuario:50,id_rol:1,nombre_usuario:'Prueba',correo_usuario:'eliminar@test.local' });
  const result = await request('/usuarios/50', 10, 'DELETE');
  assert.equal(result.status,200);
  assert.equal(users.has(50),false);
  assert.equal(statements.at(-1).sql,'COMMIT');
});
test('eliminar un usuario con relaciones devuelve una explicación y conserva la cuenta', async () => {
  blockDeletion = true;
  try {
    const result = await request('/usuarios/30', 10, 'DELETE');
    assert.equal(result.status,409);
    assert.match(result.body.mensaje,/registros relacionados/);
    assert.equal(users.has(30),true);
    assert.equal(statements.at(-1).sql,'ROLLBACK');
  } finally { blockDeletion=false; }
});
test('actualizar auditoría vuelve a consultar los eventos', async () => {
  const first = await request('/auditoria',10);
  assert.equal(first.status,200);
  await request('/contenido/productos',20,'POST',{nombre:'Nuevo',precio:10,stock:1});
  const next = await request('/auditoria',10);
  assert.equal(next.status,200);
  assert.equal(next.body.registros.length,first.body.registros.length+1);
});

test('crear producto sin imagen es válido y conserva un valor vacío', async () => {
  for (const imagen of [undefined,'','   ']) {
    const result = await request('/contenido/productos',20,'POST',{nombre:'Sin imagen',precio:10,stock:1,imagen});
    assert.equal(result.status,201);
    assert.equal(result.body.imagen,'');
  }
});
test('un contador atrasado se adelanta a un ID libre antes de insertar producto', async () => {
  laggingSequence=true;
  try {
    const start=statements.length;
    const result=await request('/contenido/productos',10,'POST',{nombre:'Nuevo producto',precio:10,stock:1});
    assert.equal(result.status,201);
    assert.equal(result.body.id_producto,99);
    const calls=statements.slice(start);
    assert.ok(calls.some(s=>s.sql.startsWith('LOCK TABLE public.productos')));
    assert.ok(calls.some(s=>s.sql.startsWith('SELECT setval') && s.values[1]==='99'));
  } finally {laggingSequence=false;}
});
test('una categoría con ID entero sin secuencia recibe un ID nuevo', async () => {
  const start=statements.length;
  const result=await request('/categorias',20,'POST',{nombre_categoria:'Portafolio',descripcion_categoria:'Carpetas de presentación'});
  assert.equal(result.status,201);
  const calls=statements.slice(start);
  const insert=calls.find(s=>s.sql.startsWith('INSERT INTO public.categoria'));
  assert.equal(insert.values[0],'99');
  assert.ok(insert.sql.includes('id_categoria'));
  assert.equal(calls.some(s=>s.sql.startsWith('SELECT nextval')),false);
});

test('el catálogo público muestra categorías sin productos y sus conteos', async () => {
  const result=await request('/productos/categorias');
  assert.equal(result.status,200);
  const empty=result.body.find(c=>c.id_categoria===99);
  assert.equal(empty.nombre_categoria,'Portafolio');
  assert.equal(empty.count,0);
  assert.equal(result.body.find(c=>c.id_categoria===1).count,5);
});

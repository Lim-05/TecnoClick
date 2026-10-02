const db = require('../config/db');
async function getAccess(id, connection = db) {
  const result = await connection.query(`
    SELECT u.id_usuario, u.correo_usuario AS correo, u.id_rol,
           r.codigo AS rol_codigo, r.nombre AS rol_nombre,
           COALESCE(array_agg(p.codigo) FILTER (WHERE p.codigo IS NOT NULL), '{}') AS permisos
    FROM usuario u JOIN roles r ON r.id_rol = u.id_rol
    LEFT JOIN rol_permiso rp ON rp.id_rol = r.id_rol
    LEFT JOIN permisos p ON p.id_permiso = rp.id_permiso
    WHERE u.id_usuario = $1 GROUP BY u.id_usuario, r.id_rol`, [id]);
  return result.rows[0];
}
function safeUser(user) {
  if (!user) return user;
  const { contrasena, rol, ...safe } = user;
  return safe;
}
async function audit(connection, actor, accion, entidad, id, detalle = {}) {
  await connection.query(`INSERT INTO auditoria
    (id_usuario, actor_referencia, accion, entidad, id_entidad, detalle)
    VALUES ($1,$2,$3,$4,$5,$6::jsonb)`, [
    actor?.id_usuario || null,
    actor?.id_usuario ? `usuario:${actor.id_usuario}` : 'registro:publico',
    accion, entidad, id == null ? null : String(id), JSON.stringify(detalle),
  ]);
}
function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}
async function transaction(work) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}
function respondError(res, error) {
  const status = error.status || ({ '23503': 409, '23505': 409, '23514': 400,
    '22P02': 400, '22003': 400, '22001': 400, '23502': 400 }[error.code]) || 500;
  let message = error.status ? error.message : status === 409
    ? 'El registro ya existe o tiene datos relacionados que impiden esta operación.'
    : status === 400 ? 'Revisa los datos enviados.' : 'Error al procesar la solicitud.';
  if (!error.status && error.code === '23505') {
    message = error.constraint?.endsWith('_pkey')
      ? 'No se pudo generar un identificador nuevo. Revisa el contador de IDs de la base de datos.'
      : 'Ya existe un registro con un valor que debe ser único.';
  }
  if (!error.status && error.code === '23503') {
    message = 'Hay un registro relacionado que no existe o impide esta operación. Revisa la categoría seleccionada o los datos asociados.';
  }
  if (!error.status && error.code === '23502') {
    const labels = { id_categoria:'el identificador de categoría', id_producto:'el identificador de producto',
      nombre:'el nombre del producto', nombre_categoria:'el nombre de categoría', imagen:'la imagen',
      precio:'el precio', stock:'el stock' };
    message = 'Falta un valor obligatorio para ' + (labels[error.column] || 'un campo del registro') + '.';
  }
  if (!error.status && error.code === '22001') message = 'Uno de los textos supera la longitud permitida.';
  if (error.code) console.error('Error PostgreSQL:', { codigo:error.code, tabla:error.table, columna:error.column, restriccion:error.constraint });
  if (status === 500) console.error(error.message);
  return res.status(status).json({ mensaje: message });
}
function positiveId(value) {
  if (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) < 1) {
    throw httpError(400, 'Identificador inválido.');
  }
  return Number(value);
}
module.exports = { getAccess, safeUser, audit, httpError, transaction, respondError, positiveId };

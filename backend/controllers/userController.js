const db = require('../config/db');
const bcrypt = require('bcrypt');
const { revokeUserSessions } = require('../services/tokens');
const { getAccess, safeUser, audit, transaction, respondError, httpError, positiveId } = require('../services/access');
const profileFields = ['nombre_usuario', 'apellido_usuario', 'telefono_usuario', 'correo_usuario',
  'direccion_usuario', 'codigo_postal', 'estado_usuario', 'municipio_usuario', 'colonia_usuario', 'referencias'];
const selectUser = `SELECT u.*, r.codigo AS rol_codigo, r.nombre AS rol_nombre
  FROM usuario u JOIN roles r ON r.id_rol = u.id_rol`;
async function keepAdministrator(client, user, newRoleId) {
  const role = await client.query('SELECT codigo FROM roles WHERE id_rol = $1', [user.id_rol]);
  if (role.rows[0]?.codigo !== 'admin' || user.id_rol === newRoleId) return;
  const count = await client.query(`SELECT COUNT(*)::int AS total FROM usuario u
    JOIN roles r ON r.id_rol = u.id_rol WHERE r.codigo = 'admin'`);
  if (count.rows[0].total <= 1) throw httpError(409, 'No puedes eliminar o revocar al último Administrador.');
}
async function crearUsuario(req, res) {
  try {
    const body = req.body;
    const mapped = {
      nombre_usuario: body.nombre ?? body.nombre_usuario,
      apellido_usuario: body.apellido ?? body.apellido_usuario,
      telefono_usuario: body.telefono ?? body.telefono_usuario,
      correo_usuario: body.correo ?? body.correo_usuario,
      direccion_usuario: body.direccion ?? body.direccion_usuario,
      codigo_postal: body.CP ?? body.codigo_postal,
      estado_usuario: body.estado ?? body.estado_usuario,
      municipio_usuario: body.municipio ?? body.municipio_usuario,
      colonia_usuario: body.colonia ?? body.colonia_usuario,
      referencias: body.referencias,
    };
    const password = body.contra ?? body.contrasena;
    if (typeof password !== 'string' || !password || Buffer.byteLength(password, 'utf8') > 72 ||
        ['nombre_usuario','apellido_usuario','correo_usuario','codigo_postal','estado_usuario','municipio_usuario','colonia_usuario']
          .some(field => !String(mapped[field] ?? '').trim())) {
      throw httpError(400, 'Completa los datos requeridos y una contraseña de hasta 72 bytes.');
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await transaction(async client => {
      const cliente = await client.query("SELECT id_rol FROM roles WHERE codigo = 'cliente' FOR SHARE");
      if (!cliente.rows[0]) throw httpError(409, 'No existe el rol Cliente.');
      const roleId = body.id_rol === undefined ? cliente.rows[0].id_rol : positiveId(body.id_rol);
      if (!req.usuario && (roleId !== cliente.rows[0].id_rol || body.rol !== undefined)) {
        throw httpError(403, 'El registro público solo permite el rol Cliente.');
      }
      if (req.usuario && roleId !== cliente.rows[0].id_rol && !req.usuario.permisos.includes('roles.asignar')) {
        throw httpError(403, 'No tienes permiso para asignar roles.');
      }
      const role = await client.query('SELECT id_rol FROM roles WHERE id_rol = $1 FOR SHARE', [roleId]);
      if (!role.rows[0]) throw httpError(400, 'El rol seleccionado no existe.');
      const duplicate = await client.query('SELECT id_usuario FROM usuario WHERE correo_usuario = $1', [mapped.correo_usuario.trim()]);
      if (duplicate.rows.length) throw httpError(409, 'El correo ya está registrado.');
      mapped.correo_usuario = mapped.correo_usuario.trim();
      const result = await client.query(`INSERT INTO usuario
        (${profileFields.join(', ')}, contrasena, id_rol)
        VALUES (${Array.from({length: 12}, (_, i) => '$' + (i + 1)).join(', ')}) RETURNING *`,
        [...profileFields.map(field => mapped[field] ?? null), hash, roleId]);
      const created = safeUser(result.rows[0]);
      await audit(client, req.usuario, 'usuarios.crear', 'usuario', created.id_usuario, { id_rol: roleId });
      return { ...created, ...await getAccess(created.id_usuario, client) };
    });
    res.status(201).json({ mensaje: 'Usuario creado exitosamente.', usuario: user });
  } catch (error) { respondError(res, error); }
}
async function obtenerUsuarios(req, res) {
  try { res.json((await db.query(selectUser + ' ORDER BY u.id_usuario')).rows.map(safeUser)); }
  catch (error) { respondError(res, error); }
}
async function obtenerUsuarioPorId(req, res) {
  try {
    const result = await db.query(selectUser + ' WHERE u.id_usuario = $1', [positiveId(req.params.id)]);
    if (!result.rows[0]) throw httpError(404, 'Usuario no encontrado.');
    res.json({ usuario: safeUser(result.rows[0]) });
  } catch (error) { respondError(res, error); }
}
async function actualizarUsuario(req, res) {
  try {
    const id = positiveId(req.params.id);
    if (req.body.rol !== undefined) throw httpError(400, 'Utiliza id_rol para asignar el rol.');
    const user = await transaction(async client => {
      // Serializa cambios de roles y eliminaciones para proteger al ultimo administrador.
      await client.query('SELECT pg_advisory_xact_lock(746301)');
      
      const result = await client.query('SELECT * FROM usuario WHERE id_usuario = $1 FOR UPDATE', [id]);
      
      const current = result.rows[0];
      
      if (!current) throw httpError(404, 'Usuario no encontrado.');
      const fields = profileFields.filter(field => req.body[field] !== undefined);

      if (fields.length && id !== req.usuario.id_usuario && !req.usuario.permisos.includes('usuarios.editar')) {
        throw httpError(403, 'No puedes editar los datos de otros usuarios.');
      }

      let roleId = current.id_rol;

      if (req.body.id_rol !== undefined) {
        roleId = positiveId(req.body.id_rol);

        if (roleId !== current.id_rol) {
          if (!req.usuario.permisos.includes('roles.asignar')) {
            throw httpError(403, 'No puedes asignar roles.');
          }

          const role = await client.query(
            'SELECT id_rol FROM roles WHERE id_rol = $1 FOR SHARE',
            [roleId]
          );

          if (!role.rows[0]) {
            throw httpError(400, 'El rol seleccionado no existe.');
          }

          await keepAdministrator(client, current, roleId);

          fields.push('id_rol');
        }
      }

      // NUEVA CONTRASEÑA
      const cambiarContrasena =
        typeof req.body.contrasena === 'string' &&
        req.body.contrasena.trim() !== '';

      let contrasenaHash = null;

      if (cambiarContrasena) {
        if (id !== req.usuario.id_usuario && !req.usuario.permisos.includes('usuarios.editar')) {
          throw httpError(403, 'No puedes cambiar la contraseña de otros usuarios.');
        }
        if (Buffer.byteLength(req.body.contrasena, 'utf8') > 72) throw httpError(400, 'La contraseña no puede superar 72 bytes.');
        contrasenaHash = await bcrypt.hash(req.body.contrasena, 10);
        fields.push('contrasena');
      }

      // VALORES DEL UPDATE
      const values = fields.map(field => {
        if (field === 'id_rol') {
          return roleId;
        }

        if (field === 'contrasena') {
          return contrasenaHash;
        }

        return req.body[field];
      });

      if (fields.length) {
        await client.query(
          `UPDATE usuario
          SET ${fields.map((field, i) => field + ' = $' + (i + 1)).join(', ')}
          WHERE id_usuario = $${fields.length + 1}`,
          [...values, id]
        );
        if (cambiarContrasena) await revokeUserSessions(client, id);

        if (fields.some(field => field !== 'id_rol')) {
          await audit(
            client,
            req.usuario,
            'usuarios.editar',
            'usuario',
            id,
            {
              campos: fields.filter(f => f !== 'id_rol')
            }
          );
        }

        if (roleId !== current.id_rol) {
          await audit(
            client,
            req.usuario,
            'roles.asignar',
            'usuario',
            id,
            {
              anterior: current.id_rol,
              nuevo: roleId
            }
          );
        }
      }
      
      const updated = await client.query(selectUser + ' WHERE u.id_usuario = $1', [id]);
      return safeUser(updated.rows[0]);
    });
    res.json({ mensaje: 'Usuario actualizado.', usuario: user });
  } catch (error) { respondError(res, error); }
}
async function revocarRol(req, res) {
  try {
    const id = positiveId(req.params.id);
    await transaction(async client => {
      await client.query('SELECT pg_advisory_xact_lock(746301)');
      const current = (await client.query('SELECT * FROM usuario WHERE id_usuario = $1 FOR UPDATE', [id])).rows[0];
      if (!current) throw httpError(404, 'Usuario no encontrado.');
      const cliente = (await client.query("SELECT id_rol FROM roles WHERE codigo = 'cliente' FOR SHARE")).rows[0];
      if (!cliente) throw httpError(409, 'No existe el rol Cliente.');
      await keepAdministrator(client, current, cliente.id_rol);
      await client.query('UPDATE usuario SET id_rol = $1 WHERE id_usuario = $2', [cliente.id_rol, id]);
      await audit(client, req.usuario, 'roles.revocar', 'usuario', id, { anterior: current.id_rol, nuevo: cliente.id_rol });
    });
    res.json({ mensaje: 'Rol revocado. El usuario ahora es Cliente.' });
  } catch (error) { respondError(res, error); }
}
async function eliminarUsuario(req, res) {
  try {
    const id = positiveId(req.params.id);
    await transaction(async client => {
      await client.query('SELECT pg_advisory_xact_lock(746301)');
      const current = (await client.query('SELECT * FROM usuario WHERE id_usuario = $1 FOR UPDATE', [id])).rows[0];
      if (!current) throw httpError(404, 'Usuario no encontrado.');
      await keepAdministrator(client, current, null);
      await audit(client, req.usuario, 'usuarios.eliminar', 'usuario', id);
      try {
        await client.query('DELETE FROM usuario WHERE id_usuario = $1', [id]);
      } catch (error) {
        if (error.code === '23503') {
          throw httpError(409, 'No se puede eliminar este usuario porque tiene pedidos, compras u otros registros relacionados. No se eliminó ningún dato.');
        }
        throw error;
      }
    });
    res.json({ mensaje: 'Usuario eliminado.' });
  } catch (error) { respondError(res, error); }
}
module.exports = { crearUsuario, obtenerUsuarios, obtenerUsuarioPorId, actualizarUsuario, revocarRol, eliminarUsuario };

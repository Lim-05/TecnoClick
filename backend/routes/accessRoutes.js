const router = require('express').Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const { requirePermission: permit } = require('../middleware/permission');
const { audit, transaction, positiveId, httpError, respondError } = require('../services/access');
router.use(['/roles', '/permisos', '/auditoria'], auth);
router.get('/roles', (req, res, next) => {
  if (req.usuario.permisos.some(p => ['roles.ver','roles.asignar','usuarios.crear'].includes(p))) return next();
  res.status(403).json({ mensaje: 'No tienes permiso para consultar roles.' });
}, async (req, res) => {
  try {
    const result = await db.query(`SELECT r.*,
      COALESCE(array_agg(rp.id_permiso) FILTER (WHERE rp.id_permiso IS NOT NULL), '{}') AS permisos
      FROM roles r LEFT JOIN rol_permiso rp ON rp.id_rol = r.id_rol
      GROUP BY r.id_rol ORDER BY r.id_rol`);
    res.json(result.rows);
  } catch (error) { respondError(res, error); }
});
router.get('/permisos', permit('roles.ver'), async (req, res) => {
  try { res.json((await db.query('SELECT * FROM permisos ORDER BY codigo')).rows); }
  catch (error) { respondError(res, error); }
});
async function saveRole(req, res) {
  try {
    const { codigo, nombre, descripcion = '', permisos = [] } = req.body;
    if (typeof codigo !== 'string' || !/^[a-z][a-z0-9_]{0,99}$/.test(codigo) ||
        typeof nombre !== 'string' || !nombre.trim() || nombre.length > 150 ||
        typeof descripcion !== 'string' || !Array.isArray(permisos)) {
      throw httpError(400, 'Indica un código válido, nombre y lista de permisos.');
    }
    const ids = [...new Set(permisos.map(positiveId))];
    const result = await transaction(async client => {
      const valid = await client.query('SELECT id_permiso FROM permisos WHERE id_permiso = ANY($1::int[])', [ids]);
      if (valid.rows.length !== ids.length) throw httpError(400, 'Uno de los permisos no existe.');
      let role;
      if (req.params.id) {
        const id = positiveId(req.params.id);
        role = (await client.query('SELECT * FROM roles WHERE id_rol = $1 FOR UPDATE', [id])).rows[0];
        if (!role) throw httpError(404, 'Rol no encontrado.');
        if (role.es_sistema) throw httpError(403, 'Los roles de sistema no se pueden modificar.');
        role = (await client.query('UPDATE roles SET codigo=$1,nombre=$2,descripcion=$3 WHERE id_rol=$4 RETURNING *',
          [codigo, nombre.trim(), descripcion, id])).rows[0];
        await client.query('DELETE FROM rol_permiso WHERE id_rol=$1', [id]);
      } else {
        role = (await client.query('INSERT INTO roles (codigo,nombre,descripcion) VALUES ($1,$2,$3) RETURNING *',
          [codigo, nombre.trim(), descripcion])).rows[0];
      }
      await client.query(`INSERT INTO rol_permiso (id_rol,id_permiso)
        SELECT $1, unnest($2::int[])`, [role.id_rol, ids]);
      await audit(client, req.usuario, req.params.id ? 'roles.editar' : 'roles.crear', 'roles', role.id_rol, { permisos: ids });
      return { ...role, permisos: ids };
    });
    res.status(req.params.id ? 200 : 201).json(result);
  } catch (error) { respondError(res, error); }
}
router.post('/roles', permit('roles.crear'), saveRole);
router.put('/roles/:id', permit('roles.editar'), saveRole);
router.delete('/roles/:id', permit('roles.eliminar'), async (req, res) => {
  try {
    const id = positiveId(req.params.id);
    await transaction(async client => {
      const role = (await client.query('SELECT * FROM roles WHERE id_rol=$1 FOR UPDATE', [id])).rows[0];
      if (!role) throw httpError(404, 'Rol no encontrado.');
      if (role.es_sistema) throw httpError(403, 'Los roles de sistema no se pueden eliminar.');
      await client.query('DELETE FROM roles WHERE id_rol=$1', [id]);
      await audit(client, req.usuario, 'roles.eliminar', 'roles', id, { codigo: role.codigo });
    });
    res.json({ mensaje: 'Rol eliminado.' });
  } catch (error) { respondError(res, error); }
});
router.get('/auditoria', permit('auditoria.ver'), async (req, res) => {
  try {
    const page = positiveId(req.query.pagina || 1);
    const limit = 50;
    const result = await db.query(`SELECT a.*, u.nombre_usuario
      FROM auditoria a LEFT JOIN usuario u ON u.id_usuario = a.id_usuario
      ORDER BY a.fecha DESC, a.id_auditoria DESC LIMIT $1 OFFSET $2`, [limit, (page - 1) * limit]);
    res.json({ registros: result.rows, pagina: page });
  } catch (error) { respondError(res, error); }
});
module.exports = router;

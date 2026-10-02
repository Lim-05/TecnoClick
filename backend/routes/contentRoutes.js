const router = require('express').Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const { requirePermission: permit } = require('../middleware/permission');
const { audit, transaction, httpError, positiveId, respondError } = require('../services/access');
const { insertContent } = require('../services/contentId');
const resources = [
  { route: 'contenido/productos', table: 'productos', id: 'id_producto', prefix: 'productos',
    fields: ['nombre','descripcion','precio','id_categoria','imagen','stock','marca'] },
  { route: 'categorias', table: 'categoria', id: 'id_categoria', prefix: 'categorias',
    fields: ['nombre_categoria','descripcion_categoria'] },
];
for (const resource of resources) {
  // Identificadores SQL definidos por el servidor, nunca por el cliente.
  const { route, table, id, prefix, fields } = resource;
  router.get('/' + route, auth, permit(prefix + '.ver'), async (req, res) => {
    try { res.json((await db.query(`SELECT * FROM ${table} ORDER BY ${id}`)).rows); }
    catch (error) { respondError(res, error); }
  });
  async function save(req, res) {
    try {
      const data = req.body || {};
      if (typeof data[fields[0]] !== 'string' || !data[fields[0]].trim()) {
        throw httpError(400, 'El nombre es obligatorio.');
      }
      if (prefix === 'productos') {
        if (!/^\d+$/.test(String(data.precio)) || !/^\d+$/.test(String(data.stock)) ||
            !Number.isSafeInteger(Number(data.precio)) || !Number.isSafeInteger(Number(data.stock))) {
          throw httpError(400, 'Precio y stock deben ser enteros no negativos.');
        }
        if (data.id_categoria !== '' && data.id_categoria != null) positiveId(data.id_categoria);
      }
      const values = fields.map(field => {
        // Una imagen vacía es válida; el catálogo ya usa su imagen de respaldo.
        if (field === 'imagen') return typeof data.imagen === 'string' ? data.imagen.trim() : '';
        if (field === 'id_categoria') return data[field] === '' || data[field] == null ? null : Number(data[field]);
        if (field === 'precio' || field === 'stock') return Number(data[field]);
        return data[field] ?? null;
      });
      const saved = await transaction(async client => {
        let result;
        if (req.params.id) {
          result = await client.query(`UPDATE ${table} SET ${fields.map((f,i)=>f+'=$'+(i+1)).join(',')}
            WHERE ${id}=$${fields.length+1} RETURNING *`, [...values, positiveId(req.params.id)]);
          if (!result.rows[0]) throw httpError(404, 'Contenido no encontrado.');
        } else {
          result = await insertContent(client, table, fields, values);
        }
        const row = result.rows[0];
        await audit(client, req.usuario, prefix + (req.params.id ? '.editar' : '.crear'), table, row[id]);
        return row;
      });
      res.status(req.params.id ? 200 : 201).json(saved);
    } catch (error) { respondError(res, error); }
  }
  async function remove(req, res) {
    try {
      const recordId = positiveId(req.params.id);
      await transaction(async client => {
        const result = await client.query(`DELETE FROM ${table} WHERE ${id}=$1 RETURNING ${id}`, [recordId]);
        if (!result.rows.length) throw httpError(404, 'Contenido no encontrado.');
        await audit(client, req.usuario, prefix + '.eliminar', table, recordId);
      });
      res.json({ mensaje: 'Contenido eliminado.' });
    } catch (error) { respondError(res, error); }
  }
  router.post('/' + route, auth, permit(prefix + '.crear'), save);
  router.put('/' + route + '/:id', auth, permit(prefix + '.editar'), save);
  router.delete('/' + route + '/:id', auth, permit(prefix + '.eliminar'), remove);
}
module.exports = router;

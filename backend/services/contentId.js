// Identificadores internos: nunca aceptar nombres de tablas o columnas del cliente.
const resources = { productos: 'id_producto', categoria: 'id_categoria' };

async function insertContent(client, table, fields, values) {
  const idColumn = resources[table];
  if (!idColumn) throw new Error('Recurso de contenido inválido.');
  // Serializa las altas frente a otros INSERT/UPDATE/DELETE, incluido SQL manual.
  // Necesario para soportar IDs enteros sin DEFAULT y secuencias atrasadas.
  await client.query(`LOCK TABLE public.${table} IN SHARE ROW EXCLUSIVE MODE`);
  const metadata = await client.query(`
    SELECT pg_get_serial_sequence('public.' || table_name, column_name) AS sequence,
           identity_generation
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name=$1 AND column_name=$2`, [table, idColumn]);
  if (!metadata.rows[0]) throw new Error('No se encontró la clave del contenido.');
  const { sequence, identity_generation: generation } = metadata.rows[0];
  const maximum = await client.query(`SELECT COALESCE(MAX(${idColumn}),0)::text AS max_id FROM public.${table}`);
  const maxId = BigInt(maximum.rows[0].max_id);
  let id;
  if (sequence) {
    id = BigInt((await client.query('SELECT nextval($1::regclass)::text AS id', [sequence])).rows[0].id);
    if (id <= maxId) {
      id = maxId + 1n;
      // Solo avanza el contador; no reutiliza ni cambia IDs existentes.
      await client.query('SELECT setval($1::regclass,$2::bigint,true)', [sequence, id.toString()]);
    }
  } else {
    id = maxId + 1n;
  }
  const columns = [idColumn, ...fields];
  const params = [id.toString(), ...values];
  const override = generation === 'ALWAYS' ? ' OVERRIDING SYSTEM VALUE' : '';
  return client.query(`INSERT INTO public.${table} (${columns.join(',')})${override}
    VALUES (${params.map((_,i)=>'$'+(i+1)).join(',')}) RETURNING *`, params);
}
module.exports = { insertContent };

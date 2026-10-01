import { useCallback, useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { hasPermission } from '../../utils/authUtils';
import Modal from '../../components/common/Modal';
import './Gestion.css';
const configs = {
  productos: { title: 'Productos', path: '/contenido/productos', id: 'id_producto',
    fields: [['nombre','Nombre'],['descripcion','Descripción'],['precio','Precio'],['stock','Stock'],['marca','Marca'],['imagen','Archivo de imagen'],['id_categoria','Categoría']],
    empty: { nombre:'',descripcion:'',precio:0,stock:0,marca:'',imagen:'',id_categoria:'' } },
  categorias: { title: 'Categorías', path: '/categorias', id: 'id_categoria',
    fields: [['nombre_categoria','Nombre'],['descripcion_categoria','Descripción']],
    empty: { nombre_categoria:'',descripcion_categoria:'' } },
};
export default function ContenidoAdmin({ resource = 'productos' }) {
  const config = configs[resource];
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    const data = await api(config.path); setRows(data);
    if (resource === 'productos' && hasPermission('categorias.ver')) setCategories(await api('/categorias'));
  }, [config.path, resource]);
  useEffect(() => {
    setLoading(true);
    load().catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [load]);
  async function save(e) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      await api(config.path + (form[config.id] ? '/' + form[config.id] : ''), {
        method: form[config.id] ? 'PUT' : 'POST', body: form,
      });
      await load(); setForm(null);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  async function remove(row) {
    if (!window.confirm('¿Eliminar este contenido?')) return;
    setBusy(true); setError('');
    try { await api(config.path + '/' + row[config.id], { method: 'DELETE' }); await load(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  if (loading) return <p>Cargando contenido...</p>;
  return <section className="gestion"><h2>Gestión de {config.title}</h2>
    {hasPermission(resource + '.crear') && <button disabled={busy} onClick={() => { setError(''); setForm({ ...config.empty }); }}>Crear {resource === 'productos' ? 'producto' : 'categoría'}</button>}
    {error && <p role="alert" className="gestion-error">{error}</p>}
    <div className="gestion-table"><table><thead><tr><th>ID</th>
      {config.fields.filter(([key]) => !['imagen','descripcion','descripcion_categoria'].includes(key)).map(([key,label]) => <th key={key}>{label}</th>)}<th>Acciones</th>
    </tr></thead><tbody>{rows.map(row => <tr key={row[config.id]}><td>{row[config.id]}</td>
      {config.fields.filter(([key]) => !['imagen','descripcion','descripcion_categoria'].includes(key)).map(([key]) => <td key={key}>
        {key === 'id_categoria' ? categories.find(c => c.id_categoria === row[key])?.nombre_categoria || row[key] : row[key]}
      </td>)}<td>
        {hasPermission(resource + '.editar') && <button disabled={busy} onClick={() => { setError(''); setForm({ ...row }); }}>Editar</button>}
        {hasPermission(resource + '.eliminar') && <button disabled={busy} onClick={() => remove(row)}>Eliminar</button>}
      </td></tr>)}</tbody></table></div>
    {!rows.length && <p>No hay contenido registrado.</p>}
    <Modal isOpen={!!form} onClose={() => !busy && setForm(null)}>{form && <form className="gestion-form" onSubmit={save}>
      <h3>{form[config.id] ? 'Editar' : 'Crear'} {resource === 'productos' ? 'producto' : 'categoría'}</h3>
      {config.fields.map(([key,label]) => <label key={key}>{label}
        {key === 'id_categoria' ? <select value={form[key] ?? ''} onChange={e => setForm({ ...form,[key]:e.target.value })}>
          <option value="">Sin categoría</option>{categories.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>)}
          {form[key] && !categories.some(c => c.id_categoria === Number(form[key])) && <option value={form[key]}>Categoría #{form[key]}</option>}
        </select> : <input type={['precio','stock'].includes(key) ? 'number' : 'text'}
          min={['precio','stock'].includes(key) ? 0 : undefined} step={['precio','stock'].includes(key) ? 1 : undefined}
          required={[config.fields[0][0],'precio','stock'].includes(key)}
          value={form[key] ?? ''} onChange={e => setForm({ ...form,[key]:e.target.value })} />}
      </label>)}
      {error && <p role="alert" className="gestion-error">{error}</p>}
      <button disabled={busy}>{busy ? 'Guardando...' : 'Guardar'}</button>
      <button type="button" disabled={busy} onClick={() => setForm(null)}>Cancelar</button>
    </form>}</Modal>
  </section>;
}

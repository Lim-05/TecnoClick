import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { hasPermission } from '../../utils/authUtils';
import Modal from '../../components/common/Modal';
import './Gestion.css';
export default function RolesAdmin() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function load() {
    const [r,p] = await Promise.all([api('/roles'),api('/permisos')]);
    setRoles(r); setPermissions(p);
  }
  useEffect(() => { load().catch(e => setError(e.message)); }, []);
  async function save(e) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      await api('/roles' + (form.id_rol ? '/' + form.id_rol : ''), { method: form.id_rol ? 'PUT' : 'POST', body: form });
      await load(); setForm(null);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  async function remove(role) {
    if (!window.confirm('¿Eliminar el rol ' + role.nombre + '?')) return;
    setBusy(true); setError('');
    try { await api('/roles/' + role.id_rol, { method: 'DELETE' }); await load(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <section className="gestion"><h2>Roles y permisos</h2>
    <p>Los roles de sistema conservan sus permisos. Los roles personalizados pueden modificarse.</p>
    {hasPermission('roles.crear') && <button disabled={busy} onClick={() => { setError(''); setForm({ codigo: '', nombre: '', descripcion: '', permisos: [] }); }}>Crear rol</button>}
    {error && <p role="alert" className="gestion-error">{error}</p>}
    <div className="gestion-table"><table><thead><tr><th>ID</th><th>Rol</th><th>Permisos</th><th>Acciones</th></tr></thead>
      <tbody>{roles.map(r => <tr key={r.id_rol}><td>{r.id_rol}</td><td>{r.nombre} ({r.codigo})</td>
        <td>{permissions.filter(p => r.permisos.includes(p.id_permiso)).map(p => p.codigo).join(', ') || 'Sin permisos'}</td>
        <td>{r.es_sistema ? 'Rol de sistema' : <>
          {hasPermission('roles.editar') && <button disabled={busy} onClick={() => { setError(''); setForm({ ...r }); }}>Editar</button>}
          {hasPermission('roles.eliminar') && <button disabled={busy} onClick={() => remove(r)}>Eliminar</button>}
        </>}</td></tr>)}</tbody></table></div>
    <Modal isOpen={!!form} onClose={() => !busy && setForm(null)}>{form && <form className="gestion-form" onSubmit={save}>
      <h3>{form.id_rol ? 'Editar rol' : 'Crear rol'}</h3>
      <label>Código<input required pattern="[a-z][a-z0-9_]*" maxLength={100} value={form.codigo}
        onChange={e => setForm({ ...form, codigo: e.target.value })} placeholder="editor_catalogo" /></label>
      <label>Nombre<input required maxLength={150} value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></label>
      <label>Descripción<textarea value={form.descripcion ?? ''} onChange={e => setForm({ ...form, descripcion: e.target.value })} /></label>
      <fieldset><legend>Permisos personalizados</legend>{permissions.map(p => <label className="gestion-check" key={p.id_permiso}>
        <input type="checkbox" checked={form.permisos.includes(p.id_permiso)} onChange={e => setForm({
          ...form, permisos: e.target.checked ? [...form.permisos,p.id_permiso] : form.permisos.filter(id => id !== p.id_permiso),
        })} />{p.codigo} — {p.descripcion}
      </label>)}</fieldset>
      {error && <p role="alert" className="gestion-error">{error}</p>}
      <button disabled={busy}>{busy ? 'Guardando...' : 'Guardar'}</button>
      <button type="button" disabled={busy} onClick={() => setForm(null)}>Cancelar</button>
    </form>}</Modal>
  </section>;
}

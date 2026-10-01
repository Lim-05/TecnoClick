import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { hasPermission } from '../../utils/authUtils';
import Modal from '../../components/common/Modal';
import './UsuariosAdmin.css';
import './Gestion.css';
const fields = [
  ['nombre_usuario','Nombre'], ['apellido_usuario','Apellido'], ['telefono_usuario','Teléfono'],
  ['correo_usuario','Correo'], ['direccion_usuario','Dirección'], ['codigo_postal','Código postal'],
  ['estado_usuario','Estado'], ['municipio_usuario','Municipio'], ['colonia_usuario','Colonia'],
  ['referencias','Referencias'],
];
const empty = Object.fromEntries(fields.map(([key]) => [key, '']));
export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const canAssign = hasPermission('roles.asignar');
  async function load() {
    const [users, available] = await Promise.all([api('/usuarios'), api('/roles')]);
    setUsuarios(users); setRoles(available);
  }
  useEffect(() => { load().catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);
  function open(user) {
    setError('');
    setEditing(user?.id_usuario ?? null);
    setForm(user ? { ...empty, ...user } : { ...empty, contrasena: '', id_rol: roles.find(r => r.codigo === 'cliente')?.id_rol ?? '' });
  }
  async function save(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const body = editing && !hasPermission('usuarios.editar') ? {} : Object.fromEntries(fields.map(([key]) => [key, form[key]]));
      if (!editing) body.contrasena = form.contrasena;
      if (canAssign || !editing) body.id_rol = Number(form.id_rol);
      await api(editing ? '/usuarios/' + editing : '/usuarios/admin', { method: editing ? 'PUT' : 'POST', body });
      await load(); setForm(null);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function action(user, revoke) {
    if (!window.confirm(revoke ? '¿Revocar el rol y devolver este usuario a Cliente?' : '¿Eliminar este usuario?')) return;
    setBusy(true); setError('');
    try { await api('/usuarios/' + user.id_usuario + (revoke ? '/rol' : ''), { method: 'DELETE' }); await load(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  if (loading) return <p>Cargando usuarios...</p>;
  return <div className="usuarios-admin-page"><div className="usuarios-admin-container gestion">
    <h4>Gestión de Usuarios</h4>
    {hasPermission('usuarios.crear') && <button disabled={busy} onClick={() => open(null)}>Registrar usuario</button>}
    {error && <p role="alert" className="gestion-error">{error}</p>}
    <div className="gestion-table"><table className="usuarios-table"><thead><tr>
      <th>ID</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Acciones</th>
    </tr></thead><tbody>{usuarios.map(u => <tr key={u.id_usuario}>
      <td>{u.id_usuario}</td><td>{u.nombre_usuario} {u.apellido_usuario}</td><td>{u.correo_usuario}</td>
      <td>{u.rol_nombre}</td><td>
        {(hasPermission('usuarios.editar') || canAssign) && <button disabled={busy} onClick={() => open(u)}>Editar / asignar rol</button>}
        {hasPermission('roles.revocar') && u.rol_codigo !== 'cliente' && <button disabled={busy} onClick={() => action(u, true)}>Revocar rol</button>}
        {hasPermission('usuarios.eliminar') && <button disabled={busy} onClick={() => action(u, false)}>Eliminar</button>}
      </td>
    </tr>)}</tbody></table></div>
    {!usuarios.length && <p>No hay usuarios registrados.</p>}
    <Modal isOpen={!!form} onClose={() => !busy && setForm(null)}>
      {form && <form className="gestion-form" onSubmit={save}>
        <h3>{editing ? 'Editar usuario' : 'Registrar usuario'}</h3>
        {fields.map(([key,label]) => <label key={key}>{label}
          <input name={key} type={key === 'correo_usuario' ? 'email' : 'text'}
            required={['nombre_usuario','apellido_usuario','correo_usuario','codigo_postal','estado_usuario','municipio_usuario','colonia_usuario'].includes(key)}
            disabled={busy || (editing && !hasPermission('usuarios.editar'))}
            value={form[key] ?? ''} onChange={e => setForm({ ...form, [key]: e.target.value })} />
        </label>)}
        {!editing && <label>Contraseña<input type="password" required value={form.contrasena}
          onChange={e => setForm({ ...form, contrasena: e.target.value })} /></label>}
        <label>Rol<select required value={form.id_rol} disabled={busy || !canAssign}
          onChange={e => setForm({ ...form, id_rol: Number(e.target.value) })}>
          <option value="">Selecciona un rol</option>
          {roles.map(r => <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>)}
        </select></label>
        {error && <p role="alert" className="gestion-error">{error}</p>}
        <button disabled={busy}>{busy ? 'Guardando...' : 'Guardar'}</button>
        <button type="button" disabled={busy} onClick={() => setForm(null)}>Cancelar</button>
      </form>}
    </Modal>
  </div></div>;
}

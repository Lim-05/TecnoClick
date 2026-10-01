import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import './Gestion.css';
export default function AuditoriaAdmin() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    setBusy(true); setError('');
    api('/auditoria?pagina=' + page).then(data => { if (active) setRows(data.registros); })
      .catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [page, refresh]);
  return <section className="gestion"><h2>Registro de auditoría</h2>
    <button disabled={busy} onClick={() => setRefresh(r => r+1)}>Actualizar</button>
    {error && <p role="alert" className="gestion-error">{error}</p>}
    <div className="gestion-table"><table><thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Recurso</th><th>Detalle</th></tr></thead>
      <tbody>{rows.map(r => <tr key={r.id_auditoria}>
        <td>{new Date(r.fecha).toLocaleString('es-MX')}</td><td>{r.nombre_usuario || r.actor_referencia}</td>
        <td>{r.accion}</td><td>{r.entidad} #{r.id_entidad}</td><td><code>{JSON.stringify(r.detalle)}</code></td>
      </tr>)}</tbody></table></div>
    {!busy && !rows.length && <p>No hay registros en esta página.</p>}
    <button disabled={busy || page === 1} onClick={() => setPage(p => p-1)}>Anterior</button>
    <span> Página {page} </span><button disabled={busy || rows.length < 50} onClick={() => setPage(p => p+1)}>Siguiente</button>
  </section>;
}

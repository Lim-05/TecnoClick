import { Link } from 'react-router-dom';
import { hasPermission, hasRole } from '../../utils/authUtils';
import './AdminHome.css';
export default function AdminHome() {
  const options = [
    { title:'Gestionar Usuarios',path:'/admin/usuarios',permission:'usuarios.ver',color:'#007bff' },
    { title:'Gestionar Productos',path:'/admin/productos',permission:'productos.ver',color:'#28a745' },
    { title:'Gestionar Categorías',path:'/admin/categorias',permission:'categorias.ver',color:'#398678' },
    { title:'Consultar Ingresos',path:'/admin/ingresos',permission:'ingresos.ver',color:'#ffc107' },
    { title:'Gestionar Pedidos',path:'/admin/pedidos',permission:'pedidos.gestionar',color:'#6e0000' },
    { title:'Roles y Permisos',path:'/admin/roles',permission:'roles.ver',color:'#7455ac' },
    { title:'Registro de Auditoría',path:'/admin/auditoria',permission:'auditoria.ver',color:'#43556e' },
  ];
  // Los clientes usan el catalogo publico; el Editor tiene un panel limitado al contenido.
  return <div className="admin-home-page"><div className="admin-home-container">
    <h4>{hasRole('editor') ? 'Panel de Editor' : 'Panel de Administración'}</h4>
    <p className="admin-subtitle">Selecciona una sección para gestionar</p>
    <div className="admin-grid">{options.filter(op => hasPermission(op.permission)).map(op => <Link
      key={op.path} to={op.path} className="admin-card" style={{ borderTopColor:op.color }}><h5>{op.title}</h5></Link>)}</div>
  </div></div>;
}

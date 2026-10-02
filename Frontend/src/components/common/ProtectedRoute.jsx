import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '../../utils/api';
import { isAuthenticated, logout } from '../../utils/authUtils';

const ProtectedRoute = ({ children, requiredPermission, anyPermissions, requiredRole }) => {
  const location = useLocation();
  const [access, setAccess] = useState({ path: '', user: null, error: '' });
  useEffect(() => {
    let active = true;
    if (!isAuthenticated()) return;
    api('/auth/sesion').then(({ usuario }) => {
      if (!active) return;
      localStorage.setItem('usuario', JSON.stringify(usuario));
      window.dispatchEvent(new Event('usuarioChange'));
      setAccess({ path: location.pathname, user: usuario, error: '' });
    }).catch(error => {
      if (active) setAccess({ path: location.pathname, user: null, error: error.message });
    });
    return () => { active = false; };
  }, [location.pathname]);
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (access.path !== location.pathname) return <p>Verificando acceso...</p>;
  if (access.error) return <p role="alert">{access.error} <button onClick={() => { logout(); window.location.assign('/login'); }}>Volver a iniciar sesión</button></p>;
  const user = access.user;
  if (!user || (requiredRole && user.rol_codigo !== requiredRole) ||
      (requiredPermission && !user.permisos.includes(requiredPermission)) ||
      (anyPermissions && !anyPermissions.some(p => user.permisos.includes(p)))) {
    return <Navigate to="/" replace />;
  }
  return children;
};
export default ProtectedRoute;

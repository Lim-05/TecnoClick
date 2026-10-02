const SESSION_DURATION_MS = 2 * 24 * 60 * 60 * 1000; // 2 días

export const getToken = () => {
  // El token viaja automáticamente en la cookie HttpOnly.
  // Retornamos un marcador si hay sesión activa para mantener compatibilidad con componentes de compañeros.
  return localStorage.getItem('usuario') ? 'cookie-http-only' : null;
};

export const setToken = () => {
  // Ya no se guarda el JWT en localStorage por seguridad (Punto 7).
  // Solo registramos la marca de tiempo de inicio de sesión.
  localStorage.setItem('session_start', Date.now().toString());
};

export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('session_start');
};

export const decodeToken = () => null;

export const isTokenExpired = () => {
  const start = localStorage.getItem('session_start');
  if (!start) return false;
  return Date.now() - Number(start) >= SESSION_DURATION_MS;
};

export const isAuthenticated = () => {
  const usuario = localStorage.getItem('usuario');
  if (!usuario) return false;

  if (isTokenExpired()) {
    logout();
    return false;
  }
  return true;
};

export const getUserFromToken = () => {
  const data = localStorage.getItem('usuario');
  return data ? JSON.parse(data) : null;
};

export const logout = () => {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  removeToken();
  localStorage.removeItem('usuario');

  if (usuario?.id_usuario) {
    localStorage.removeItem(`cart_${usuario.id_usuario}`);
    localStorage.removeItem(`favoritos_${usuario.id_usuario}`);
  }

  fetch('https://localhost:3000/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  }).catch(() => {});

  window.dispatchEvent(new Event('usuarioChange'));
};

export const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
});

export const hasRole = (rol) => {
  if (!isAuthenticated()) return false;
  const userData = JSON.parse(localStorage.getItem('usuario') || 'null');
  return userData?.rol_codigo === rol;
};

export const hasPermission = (permission) => {
  if (!isAuthenticated()) return false;
  const userData = JSON.parse(localStorage.getItem('usuario') || 'null');
  return userData?.permisos?.includes(permission) || false;
};

export const getTokenTimeRemaining = () => {
  const start = localStorage.getItem('session_start');
  if (!start) return 2880;
  const remaining = SESSION_DURATION_MS - (Date.now() - Number(start));
  return Math.max(0, Math.floor(remaining / 1000 / 60));
};
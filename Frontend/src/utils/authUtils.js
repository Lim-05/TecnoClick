/**
 * Obtiene el token JWT almacenado en localStorage
 * @returns {string|null} El token o null si no existe
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Guarda el token JWT en localStorage
 * @param {string} token - El token a guardar
 */
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * Elimina el token JWT de localStorage
 */
export const removeToken = () => {
  localStorage.removeItem('token');
};

/**
 * Decodifica un token JWT sin verificar su firma
 * @param {string} token - El token a decodificar
 * @returns {object|null} El payload decodificado o null si es inválido
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error al decodificar token:', error);
    return null;
  }
};

/**
 * Verifica si el token ha expirado
 * @param {string} token - El token a verificar
 * @returns {boolean} true si el token ha expirado, false en caso contrario
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  
  if (!decoded || !decoded.exp) {
    return true;
  }
  
  // exp está en segundos, Date.now() está en milisegundos
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  
  return currentTime >= expirationTime;
};

/**
 * Verifica si el usuario está autenticado y su token es válido
 * @returns {boolean} true si está autenticado y el token es válido
 */
export const isAuthenticated = () => {
  const token = getToken();
  
  if (!token) {
    return false;
  }
  
  if (isTokenExpired(token)) {
    // Si el token expiró, limpiar todo
    logout();
    return false;
  }
  
  return true;
};

/**
 * Obtiene los datos del usuario desde el token
 * @returns {object|null} Los datos del usuario o null si no hay token válido
 */
export const getUserFromToken = () => {
  const token = getToken();
  
  if (!token || isTokenExpired(token)) {
    return null;
  }
  
  return decodeToken(token);
};

/**
 * Cierra la sesión del usuario eliminando todos los datos
 */
export const logout = () => {
  removeToken();
  localStorage.removeItem('usuario');
  
  // Limpiar carrito y favoritos del usuario actual
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  if (usuario?.id_usuario) {
    localStorage.removeItem(`cart_${usuario.id_usuario}`);
    localStorage.removeItem(`favoritos_${usuario.id_usuario}`);
  }
  
  // Disparar evento personalizado para que los componentes reaccionen
  window.dispatchEvent(new Event('usuarioChange'));
};

/**
 * Obtiene los headers de autorización para las peticiones HTTP
 * @returns {object} Headers con el token de autorización
 */
export const getAuthHeaders = () => {
  const token = getToken();
  
  if (!token) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

/**
 * Verifica si el usuario tiene un rol específico
 * @param {string} rol - El rol a verificar (ej: 'administrador', 'cliente')
 * @returns {boolean} true si el usuario tiene ese rol
 */
export const hasRole = (rol) => {
  const userData = getUserFromToken();
  return userData?.rol === rol;
};

/**
 * Obtiene el tiempo restante hasta que expire el token (en minutos)
 * @returns {number|null} Minutos restantes o null si no hay token
 */
export const getTokenTimeRemaining = () => {
  const token = getToken();
  const decoded = decodeToken(token);
  
  if (!decoded || !decoded.exp) {
    return null;
  }
  
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  const timeRemaining = expirationTime - currentTime;
  
  return Math.floor(timeRemaining / 1000 / 60); //convertir a minutos
};

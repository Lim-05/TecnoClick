import axios from 'axios';
import { getToken, isTokenExpired, logout } from './authUtils';

//crear instancia de axios con configuración base
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

//interceptor de REQUEST: Agregar token automáticamente a todas las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    //verificar si el token existe y no ha expirado
    if (token) {
      if (isTokenExpired(token)) {
        //si el token expiró, cerrar sesión y rechazar la petición
        logout();
        window.location.href = '/login';
        return Promise.reject(new Error('Token expirado. Por favor, inicia sesión nuevamente.'));
      }
      
      //agregar token al header
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//interceptor de RESPONSE: Manejar errores de autenticación automáticamente
axiosInstance.interceptors.response.use(
  (response) => {
    //si la respuesta es exitosa, simplemente devolverla
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      //Este apartado es para manejo de errores de autenticación
      if (status === 401) {
        //Token inválido o expirado
        console.error('Error de autenticación:', data.mensaje);
        
        //cerrar sesión y redirigir al login
        logout();
        
        //mostrar mensaje al usuario
        if (data.codigo === 'TOKEN_EXPIRADO') {
          alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        } else if (data.codigo === 'TOKEN_NO_PROPORCIONADO') {
          alert('Por favor, inicia sesión para continuar.');
        } else {
          alert('Sesión inválida. Por favor, inicia sesión nuevamente.');
        }
        
        //redirigir al login
        window.location.href = '/login';
      } 
      else if (status === 403) {
        //permisos insuficientes
        console.error('Acceso denegado:', data.mensaje);
        alert('No tienes permisos para realizar esta acción.');
      }
      else if (status === 500) {
        //error del servidor
        console.error('Error del servidor:', data.mensaje);
        alert('Error en el servidor. Por favor, intenta nuevamente más tarde.');
      }
    } else if (error.request) {
      //la petición se hizo pero no hubo respuesta
      console.error('No se recibió respuesta del servidor:', error.request);
      alert('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    } else {
      //problema al configurar la petición
      console.error('Error al configurar la petición:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

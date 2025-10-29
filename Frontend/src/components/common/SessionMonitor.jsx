import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getTokenTimeRemaining, logout } from '../../utils/authUtils';

/**
 * CHICOS: este es un componente invisible que monitorea la sesión del usuario
 * verifica periódicamente si el token sigue siendo válido
 * y cierra sesión automáticamente si ha expirado
 */
const SessionMonitor = () => {
  const navigate = useNavigate();

  useEffect(() => {
    //función para verificar el token
    const checkSession = () => {
      const usuario = localStorage.getItem('usuario');
      
      //solo verificar si hay un usuario logueado
      if (usuario && !isAuthenticated()) {
        console.warn('⚠️ Sesión expirada. Cerrando sesión automáticamente...');
        logout();
        alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        navigate('/login');
      }
    };

    //función para mostrar advertencia cuando la sesión está por expirar
    const checkSessionWarning = () => {
      const usuario = localStorage.getItem('usuario');
      
      if (usuario && isAuthenticated()) {
        const minutosRestantes = getTokenTimeRemaining();
        
        //advertir cuando quedan 30 minutos o menos
        if (minutosRestantes !== null && minutosRestantes <= 30 && minutosRestantes > 0) {
          console.warn(`⚠️ Tu sesión expirará en ${minutosRestantes} minutos`);
          
          //mostrar alerta solo una vez cuando queden 10 minutos
          const alertShown = sessionStorage.getItem('sessionWarningShown');
          if (minutosRestantes <= 10 && !alertShown) {
            alert(`⚠️ Tu sesión expirará en ${minutosRestantes} minutos. Guarda tu trabajo.`);
            sessionStorage.setItem('sessionWarningShown', 'true');
          }
        }
      }
    };

    //verificar sesión inmediatamente
    checkSession();

    //verificar cada 60 segundos (1 minuto)
    const sessionInterval = setInterval(() => {
      checkSession();
      checkSessionWarning();
    }, 60000);

    //limpiar intervalo al desmontar
    return () => {
      clearInterval(sessionInterval);
    };
  }, [navigate]);

  //este componente no renderiza nada
  return null;
};

export default SessionMonitor;

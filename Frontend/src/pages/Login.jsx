import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { setToken, getTokenTimeRemaining } from '../utils/authUtils';

const Login = () => {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(''); // Limpia mensaje previo

    try {
      const response = await fetch('http://localhost:3000/api/login', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo,
          contra: contrasena, 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje(data.mensaje);

        // Guardar TOKEN JWT en localStorage (CRÍTICO para autenticación)
        if (data.token) {
          setToken(data.token);
          console.log('✅Token guardado correctamente');
          
          // Mostrar tiempo de expiración
          const minutosRestantes = getTokenTimeRemaining();
          console.log(`⏱️ Tu sesión expirará en ${minutosRestantes} minutos (${Math.floor(minutosRestantes / 60 / 24)} días)`);
        }

        const usuarioCompleto = data.usuario;

        // Guardar usuario en localStorage
        localStorage.setItem('usuario', JSON.stringify(usuarioCompleto));
        window.dispatchEvent(new Event('usuarioChange'));

        // Detectar rol y redirigir
        console.log('🔍 Rol detectado:', data.usuario.rol);
        console.log('🔍 Usuario completo:', data.usuario);
        
        // Acepta tanto "admin" como "administrador" para mayor flexibilidad
        if (data.usuario.rol === 'administrador' || data.usuario.rol === 'admin') {
          console.log('Redirigiendo a /admin');
          navigate('/admin'); // panel de administrador
        } else {
          console.log('Redirigiendo a / (home)');
          navigate('/');
        }
      } else {
        setMensaje(data.mensaje);
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setMensaje('Error al conectar con el servidor.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h4>Iniciar Sesión</h4>

        <form onSubmit={handleSubmit}>
          <label>
            Correo electrónico
            <input
              type="email"
              placeholder="Ingresa tu correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="continue-btn active">
            Entrar
          </button>
        </form>

        {mensaje && <p className="mensaje">{mensaje}</p>}

        {/* Si luego habilitas el registro */}
        {/* 
        <p className="register-link">
          ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
        </p> 
        */}
      </div>
    </div>
  );
};

export default Login;


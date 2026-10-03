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
      const response = await fetch('https://localhost:3000/api/auth/login', { 
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo,
          contra: contrasena, 
        }),
      });

      const data = await response.json();

      if (response.ok) {
          setMensaje(data.mensaje);

          const usuarioCompleto = data.usuario;

          localStorage.setItem(
              'usuario',
              JSON.stringify(usuarioCompleto)
          );

          window.dispatchEvent(new Event('usuarioChange'));

          console.log('🔍 Rol detectado:', data.usuario.rol_codigo);
          console.log('🔍 Usuario completo:', data.usuario);

          if (data.usuario.rol_codigo === 'editor') {
              navigate('/editor');
          } else if (
              data.usuario.rol_codigo === 'admin' ||
              data.usuario.permisos?.some(p => [
                  'usuarios.ver',
                  'roles.ver',
                  'auditoria.ver',
                  'productos.crear',
                  'productos.editar',
                  'productos.eliminar',
                  'categorias.crear',
                  'categorias.editar',
                  'categorias.eliminar',
                  'ingresos.ver',
                  'pedidos.gestionar'
              ].includes(p))
          ) {
              navigate('/admin');
          } else {
              navigate('/');
          }
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
          
          <p className="forgot-password">
          <button
            type="button"
            onClick={() => navigate('/recuperar')}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </p>
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


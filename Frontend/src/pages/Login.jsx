import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMensaje('');
    setCargando(true);

    try {
      const response = await fetch(
        'https://localhost:3000/api/auth/login',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            correo,
            contra: contrasena
          })
        }
      );

      const data = await response.json();

      console.log('Respuesta login:', response.status, data);

      // Login correcto
      if (response.ok) {
        setMensaje(data.mensaje);

        const usuarioCompleto = data.usuario;

        localStorage.setItem(
          'usuario',
          JSON.stringify(usuarioCompleto)
        );

        window.dispatchEvent(new Event('usuarioChange'));

        console.log(
          '🔍 Rol detectado:',
          data.usuario.rol_codigo
        );

        console.log(
          '🔍 Usuario completo:',
          data.usuario
        );

        if (data.usuario.rol_codigo === 'editor') {
          navigate('/editor');

        } else if (
          data.usuario.rol_codigo === 'admin' ||
          data.usuario.permisos?.some(p =>
            [
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
            ].includes(p)
          )
        ) {
          navigate('/admin');

        } else {
          navigate('/');
        }

        return;
      }

      // Error de autenticación
      if (response.status === 401) {
        setMensaje(
          data.mensaje || 'Correo o contraseña incorrectos.'
        );
        return;
      }

      // Rate limiting
      if (response.status === 429) {
        setMensaje(
          data.mensaje ||
          'Demasiados intentos. Intenta nuevamente más tarde.'
        );
        return;
      }

      // Otros errores
      setMensaje(
        data.mensaje ||
        'No se pudo iniciar sesión. Intenta nuevamente.'
      );

    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setMensaje('Error al conectar con el servidor.');

    } finally {
      setCargando(false);
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
              disabled={cargando}
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
              disabled={cargando}
            />
          </label>

          <button
            type="submit"
            className="continue-btn active"
            disabled={cargando}
          >
            {cargando ? 'Verificando...' : 'Entrar'}
          </button>

          <p className="forgot-password">
            <button
              type="button"
              onClick={() => navigate('/recuperar')}
              disabled={cargando}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </p>

        </form>

        {mensaje && (
          <p className="mensaje">
            {mensaje}
          </p>
        )}

      </div>
    </div>
  );
};

export default Login;
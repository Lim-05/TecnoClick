import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';

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
          contra: contrasena, // Debe coincidir con lo que espera el backend
        }),
      });

      const data = await response.json();


      if (response.ok) {
        setMensaje(data.mensaje);

        //guardar TOKEN JWT en localStorage (CRÍTICO para reseñas)
        if (data.token) {
          localStorage.setItem('token', data.token);
          console.log('✅ Token guardado:', data.token);
        }

        const usuarioCompleto = data.usuario;

        // Guardar usuario en localStorage
        localStorage.setItem('usuario', JSON.stringify(usuarioCompleto));
        window.dispatchEvent(new Event('usuarioChange'));

        // Detectar rol
        if (data.usuario.rol === 'admin') {
          navigate('/admin'); // panel de administrador
        } else {
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


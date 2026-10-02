import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RecuperarContrasena = () => {
  const navigate = useNavigate();

  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMensaje('');
    setError('');
    setEnviando(true);

    try {
      const response = await fetch(
        'http://localhost:3000/api/auth/recuperar',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            correo
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMensaje(data.mensaje);
        setCorreo('');
      } else {
        setError(data.mensaje || 'No se pudo procesar la solicitud.');
      }

    } catch (error) {
      console.error('Error al solicitar recuperación:', error);
      setError('Error al conectar con el servidor.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        <h4>Recuperar contraseña</h4>

        <p>
          Ingresa el correo electrónico asociado a tu cuenta.
          Te enviaremos un enlace para restablecer tu contraseña.
        </p>

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

          <button
            type="submit"
            className="continue-btn active"
            disabled={enviando}
          >
            {enviando ? 'Enviando...' : 'Enviar enlace'}
          </button>

        </form>

        {mensaje && (
          <p className="mensaje">
            {mensaje}
          </p>
        )}

        {error && (
          <p className="mensaje">
            {error}
          </p>
        )}

        <p className="forgot-password">
          <button
            type="button"
            onClick={() => navigate('/login')}
          >
            Volver al inicio de sesión
          </button>
        </p>

      </div>
    </div>
  );
};

export default RecuperarContrasena;
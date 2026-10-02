import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const RestablecerContrasena = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMensaje('');
    setError('');

    if (contrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setGuardando(true);

    try {
      const response = await fetch(
        'https://localhost:3000/api/auth/restablecer',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token,
            contrasena
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMensaje(data.mensaje);

        setContrasena('');
        setConfirmarContrasena('');

        setTimeout(() => {
          navigate('/login');
        }, 2000);

      } else {
        setError(
          data.mensaje ||
          'No se pudo restablecer la contraseña.'
        );
      }

    } catch (error) {
      console.error(
        'Error al restablecer contraseña:',
        error
      );

      setError(
        'Error al conectar con el servidor.'
      );

    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        <h4>Restablecer contraseña</h4>

        <p>
          Ingresa tu nueva contraseña.
        </p>

        <form onSubmit={handleSubmit}>

          <label>
            Nueva contraseña

            <input
              type="password"
              placeholder="Nueva contraseña"
              value={contrasena}
              onChange={(e) =>
                setContrasena(e.target.value)
              }
              required
            />
          </label>

          <label>
            Confirmar contraseña

            <input
              type="password"
              placeholder="Confirma tu contraseña"
              value={confirmarContrasena}
              onChange={(e) =>
                setConfirmarContrasena(e.target.value)
              }
              required
            />
          </label>

          <button
            type="submit"
            className="continue-btn active"
            disabled={guardando}
          >
            {guardando
              ? 'Guardando...'
              : 'Cambiar contraseña'}
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

      </div>
    </div>
  );
};

export default RestablecerContrasena;
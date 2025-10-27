import React, { useState } from 'react';
import './ResenaForm.css';

const ResenaForm = ({ idProducto, onResenaCreada, puedeResenar, yaReseno, haComprado }) => {
  const [resenaTexto, setResenaTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito(false);

    if (resenaTexto.trim().length < 10) {
      setError('La reseña debe tener al menos 10 caracteres');
      return;
    }

    setEnviando(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Debes iniciar sesión para escribir una reseña');
        setEnviando(false);
        return;
      }

      const response = await fetch('http://localhost:3000/api/resenas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resena: resenaTexto,
          id_producto: idProducto
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar la reseña');
      }

      setExito(true);
      setResenaTexto('');
      
      //notificar al componente padre
      if (onResenaCreada) {
        onResenaCreada();
      }

      //ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setExito(false);
      }, 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  //si el usuario no ha comprado el producto
  if (!haComprado) {
    return (
      <div className="resena-form-container">
        <div className="resena-info-message">
          <span className="info-icon">ℹ️</span>
          <p>Debes comprar este producto antes de poder escribir una reseña.</p>
        </div>
      </div>
    );
  }

  //en caso que el usuario ya escribió una reseña
  if (yaReseno) {
    return (
      <div className="resena-form-container">
        <div className="resena-info-message success">
          <span className="info-icon">✅</span>
          <p>Ya has escrito una reseña para este producto. ¡Gracias por tu opinión!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resena-form-container">
      <h3>Agregar Reseña</h3>
      
      {exito && (
        <div className="resena-success-message">
          <span className="success-icon">✅</span>
          <p>¡Reseña publicada exitosamente!</p>
        </div>
      )}

      {error && (
        <div className="resena-error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="resena-form">
        <div className="form-group">
          <label htmlFor="resena">Tu reseña:</label>
          <textarea
            id="resena"
            value={resenaTexto}
            onChange={(e) => setResenaTexto(e.target.value)}
            placeholder="Comparte tu experiencia con este producto..."
            rows="5"
            maxLength="500"
            required
            disabled={enviando}
          />
          <span className="char-count">
            {resenaTexto.length}/500 caracteres
          </span>
        </div>

        <button 
          type="submit" 
          className="submit-resena-btn"
          disabled={enviando || resenaTexto.trim().length < 10}
        >
          {enviando ? 'Enviando...' : 'Publicar Reseña'}
        </button>
      </form>
    </div>
  );
};

export default ResenaForm;

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import './Favoritos.css';

const Favoritos = () => {
  const { state, dispatch } = useApp();
  const { favoritos } = state;

  const eliminarDeFavoritos = (id) => {
    dispatch({ type: 'REMOVE_FROM_FAVORITOS', payload: id });
  };

  const agregarAlCarrito = (producto) => {
    // Asegurar que el precio sea string
    const productoConPrecioString = {
      ...producto,
      price: typeof producto.price === 'number' ? producto.price.toString() : producto.price
    };
    dispatch({ type: 'ADD_TO_CART', payload: productoConPrecioString });
    alert(`¡${producto.name} agregado al carrito!`);
  };

  return (
    <div className="favoritos-page">
      <div className="favoritos-container">
        <h4>Mis Favoritos</h4>

        {(!favoritos || favoritos.length === 0) ? (
          <p className="no-favoritos">No tienes productos en favoritos aún.</p>
        ) : (
          <div className="favoritos-list">
            {favoritos.map((producto) => (
              <div key={producto.id} className="favorito-item">
                <img
                  src={producto.image || producto.imagen || "/placeholder.jpg"}
                  alt={producto.name || producto.nombre}
                  className="favorito-imagen"
                  onError={(e) => {
                    e.target.src = '/placeholder.jpg';
                    e.target.alt = 'Imagen no disponible';
                  }}
                />
                <div className="favorito-info">
                  <h5>{producto.name || producto.nombre}</h5>
                  <p>
                    ${parseFloat((producto.price || producto.precio).toString().replace(/,/g, '')).toFixed(2)}
                  </p>
                </div>
                <div className="favorito-actions">
                  <button
                    className="btn-eliminar"
                    onClick={() => eliminarDeFavoritos(producto.id)}
                  >
                    ❌ Eliminar
                  </button>
                  <button
                    className="btn-agregar"
                    onClick={() => agregarAlCarrito(producto)}
                  >
                    🛒 Agregar al carrito
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favoritos;

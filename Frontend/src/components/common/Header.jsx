// src/components/common/Header.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './Header.css';

const Header = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const cartItemCount = state.cart.reduce((total, item) => total + item.quantity, 0);

  const [usuario, setUsuario] = useState(null);

useEffect(() => {
  const checkUsuario = () => {
    const data = localStorage.getItem('usuario');
    if (data) {
      setUsuario(JSON.parse(data));
    } else {
      setUsuario(null);
    }
  };

  // Verificar inmediatamente al montar
  checkUsuario();

  // Escuchar cambios en el localStorage
  window.addEventListener('storage', checkUsuario);
  window.addEventListener('usuarioChange', checkUsuario); // evento personalizado

  // Limpiar al desmontar
  return () => {
    window.removeEventListener('storage', checkUsuario);
    window.removeEventListener('usuarioChange', checkUsuario);
  };
}, []);


  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token'); // ✅ Eliminar token también
    setUsuario(null);
    // Disparar evento personalizado para notificar al contexto
    window.dispatchEvent(new Event('usuarioChange'));
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <img src="/src/assets/tecno_click.png" alt="TecnoClick" />
        </Link>
        
        <nav className="nav">
          <Link to="/products">Productos</Link>

          {usuario ? (
            <button 
              onClick={handleLogout} 
              className="logout-btn"
            >
              Cerrar sesión
            </button>
          ) : (
            <Link to="/login">Iniciar sesión</Link>
          )}
        </nav>

        <div className="header-actions">
          <Link to="/favoritos" className="profile-link">Favoritos</Link>
          <Link to="/perfil" className="profile-link">👤 Perfil</Link>
          <Link to="/cart" className="cart-link">🛒 Carrito ({cartItemCount})</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;

// src/components/common/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './Header.css';

const Header = () => {
  const { state } = useApp();
  const cartItemCount = state.cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <img src="/src/assets/tecno_click.png" alt="TecnoClick" />
        </Link>
        
        <nav className="nav">
          <Link to="/">Inicio</Link>
          <Link to="/products">Productos</Link>
        </nav>

        <div className="header-actions">

          <Link to="/favoritos" className="profile-link">
            Favoritos
          </Link>
          
          <Link to="/perfil" className="profile-link">
            👤 Perfil
          </Link>

          <Link to="/cart" className="cart-link">
            🛒 Carrito ({cartItemCount})
          </Link>

        </div>
      </div>
    </header>
  );
};

export default Header;
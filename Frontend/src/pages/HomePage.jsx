// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext'; // ← Agregar esta importación
import './HomePage.css';

const HomePage = () => {
  const { dispatch } = useApp(); // ← Ahora funciona

  const featuredProducts = [
    {
      id: 1,
      name: "Laptop-Gaming",
      price: "29,680.00",
      originalPrice: "36,250.00",
      currency: "MXN"
    },
    {
      id: 2,
      name: "iPhone 15 Pro Max",
      price: "14,299.00", 
      originalPrice: "16,859.00",
      currency: "MXN"
    },
    {
      id: 3,
      name: "MacBook Pro M3 Max",
      price: "15,299.00",
      originalPrice: "18,999.00",
      currency: "MXN"
    },
    {
      id: 4,
      name: "Apple Watch Series 8",
      price: "5,299.00",
      originalPrice: "6,499.00",
      currency: "MXN"
    }
  ];

  const handleAddToCart = (product) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: product
    });
    alert(`¡${product.name} agregado al carrito!`);
  };

  const handleAddToFavoritos = (product) => {
    dispatch({
      type: 'ADD_TO_FAVORITOS',
      payload: product
    });
    alert(`¡${product.name} agregado a favoritos! 💙`);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Las mejores tecnologías para tu día a día</h1>
          <p>Descubre nuestros productos de última generación con los mejores precios y garantía.</p>
          <div className="hero-buttons">
            <Link to="/products" className="btn-primary">Ver Productos</Link>
            <button className="btn-secondary">Ofertas especiales</button>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <span className="stat-number">65.1</span>
            <span className="stat-label">x 43.4</span>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="products-section">
        <div className="section-header">
          <h2>Nuestros Productos</h2>
          <p>Encuentra lo último en tecnología para tu hogar, trabajo o entretenimiento.</p>
        </div>

        <div className="categories-nav">
          <span className="categories-label">Nota las categorías</span>
          <div className="filter-tabs">
            <button className="filter-tab active">Destacados</button>
            <button className="filter-tab">Más Vendidos</button>
            <button className="filter-tab">Nuevos</button>
          </div>
          
        </div>

        <div className="featured-products-grid">
          {featuredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <div className="product-pricing">
                  <span className="current-price">{product.price} {product.currency}</span>
                  <span className="original-price">{product.originalPrice} {product.currency}</span>
                </div>
                <button 
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product)}
                >
                  Añadir al Carrito
                </button>

                <button
                  className="add-to-favorites-btn"
                  onClick={() => handleAddToFavoritos(product)}
                >
                  Favoritos
                </button>

              </div>
            </div>
          ))}
        </div>
      </section> {/* ← Este cierra la section de productos */}

      {/* Footer Section */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Namedly</h4>
            <p>Descripte the about what your company does.</p>
          </div>
          
          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li>Core features</li>
              <li>Pro experience</li>
              <li>Integrations</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Learn more</h4>
            <ul>
              <li>Blog</li>
              <li>Case studies</li>
              <li>Customer stories</li>
              <li>Best practices</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li>Contact</li>
              <li>Support</li>
              <li>Legal</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
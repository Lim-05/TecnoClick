// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './HomePage.css';

const HomePage = () => {
  const { dispatch } = useApp();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationProduct, setNotificationProduct] = useState(null);
  const [showFavNotification, setShowFavNotification] = useState(false);
  const [favNotificationProduct, setFavNotificationProduct] = useState(null);

  // Función para cargar productos desde la base de datos
  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoading(true);
        console.log(' Cargando productos destacados...');
        
        const response = await fetch('http://localhost:3000/api/productos/products');
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const productsData = await response.json();
        console.log(' Productos cargados:', productsData);

        // Tomar los primeros 4 productos como destacados
        const featured = productsData.slice(0, 4).map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: (parseFloat(product.price.replace(/,/g, '')) * 1.2).toLocaleString('es-MX', { 
            minimumFractionDigits: 2 
          }),
          currency: product.currency || "MXN",
          image: product.image,
          description: product.description,
          category: product.category,
          brand: product.brand,
          inStock: product.inStock !== false,
          stock: product.stock || 10
        }));

        setFeaturedProducts(featured);
        
      } catch (err) {
        console.error('❌ Error cargando productos:', err);
        setError('Error al cargar los productos');
        
       
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  const handleAddToCart = (product) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: product
    });
    
    // Mostrar notificación
    setNotificationProduct(product);
    setShowNotification(true);
    
    // Ocultar notificación después de 3 segundos
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handleAddToFavoritos = (product) => {
    dispatch({
      type: 'ADD_TO_FAVORITOS',
      payload: product
    });
    
    // Mostrar notificación
    setFavNotificationProduct(product);
    setShowFavNotification(true);
    
    // Ocultar notificación después de 3 segundos
    setTimeout(() => {
      setShowFavNotification(false);
    }, 3000);
  };

  // Función para formatear precio
  const formatPrice = (price) => {
    if (typeof price === 'string') return price;
    return price.toLocaleString('es-MX', { minimumFractionDigits: 2 });
  };

  if (loading) {
    return (
      <div className="home-page">
        <section className="hero-section">
          <div className="hero-content">
            <h1>Las mejores tecnologías para tu día a día</h1>
            <p>Descubre nuestros productos de última generación con los mejores precios y garantía.</p>
            <div className="hero-buttons">
              <Link to="/products" className="btn-primary">Ver Productos</Link>
              <button className="btn-secondary">Ofertas especiales</button>
            </div>
          </div>
        </section>

        <section className="products-section">
          <div className="section-header">
            <h2>Nuestros Productos</h2>
            <p>Cargando productos destacados...</p>
          </div>
          
          <div className="featured-products-grid">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="product-card loading">
                <div className="product-info">
                  <div className="product-name-skeleton"></div>
                  <div className="product-pricing-skeleton"></div>
                  <div className="button-skeleton"></div>
                  <div className="button-skeleton"></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Notificación de producto agregado al carrito */}
      {showNotification && notificationProduct && (
        <div className="cart-notification">
          <div className="notification-content">
            <span className="notification-icon">✅</span>
            <div className="notification-text">
              <strong>¡Agregado al carrito!</strong>
              <p>{notificationProduct.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Notificación de favoritos */}
      {showFavNotification && favNotificationProduct && (
        <div className="cart-notification fav-notification added">
          <div className="notification-content">
            <span className="notification-icon">❤️</span>
            <div className="notification-text">
              <strong>¡Agregado a favoritos!</strong>
              <p>{favNotificationProduct.name}</p>
            </div>
          </div>
        </div>
      )}
      
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
            <span className="stat-number">{featuredProducts.length}</span>
            <span className="stat-label">Productos destacados</span>
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
          <span className="categories-label">Productos en stock</span>
          <div className="filter-tabs">
            <button className="filter-tab active">Destacados</button>
            <button className="filter-tab">Más Vendidos</button>
            <button className="filter-tab">Nuevos</button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="featured-products-grid">
          {featuredProducts.map(product => (
            <div key={product.id} className="product-card">
              {product.image && (
                <div className="product-image">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="product-info">
                {product.brand && (
                  <span className="product-brand">{product.brand}</span>
                )}
                
                <h3 className="product-name">{product.name}</h3>
                
                {product.description && (
                  <p className="product-short-description">
                    {product.description.length > 80 
                      ? `${product.description.substring(0, 80)}...` 
                      : product.description
                    }
                  </p>
                )}

                

                <div className="product-actions">
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                  >
                    {product.inStock ? '🛒 ' : '❌ Agotado'}
                  </button>

                  <button
                    className="add-to-favorites-btn"
                    onClick={() => handleAddToFavoritos(product)}
                  >
                     Favoritos
                  </button>
                </div>

                {!product.inStock && (
                  <div className="out-of-stock-badge">
                    Agotado
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>TecnoClick</h4>
            <p>Tu tienda de tecnología de confianza con los mejores precios y garantía.</p>
          </div>
          
          <div className="footer-section">
            <h4>Categorías</h4>
            <ul>
              <li>Laptops</li>
              <li>Smartphones</li>
              <li>Accesorios</li>
              <li>Audio</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Información</h4>
            <ul>
              <li>Sobre nosotros</li>
              <li>Envíos y entregas</li>
              <li>Garantías</li>
              <li>Preguntas frecuentes</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contacto</h4>
            <ul>
              <li>📞 555-123-4567</li>
              <li>✉️ info@tecnoclick.com</li>
              <li>🕒 Lun-Vie: 9am-6pm</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
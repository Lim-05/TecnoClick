import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useApp();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Datos de ejemplo del producto (luego vendrán de la BD)
  const product = {
    id: 1,
    name: "Laptop Gaming ASUS ROG Strix",
    price: "29,680.00",
    originalPrice: "36,250.00",
    currency: "MXN",
    category: "laptops",
    brand: "ASUS",
    description: "Laptop para gaming de alto rendimiento diseñada para ofrecer la mejor experiencia de juego. Equipada con los últimos componentes para garantizar un rendimiento excepcional en los juegos más demandantes.",
    fullDescription: `La Laptop Gaming ASUS ROG Strix es la elección perfecta para gamers exigentes que buscan máximo rendimiento. Con su potente GPU NVIDIA GeForce RTX 4060 y procesador Intel Core i9 de 13ª generación, podrás disfrutar de tus juegos favoritos en calidad 4K con tasas de cuadros ultra altas.

Características principales:
• Procesador: Intel Core i9-13900H
• GPU: NVIDIA GeForce RTX 4060 8GB GDDR6
• RAM: 16GB DDR5 4800MHz
• Almacenamiento: 1TB SSD NVMe PCIe 4.0
• Pantalla: 15.6" IPS 144Hz FHD
• Sistema operativo: Windows 11 Home
• Batería: 90Wh con carga rápida`,
    
    images: [
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop"
    ],
    
    specs: [
      { name: "Procesador", value: "Intel Core i9-13900H" },
      { name: "GPU", value: "NVIDIA GeForce RTX 4060 8GB" },
      { name: "RAM", value: "16GB DDR5 4800MHz" },
      { name: "Almacenamiento", value: "1TB SSD NVMe PCIe 4.0" },
      { name: "Pantalla", value: '15.6" IPS 144Hz FHD' },
      { name: "Sistema Operativo", value: "Windows 11 Home" },
      { name: "Batería", value: "90Wh" },
      { name: "Conectividad", value: "WiFi 6E, Bluetooth 5.2" }
    ],
    
    inStock: true,
    stock: 15,
    
    // Reseñas y calificaciones
    rating: 4.5,
    reviewCount: 24,
    reviews: [
      {
        id: 1,
        user: "Carlos Rodríguez",
        rating: 5,
        date: "2024-01-15",
        comment: "Excelente laptop, corre todos los juegos en ultra sin problemas. La pantalla es increíble y el teclado muy cómodo para gaming.",
        verified: true
      },
      {
        id: 2,
        user: "Ana Martínez",
        rating: 4,
        date: "2024-01-10",
        comment: "Muy buena relación calidad-precio. El único detalle es que la batería no dura mucho cuando se usa para gaming, pero es normal.",
        verified: true
      },
      {
        id: 3,
        user: "Miguel Sánchez",
        rating: 5,
        date: "2024-01-08",
        comment: "Llegó antes de lo esperado y superó mis expectativas. El rendimiento es espectacular.",
        verified: false
      }
    ]
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      dispatch({
        type: 'ADD_TO_CART',
        payload: product
      });
    }
    alert(`¡${quantity} ${product.name} agregado(s) al carrito!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span 
        key={index} 
        className={`star ${index < Math.floor(rating) ? 'filled' : ''} ${index === Math.floor(rating) && rating % 1 !== 0 ? 'half-filled' : ''}`}
      >
        {index < Math.floor(rating) ? '★' : '☆'}
      </span>
    ));
  };

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Producto no encontrado</h2>
        <button onClick={() => navigate('/products')} className="back-btn">
          Volver a Productos
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail">
      {/* Navegación */}
      <nav className="breadcrumb">
        <button onClick={() => navigate('/')}>Inicio</button>
        <span> / </span>
        <button onClick={() => navigate('/products')}>Productos</button>
        <span> / </span>
        <span>{product.name}</span>
      </nav>

      <div className="product-detail-content">
        {/* Galería de imágenes */}
        <div className="product-gallery">
          <div className="main-image">
            <img src={product.images[selectedImage]} alt={product.name} />
          </div>
          <div className="image-thumbnails">
            {product.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} ${index + 1}`}
                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
              />
            ))}
          </div>
        </div>

        {/* Información del producto */}
        <div className="product-info">
          <div className="product-header">
            <span className="product-brand">{product.brand}</span>
            <h1 className="product-title">{product.name}</h1>
            
            {/* Rating */}
            <div className="product-rating">
              <div className="stars">
                {renderStars(product.rating)}
                <span className="rating-value">{product.rating}</span>
              </div>
              <span className="review-count">({product.reviewCount} reseñas)</span>
              <span className="stock-status {product.inStock ? 'in-stock' : 'out-of-stock'}">
                {product.inStock ? `✓ En stock (${product.stock} disponibles)` : '✗ Agotado'}
              </span>
            </div>

            {/* Precio */}
            <div className="product-pricing">
              <span className="current-price">{product.price} {product.currency}</span>
              {product.originalPrice && (
                <span className="original-price">{product.originalPrice} {product.currency}</span>
              )}
              {product.originalPrice && (
                <span className="discount">
                  {Math.round((1 - parseFloat(product.price.replace(/,/g, '')) / parseFloat(product.originalPrice.replace(/,/g, ''))) * 100)}% OFF
                </span>
              )}
            </div>

            {/* Descripción corta */}
            <p className="product-short-description">{product.description}</p>
          </div>

          {/* Selector de cantidad y acciones */}
          <div className="product-actions">
            <div className="quantity-selector">
              <label>Cantidad:</label>
              <div className="quantity-controls">
                <button onClick={decreaseQuantity} disabled={quantity <= 1}>-</button>
                <span>{quantity}</span>
                <button onClick={increaseQuantity} disabled={quantity >= product.stock}>+</button>
              </div>
              <span className="stock-info">{product.stock} disponibles</span>
            </div>

            <div className="action-buttons">
              <button 
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                🛒 Agregar al Carrito
              </button>
              <button 
                className="buy-now-btn"
                onClick={handleBuyNow}
                disabled={!product.inStock}
              >
                Comprar Ahora
              </button>
            </div>
          </div>

          {/* Especificaciones rápidas */}
          <div className="quick-specs">
            <h3>Especificaciones principales</h3>
            <div className="specs-grid">
              {product.specs.slice(0, 4).map((spec, index) => (
                <div key={index} className="spec-item">
                  <span className="spec-name">{spec.name}:</span>
                  <span className="spec-value">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de detalles y reseñas */}
      <div className="product-tabs">
        <div className="tab-headers">
          <button 
            className={`tab-header ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Descripción
          </button>
          <button 
            className={`tab-header ${activeTab === 'specs' ? 'active' : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            Especificaciones
          </button>
          <button 
            className={`tab-header ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reseñas ({product.reviewCount})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'description' && (
            <div className="description-content">
              <h3>Descripción completa</h3>
              <p>{product.fullDescription}</p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="specs-content">
              <h3>Especificaciones técnicas</h3>
              <div className="specs-table">
                {product.specs.map((spec, index) => (
                  <div key={index} className="spec-row">
                    <span className="spec-label">{spec.name}</span>
                    <span className="spec-data">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-content">
              <div className="reviews-summary">
                <div className="average-rating">
                  <div className="rating-number">{product.rating}</div>
                  <div className="rating-stars">{renderStars(product.rating)}</div>
                  <div className="rating-text">{product.reviewCount} reseñas</div>
                </div>
              </div>

              <div className="reviews-list">
                {product.reviews.map(review => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <span className="reviewer-name">{review.user}</span>
                        {review.verified && <span className="verified-badge">✓ Verificado</span>}
                      </div>
                      <div className="review-meta">
                        <div className="review-stars">{renderStars(review.rating)}</div>
                        <span className="review-date">{review.date}</span>
                      </div>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
import React, { useState, useEffect } from 'react';
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
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar producto desde la API
  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`🔄 Cargando producto con ID: ${id}`);
        const response = await fetch(`http://localhost:3000/api/productos/products/${id}`);
        
        if (!response.ok) {
          throw new Error('Producto no encontrado');
        }
        
        const data = await response.json();
        console.log('✅ Producto cargado:', data);
        
        // Agregar imágenes de ejemplo (puedes usar múltiples o una sola)
        const productWithImages = {
          ...data,
          images: [
            data.image,
            data.image,
            data.image,
            data.image
          ],
          fullDescription: data.description,
          // Convertir specs (array de strings) a formato de objeto
          specsDetailed: data.specs.map((spec, index) => ({
            name: `Característica ${index + 1}`,
            value: spec
          })),
          // Reseñas de ejemplo (temporal)
          reviews: [
            {
              id: 1,
              user: "Cliente Verificado",
              rating: 5,
              date: "2024-01-15",
              comment: "Excelente producto, muy recomendado.",
              verified: true
            },
            {
              id: 2,
              user: "Comprador",
              rating: 4,
              date: "2024-01-10",
              comment: "Buena relación calidad-precio.",
              verified: true
            }
          ]
        };
        
        setProduct(productWithImages);
      } catch (error) {
        console.error('❌ Error al cargar producto:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

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

  // Estado de carga
  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="loading-spinner"></div>
        <p>Cargando producto...</p>
      </div>
    );
  }

  // Estado de error
  if (error || !product) {
    return (
      <div className="product-not-found">
        <h2>{error || 'Producto no encontrado'}</h2>
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
                  <span className="spec-name">Característica {index + 1}:</span>
                  <span className="spec-value">{spec}</span>
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
                {product.specsDetailed && product.specsDetailed.map((spec, index) => (
                  <div key={index} className="spec-row">
                    <span className="spec-label">{spec.name}</span>
                    <span className="spec-data">{spec.value}</span>
                  </div>
                ))}
                {!product.specsDetailed && product.specs.map((spec, index) => (
                  <div key={index} className="spec-row">
                    <span className="spec-label">Característica {index + 1}</span>
                    <span className="spec-data">{spec}</span>
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
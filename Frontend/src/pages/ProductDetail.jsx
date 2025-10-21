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
  const [showNotification, setShowNotification] = useState(false);

  // Función para limpiar descripciones duplicadas
  const cleanDescription = (description) => {
    if (!description) return 'Descripción no disponible.';
    
    // Eliminar duplicados dividiendo por puntos y filtrando únicos
    const sentences = description.split('.').map(s => s.trim()).filter(s => s);
    const uniqueSentences = [...new Set(sentences)];
    
    return uniqueSentences.join('. ') + (uniqueSentences.length > 0 ? '.' : '');
  };

  // Función para parsear precios
  const parsePrice = (priceString) => {
    if (!priceString) return 0;
    return parseFloat(priceString.toString().replace(/[^\d.-]/g, ''));
  };

  // Cargar producto desde la API
  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(` Cargando producto con ID: ${id}`);
        const response = await fetch(`http://localhost:3000/api/productos/products/${id}`);
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(' Producto cargado:', data);
        
        // Limpiar y normalizar datos del producto
        const cleanedProduct = {
          ...data,
          // Asegurar que la imagen sea válida
          image: data.image || '/images/placeholder.jpg',
          // Limpiar descripción duplicada
          description: cleanDescription(data.description),
          // Crear array de imágenes
          images: [
            data.image || '/images/placeholder.jpg',
            '/images/placeholder-2.jpg',
            '/images/placeholder-3.jpg',
            '/images/placeholder-4.jpg'
          ],
          // Descripción completa
          fullDescription: cleanDescription(data.description),
          // Especificaciones detalladas
          specsDetailed: Array.isArray(data.specs) ? data.specs.map((spec, index) => ({
            name: `Especificación ${index + 1}`,
            value: typeof spec === 'string' ? spec : JSON.stringify(spec)
          })) : [],
          // Reseñas (si vienen de la BD, si no, array vacío)
          reviews: data.reviews || [],
          // Asegurar que el stock esté definido
          stock: data.stock || (data.inStock ? 10 : 0),
          // Asegurar que la moneda esté definida
          currency: data.currency || 'MXN',
          // Asegurar que el rating esté definido
          rating: data.rating || 0,
          // Asegurar que el reviewCount esté definido
          reviewCount: data.reviewCount || 0
        };
        
        setProduct(cleanedProduct);
      } catch (error) {
        console.error(' Error al cargar producto:', error);
        setError('Error al cargar el producto. Verifica que el servidor esté funcionando.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    // Crear objeto con los datos necesarios para el carrito
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency || 'MXN',
      image: product.image || product.images[0],
      stock: product.stock || 10,
      inStock: product.inStock
    };
    
    // Agregar la cantidad especificada
    dispatch({
      type: 'ADD_TO_CART',
      payload: { ...cartItem, quantity }
    });
    
    console.log(`✅ ${quantity} ${product.name} agregado(s) al carrito`);
    
    // Mostrar notificación
    setShowNotification(true);
    
    // Ocultar notificación después de 3 segundos
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const increaseQuantity = () => {
    if (product && quantity < (product.stock || 10)) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const renderStars = (rating) => {
    const numericRating = typeof rating === 'number' ? rating : 0;
    
    return Array.from({ length: 5 }, (_, index) => (
      <span 
        key={index} 
        className={`star ${index < Math.floor(numericRating) ? 'filled' : ''}`}
      >
        {index < Math.floor(numericRating) ? '★' : '☆'}
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
        <p>El producto que buscas no está disponible.</p>
        <button onClick={() => navigate('/products')} className="back-btn">
          Volver a Productos
        </button>
      </div>
    );
  }

  const discountPercentage = product.originalPrice && product.originalPrice !== product.price 
    ? Math.round((1 - parsePrice(product.price) / parsePrice(product.originalPrice)) * 100)
    : 0;

  return (
    <div className="product-detail">
      {/* Notificación de producto agregado */}
      {showNotification && (
        <div className="cart-notification">
          <div className="notification-content">
            <span className="notification-icon">✅</span>
            <div className="notification-text">
              <strong>¡Agregado al carrito!</strong>
              <p>{quantity} {product.name}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Navegación */}
      <nav className="breadcrumb">
        <button onClick={() => navigate('/')}>Inicio</button>
        <span> / </span>
        <button onClick={() => navigate('/products')}>Productos</button>
        <span> / </span>
        <span>{product.category || 'Categoría'}</span>
        <span> / </span>
        <span className="current-page">{product.name}</span>
      </nav>

      <div className="product-detail-content">
        {/* Galería de imágenes */}
        <div className="product-gallery">
          <div className="main-image">
            <img 
              src={product.images[selectedImage]} 
              alt={product.name}
              onError={(e) => {
                e.target.src = '/images/placeholder.jpg';
                e.target.alt = 'Imagen no disponible';
              }}
            />
          </div>
          <div className="image-thumbnails">
            {product.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} vista ${index + 1}`}
                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
                onError={(e) => {
                  e.target.src = '/images/placeholder.jpg';
                  e.target.alt = 'Miniatura no disponible';
                }}
              />
            ))}
          </div>
        </div>

        {/* Información del producto */}
        <div className="product-info">
          <div className="product-header">
            {product.brand && (
              <span className="product-brand">{product.brand}</span>
            )}
            {product.sku && (
              <span className="product-sku">SKU: {product.sku}</span>
            )}
            <h1 className="product-title">{product.name}</h1>
            
            {/* Rating */}
            <div className="product-rating">
              <div className="stars">
                {renderStars(product.rating)}
                <span className="rating-value">{product.rating}/5</span>
              </div>
              <span className="review-count">({product.reviewCount} reseñas)</span>
              <span className={`stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                {product.inStock ? `✓ En stock (${product.stock} disponibles)` : '✗ Agotado'}
              </span>
            </div>

            {/* Precio */}
            <div className="product-pricing">
              <span className="current-price">{product.price} {product.currency}</span>
              {product.originalPrice && product.originalPrice !== product.price && (
                <>
                  <span className="original-price">{product.originalPrice} {product.currency}</span>
                  <span className="discount">{discountPercentage}% OFF</span>
                </>
              )}
            </div>

            {/* Descripción corta */}
            <p className="product-short-description">
              {product.description}
            </p>
          </div>

          {/* Selector de cantidad y acciones */}
          <div className="product-actions">
            <div className="quantity-selector">
              <label>Cantidad:</label>
              <div className="quantity-controls">
                <button onClick={decreaseQuantity} disabled={quantity <= 1}>-</button>
                <span>{quantity}</span>
                <button onClick={increaseQuantity} disabled={quantity >= (product.stock || 10)}>+</button>
              </div>
              <span className="stock-info">{product.stock || 10} disponibles</span>
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
          {product.specs && product.specs.length > 0 && (
            <div className="quick-specs">
              <h3>Características principales</h3>
              <div className="specs-grid">
                {product.specs.slice(0, 4).map((spec, index) => (
                  <div key={index} className="spec-item">
                    <span className="spec-name">Característica {index + 1}:</span>
                    <span className="spec-value">
                      {typeof spec === 'string' && spec.length > 30 
                        ? `${spec.substring(0, 30)}...` 
                        : spec
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                {product.specsDetailed && product.specsDetailed.length > 0 ? (
                  product.specsDetailed.map((spec, index) => (
                    <div key={index} className="spec-row">
                      <span className="spec-label">{spec.name}</span>
                      <span className="spec-data">{spec.value}</span>
                    </div>
                  ))
                ) : product.specs && product.specs.length > 0 ? (
                  product.specs.map((spec, index) => (
                    <div key={index} className="spec-row">
                      <span className="spec-label">Característica {index + 1}</span>
                      <span className="spec-data">{spec}</span>
                    </div>
                  ))
                ) : (
                  <p>No hay especificaciones disponibles para este producto.</p>
                )}
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
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map(review => (
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
                  ))
                ) : (
                  <p>No hay reseñas para este producto todavía.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
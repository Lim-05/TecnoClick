import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import './ProductsPage.css';

const ProductsPage = () => {
  const { dispatch, state } = useApp();
  const { favoritos } = state;
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nombre');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([
    { id: 'todos', name: 'Todos los Productos', count: 0 }
  ]);

  // Cargar productos desde la API
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        console.log(' Iniciando carga de productos desde la API...');
        const response = await fetch('http://localhost:3000/api/productos/products');
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(' Productos cargados:', data);
        
        // Validar y limpiar datos
        const cleanedProducts = data.map(product => ({
          ...product,
          // Asegurar que las URLs de imágenes sean válidas
          image: product.image || '/images/placeholder.jpg',
          // Limpiar descripciones duplicadas
          description: cleanDescription(product.description),
          // Asegurar que las categorías sean consistentes
          category: product.category?.toLowerCase().trim() || 'otros'
        }));
        
        setProducts(cleanedProducts);
        setFilteredProducts(cleanedProducts);
        
        // Actualizar categorías dinámicamente
        const categoryCounts = cleanedProducts.reduce((acc, product) => {
          acc[product.category] = (acc[product.category] || 0) + 1;
          return acc;
        }, {});

        const categoriesData = [
          { 
            id: 'todos', 
            name: 'Todos los Productos', 
            count: cleanedProducts.length 
          },
          ...Object.entries(categoryCounts).map(([category, count]) => ({
            id: category,
            name: formatCategoryName(category),
            count: count
          }))
        ];
        
        setCategories(categoriesData);
        console.log(' Categorías disponibles:', categoriesData);
        
      } catch (error) {
        console.error(' Error al cargar productos:', error);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Función para manejar favoritos
  const handleAddToFavoritos = (product) => {
    // Verificar si el producto ya está en favoritos
    const isAlreadyFavorite = favoritos.some(fav => fav.id === product.id);
    
    if (isAlreadyFavorite) {
      dispatch({ type: 'REMOVE_FROM_FAVORITOS', payload: product.id });
      console.log(` ${product.name} removido de favoritos`);
    } else {
      dispatch({ type: 'ADD_TO_FAVORITOS', payload: product });
      console.log(` ${product.name} agregado a favoritos`);
    }
  };

  // Verificar si un producto está en favoritos
  const isProductInFavorites = (productId) => {
    return favoritos.some(fav => fav.id === productId);
  };

  // Función para limpiar descripciones duplicadas
  const cleanDescription = (description) => {
    if (!description) return '';
    
    const sentences = description.split('.').map(s => s.trim()).filter(s => s);
    const uniqueSentences = [...new Set(sentences)];
    
    return uniqueSentences.join('. ') + (uniqueSentences.length > 0 ? '.' : '');
  };

  // Función para formatear nombres de categoría
  const formatCategoryName = (category) => {
    const nameMap = {
      'mouse': 'Mouse',
      'monitores': 'Monitores',
      'almacenamiento-externo': 'Almacenamiento Externo',
      'audio': 'Audio',
      'impresoras/escáneres': 'Impresoras/Escáneres'
    };
    
    return nameMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Filtros y búsqueda optimizados
  useEffect(() => {
    let result = [...products];

    if (selectedCategory !== 'todos') {
      result = result.filter(product => 
        product.category === selectedCategory
      );
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(product => 
        product.name?.toLowerCase().includes(term) ||
        product.brand?.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term) ||
        product.sku?.toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'precio-asc':
          return parsePrice(a.price) - parsePrice(b.price);
        case 'precio-desc':
          return parsePrice(b.price) - parsePrice(a.price);
        case 'nombre':
        default:
          return (a.name || '').localeCompare(b.name || '');
      }
    });

    setFilteredProducts(result);
  }, [products, selectedCategory, searchTerm, sortBy]);

  // Función auxiliar para parsear precios
  const parsePrice = (priceString) => {
    if (!priceString) return 0;
    return parseFloat(priceString.toString().replace(/[^\d.-]/g, ''));
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    dispatch({
      type: 'ADD_TO_CART',
      payload: product
    });
    
    console.log(` ${product.name} agregado al carrito`);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Función para renderizar estrellas
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

  if (loading) {
    return (
      <div className="products-loading">
        <div className="loading-spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Nuestros Productos</h1>
        <p>Descubre la mejor tecnología para tus necesidades</p>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="products-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar productos, marcas, SKU..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="sort-filter">
          <label>Ordenar por:</label>
          <select value={sortBy} onChange={handleSortChange}>
            <option value="nombre">Nombre A-Z</option>
            <option value="precio-asc">Precio: Menor a Mayor</option>
            <option value="precio-desc">Precio: Mayor a Menor</option>
          </select>
        </div>
      </div>

      <div className="products-layout">
        {/* Sidebar de Categorías */}
        <aside className="categories-sidebar">
          <h3>Categorías</h3>
          <div className="category-list">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.id)}
              >
                <span className="category-name">{category.name}</span>
                <span className="category-count">({category.count})</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Grid de Productos */}
        <main className="products-main">
          <div className="products-info">
            <p>
              Mostrando {filteredProducts.length} de {products.length} productos
              {selectedCategory !== 'todos' && ` en ${categories.find(c => c.id === selectedCategory)?.name}`}
              {searchTerm && ` para "${searchTerm}"`}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <h3>No se encontraron productos</h3>
              <p>Intenta con otros términos de búsqueda o selecciona otra categoría</p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <div key={product.id || product.sku} className="product-card">
                  <Link to={`/product/${product.id}`} className="product-link">
                    <div className="product-image">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = '/images/placeholder.jpg';
                          e.target.alt = 'Imagen no disponible';
                        }}
                      />
                      {!product.inStock && <div className="out-of-stock">Agotado</div>}
                      {product.originalPrice && product.originalPrice !== product.price && (
                        <div className="discount-badge">
                          -{Math.round((1 - parsePrice(product.price) / parsePrice(product.originalPrice)) * 100)}%
                        </div>
                      )}
                    </div>

                    <div className="product-content">
                      {product.brand && (
                        <div className="product-brand">{product.brand}</div>
                      )}
                      {product.sku && (
                        <div className="product-sku">SKU: {product.sku}</div>
                      )}
                      <h3 className="product-name">{product.name}</h3>
                      
                      {/* Rating */}
                      <div className="product-rating-card">
                        <div className="stars">
                          {renderStars(product.rating || 0)}
                          <span className="rating-value">
                            ({product.reviewCount || 0})
                          </span>
                        </div>
                      </div>

                                          
                    </div>
                  </Link>

                  <div className="product-actions">
                    <button 
                      className={`add-to-cart-btn ${!product.inStock ? 'disabled' : ''}`}
                      onClick={(e) => handleAddToCart(product, e)}
                      disabled={!product.inStock}
                    >
                      {!product.inStock ? 'Agotado' : '🛒'}
                    </button>

                     <button
                      className={`add-to-favorites-btn ${isProductInFavorites(product.id) ? 'active' : ''}`}
                       onClick={() => handleAddToFavoritos(product)}
                      >
                      {isProductInFavorites(product.id) ? '★ En Favoritos' : '☆ Añadir a Favoritos'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;
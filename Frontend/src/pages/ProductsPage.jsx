import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom'; // ← Agregar esta importación
import './ProductsPage.css';

const ProductsPage = () => {
  const { dispatch } = useApp();
  
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
        console.log('🔄 Iniciando carga de productos desde la API...');
        const response = await fetch('http://localhost:3000/api/productos/products');
        if (!response.ok) {
          throw new Error('Error al cargar productos');
        }
        const data = await response.json();
        console.log('✅ Productos cargados desde la base de datos:', data);
        console.log(`📊 Total de productos: ${data.length}`);
        setProducts(data);
        setFilteredProducts(data);
        
        // Actualizar categorías dinámicamente
        const uniqueCategories = [...new Set(data.map(p => p.category))];
        const categoriesData = [
          { id: 'todos', name: 'Todos los Productos', count: data.length },
          ...uniqueCategories.map(cat => ({
            id: cat,
            name: cat.charAt(0).toUpperCase() + cat.slice(1),
            count: data.filter(p => p.category === cat).length
          }))
        ];
        setCategories(categoriesData);
        console.log('📁 Categorías disponibles:', categoriesData);
      } catch (error) {
        console.error('❌ Error al cargar productos:', error);
        alert('Error al cargar productos. Verifica que el servidor esté corriendo.');
      } finally {
        setLoading(false);
        console.log('✔️ Carga de productos finalizada');
      }
    };

    loadProducts();
  }, []);

  // Filtros y búsqueda
  useEffect(() => {
    let result = products;

    if (selectedCategory !== 'todos') {
      result = result.filter(product => product.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.brand.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term)
      );
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'precio-asc':
          return parseFloat(a.price.replace(/,/g, '')) - parseFloat(b.price.replace(/,/g, ''));
        case 'precio-desc':
          return parseFloat(b.price.replace(/,/g, '')) - parseFloat(a.price.replace(/,/g, ''));
        case 'nombre':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(result);
  }, [products, selectedCategory, searchTerm, sortBy]);

  const handleAddToCart = (product, e) => {
    e.preventDefault(); // Prevenir navegación del Link
    e.stopPropagation(); // Detener propagación
    dispatch({
      type: 'ADD_TO_CART',
      payload: product
    });
    alert(`¡${product.name} agregado al carrito!`);
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
    return Array.from({ length: 5 }, (_, index) => (
      <span 
        key={index} 
        className={`star ${index < Math.floor(rating) ? 'filled' : ''}`}
      >
        {index < Math.floor(rating) ? '★' : '☆'}
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
            placeholder="Buscar productos..."
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
                <div key={product.id} className="product-card">
                  {/* Enlace al detalle del producto */}
                  <Link to={`/product/${product.id}`} className="product-link">
                    <div className="product-image">
                      <img src={product.image} alt={product.name} />
                      {!product.inStock && <div className="out-of-stock">Agotado</div>}
                      {product.originalPrice && (
                        <div className="discount-badge">
                          -{Math.round((1 - parseFloat(product.price.replace(/,/g, '')) / parseFloat(product.originalPrice.replace(/,/g, ''))) * 100)}%
                        </div>
                      )}
                    </div>

                    <div className="product-content">
                      <div className="product-brand">{product.brand}</div>
                      <h3 className="product-name">{product.name}</h3>
                      
                      {/* Rating en la card */}
                      <div className="product-rating-card">
                        <div className="stars">
                          {renderStars(product.rating)}
                          <span className="rating-value">({product.reviewCount})</span>
                        </div>
                      </div>

                      <p className="product-description">{product.description}</p>

                      <div className="product-specs">
                        {product.specs.map((spec, index) => (
                          <span key={index} className="spec-tag">{spec}</span>
                        ))}
                      </div>

                      <div className="product-pricing">
                        <span className="current-price">{product.price} {product.currency}</span>
                        {product.originalPrice && (
                          <span className="original-price">{product.originalPrice} {product.currency}</span>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Botón fuera del Link para evitar conflictos */}
                  <button 
                    className={`add-to-cart-btn ${!product.inStock ? 'disabled' : ''}`}
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={!product.inStock}
                  >
                    {!product.inStock ? 'Agotado' : '🛒 Añadir al Carrito'}
                  </button>
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
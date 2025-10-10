import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import './ProductsPage.css';

const ProductsPage = () => {
  const { dispatch } = useApp();
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nombre');
  const [loading, setLoading] = useState(true);

  // Datos de productos más completos
  const allProducts = [
    {
      id: 1,
      name: "Laptop Gaming ASUS ROG Strix",
      price: "29,680.00",
      originalPrice: "36,250.00",
      currency: "MXN",
      category: "laptops",
      brand: "ASUS",
      description: "Laptop para gaming de alto rendimiento con RTX 4060, 16GB RAM, 1TB SSD, pantalla 15.6\" 144Hz",
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=300&fit=crop",
      specs: ["RTX 4060", "16GB RAM", "1TB SSD", "15.6\" 144Hz"],
      inStock: true
    },
    {
      id: 2,
      name: "iPhone 15 Pro Max",
      price: "14,299.00",
      originalPrice: "16,859.00",
      currency: "MXN",
      category: "smartphones",
      brand: "Apple",
      description: "Smartphone flagship con cámara triple 48MP, chip A17 Pro, 256GB, Dynamic Island",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop",
      specs: ["Cámara 48MP", "A17 Pro", "256GB", "iOS 17"],
      inStock: true
    },
    {
      id: 3,
      name: "MacBook Pro M3 Max",
      price: "15,299.00",
      originalPrice: "18,999.00",
      currency: "MXN",
      category: "laptops",
      brand: "Apple",
      description: "Laptop profesional con chip M3 Max, 36GB RAM, 1TB SSD, pantalla Liquid Retina XDR",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop",
      specs: ["M3 Max", "36GB RAM", "1TB SSD", "14.2\""],
      inStock: true
    },
    {
      id: 4,
      name: "Apple Watch Series 8",
      price: "5,299.00",
      originalPrice: "6,499.00",
      currency: "MXN",
      category: "wearables",
      brand: "Apple",
      description: "Smartwatch con monitorización avanzada de salud, GPS, resistente al agua",
      image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&h=300&fit=crop",
      specs: ["GPS", "Resistente agua", "Monitoreo salud", "iOS"],
      inStock: true
    },
    {
      id: 5,
      name: "Samsung Galaxy S24 Ultra",
      price: "12,999.00",
      originalPrice: "15,499.00",
      currency: "MXN",
      category: "smartphones",
      brand: "Samsung",
      description: "Smartphone con S-Pen integrado, cámara 200MP, 12GB RAM, 512GB, pantalla Dynamic AMOLED",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
      specs: ["S-Pen", "200MP", "12GB RAM", "512GB"],
      inStock: true
    },
    {
      id: 6,
      name: "iPad Pro 12.9\" M2",
      price: "18,999.00",
      originalPrice: "22,499.00",
      currency: "MXN",
      category: "tablets",
      brand: "Apple",
      description: "Tablet profesional con chip M2, pantalla Liquid Retina XDR, compatible con Apple Pencil",
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop",
      specs: ["Chip M2", "12.9\"", "Apple Pencil", "Liquid Retina"],
      inStock: false
    },
    {
      id: 7,
      name: "Audífonos Sony WH-1000XM5",
      price: "6,499.00",
      originalPrice: "7,999.00",
      currency: "MXN",
      category: "accesorios",
      brand: "Sony",
      description: "Audífonos noise cancelling premium con 30h de batería, sonido HD, control táctil",
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop",
      specs: ["Noise Cancelling", "30h batería", "HD Sound", "Táctil"],
      inStock: true
    },
    {
      id: 8,
      name: "Teclado Mecánico Logitech MX",
      price: "2,199.00",
      originalPrice: "2,799.00",
      currency: "MXN",
      category: "accesorios",
      brand: "Logitech",
      description: "Teclado mecánico inalámbrico con iluminación RGB, switches táctiles, multi-dispositivo",
      image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop",
      specs: ["Mecánico", "RGB", "Inalámbrico", "Multi-device"],
      inStock: true
    },
    {
      id: 9,
      name: "Monitor Gaming Samsung Odyssey",
      price: "8,999.00",
      originalPrice: "10,499.00",
      currency: "MXN",
      category: "monitores",
      brand: "Samsung",
      description: "Monitor gaming curvo 32\" 240Hz, 1ms, QHD, FreeSync Premium Pro",
      image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop",
      specs: ["32\" Curvo", "240Hz", "QHD", "FreeSync"],
      inStock: true
    },
    {
      id: 10,
      name: "Consola PlayStation 5",
      price: "13,499.00",
      originalPrice: "15,999.00",
      currency: "MXN",
      category: "consolas",
      brand: "Sony",
      description: "Consola de última generación con SSD ultrarrápido, ray tracing, 4K 120Hz",
      image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=300&fit=crop",
      specs: ["4K 120Hz", "SSD", "Ray Tracing", "8K"],
      inStock: true
    }
  ];

  const categories = [
    { id: 'todos', name: 'Todos los Productos', count: allProducts.length },
    { id: 'laptops', name: 'Laptops', count: allProducts.filter(p => p.category === 'laptops').length },
    { id: 'smartphones', name: 'Smartphones', count: allProducts.filter(p => p.category === 'smartphones').length },
    { id: 'tablets', name: 'Tablets', count: allProducts.filter(p => p.category === 'tablets').length },
    { id: 'wearables', name: 'Wearables', count: allProducts.filter(p => p.category === 'wearables').length },
    { id: 'accesorios', name: 'Accesorios', count: allProducts.filter(p => p.category === 'accesorios').length },
    { id: 'monitores', name: 'Monitores', count: allProducts.filter(p => p.category === 'monitores').length },
    { id: 'consolas', name: 'Consolas', count: allProducts.filter(p => p.category === 'consolas').length }
  ];

  // Simular carga de datos
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800)); // Simular delay
      setProducts(allProducts);
      setFilteredProducts(allProducts);
      setLoading(false);
    };

    loadProducts();
  }, []);

  // Filtros y búsqueda
  useEffect(() => {
    let result = products;

    // Filtrar por categoría
    if (selectedCategory !== 'todos') {
      result = result.filter(product => product.category === selectedCategory);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.brand.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term)
      );
    }

    // Ordenar
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

  const handleAddToCart = (product) => {
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

                    <button 
                      className={`add-to-cart-btn ${!product.inStock ? 'disabled' : ''}`}
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                    >
                      {!product.inStock ? 'Agotado' : '🛒 Añadir al Carrito'}
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
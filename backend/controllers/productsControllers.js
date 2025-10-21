const { getAllProducts, getProductById, deleteProductById } = require('../models/productModel');

// Controlador para obtener todos los productos
async function getProductos(req, res) {
  try {
    const productosDB = await getAllProducts();

    // Adaptar los datos a lo que espera el frontend
    const productos = productosDB.map(p => {
      const precioNumero = parseFloat(p.precio);
      
      return {
        id: p.id_producto,
        name: p.nombre_producto,
        price: precioNumero.toLocaleString('es-MX', { minimumFractionDigits: 2 }),
        originalPrice: (precioNumero * 1.2).toLocaleString('es-MX', { minimumFractionDigits: 2 }), // 20% más como precio original
        currency: "MXN",
        category: p.categoria ? p.categoria.toLowerCase().replace(/\s+/g, '-') : "otros",
        brand: p.marca || "Genérico",
        description: p.descripcion || "Sin descripción disponible",
        image: p.imagen ? `/images/${p.imagen}` : '/images/placeholder.jpg',
        specs: p.descripcion ? p.descripcion.split(',').slice(0, 4).map(s => s.trim()) : ["Sin especificaciones"],
        inStock: true, // Por defecto true (no hay campo de stock))
        stock: 10, // Valor fijo temporal
        rating: 4.5, // valor fijo temporal
        reviewCount: 10 // valor fijo temporal
      };
    });

    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error.message);
    res.status(500).json({ mensaje: 'Error al obtener los productos' });
  }
}

// Controlador para obtener un producto por ID
async function getProductoPorId(req, res) {
  try {
    const id = parseInt(req.params.id);
    const productoDB = await getProductById(id);

    if (!productoDB) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    const precioNumero = parseFloat(productoDB.precio);

    const producto = {
      id: productoDB.id_producto,
      name: productoDB.nombre_producto,
      price: precioNumero.toLocaleString('es-MX', { minimumFractionDigits: 2 }),
      originalPrice: (precioNumero * 1.2).toLocaleString('es-MX', { minimumFractionDigits: 2 }),
      currency: "MXN",
      category: productoDB.categoria ? productoDB.categoria.toLowerCase().replace(/\s+/g, '-') : "otros",
      brand: productoDB.marca || "Genérico",
      description: productoDB.descripcion || "Sin descripción disponible",
      image: productoDB.imagen ? `/images/${productoDB.imagen}` : '/images/placeholder.jpg',
      specs: productoDB.descripcion ? productoDB.descripcion.split(',').slice(0, 4).map(s => s.trim()) : ["Sin especificaciones"],
      inStock: true,
      stock: 10,
      rating: 4.5,
      reviewCount: 10
    };

    res.json(producto);
  } catch (error) {
    console.error('Error al obtener producto por ID:', error.message);
    res.status(500).json({ mensaje: 'Error al obtener el producto' });
  }
}

async function deleteProducto(req, res) {
  try {
    const id = parseInt(req.params.id);
    const eliminado = await deleteProductById(id);

    if (!eliminado) {
      return res.status(404).json({ mensaje: 'Producto no encontrado o ya eliminado' });
    }

    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error.message);
    res.status(500).json({ mensaje: 'Error al eliminar el producto' });
  }
}

module.exports = { getProductos, getProductoPorId, deleteProducto };

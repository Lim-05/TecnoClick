import React, { useEffect, useState } from "react";
import "./ProductosAdmin.css";

const ProductosAdmin = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar productos 
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/productos/products");
        if (!res.ok) throw new Error("Error al obtener productos");
        const data = await res.json();
        setProductos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  // Eliminar producto
  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/productos/products/${id}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Error al eliminar producto");

      // Quitar el producto eliminado de la tabla
      setProductos(productos.filter((p) => p.id !== id));
      alert("Producto eliminado correctamente");
    } catch (err) {
      alert("No se pudo eliminar el producto");
      console.error(err);
    }
  };

  if (loading) return <p className="loading">Cargando productos...</p>;
  if (error) return <p className="error">⚠️ {error}</p>;

  return (
    <div className="productos-admin-page">
      <div className="productos-admin-container">
        <h4>Gestión de Productos</h4>

        {productos.length === 0 ? (
          <p>No hay productos registrados.</p>
        ) : (
          <table className="productos-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Marca</th>
                <th>Precio</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.brand}</td>
                  <td>${p.price}</td>
                  <td>{p.category}</td>
                  <td>{p.stock}</td>
                  <td>
                    <button
                      className="btn-eliminar"
                      onClick={() => eliminarProducto(p.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductosAdmin;

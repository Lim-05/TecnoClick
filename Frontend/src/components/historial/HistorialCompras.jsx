import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HistorialCompras.css';

const HistorialCompras = () => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detalleVisible, setDetalleVisible] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      
      if (!usuario || !usuario.id_usuario) {
        setError('Usuario no autenticado. Por favor, inicia sesión nuevamente.');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:3000/api/pedidos/historial/${usuario.id_usuario}`);

      if (!response.ok) {
        throw new Error('Error al cargar el historial');
      }

      const data = await response.json();
      setHistorial(data.historial || []);

    } catch (err) {
      console.error('Error al cargar historial:', err);
      setError('Error al cargar el historial de compras');
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = async (idPedido) => {
    if (detalleVisible === idPedido) {
      setDetalleVisible(null);
      return;
    }

    try {
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      const response = await fetch(`http://localhost:3000/api/pedidos/detalle/${idPedido}/${usuario.id_usuario}`);

      if (!response.ok) {
        throw new Error('Error al cargar el detalle');
      }

      const data = await response.json();
      setHistorial(prev => prev.map(pedido => 
        pedido.id === idPedido 
          ? { ...pedido, detalleCompleto: data.compra }
          : pedido
      ));
      
      setDetalleVisible(idPedido);
    } catch (err) {
      console.error('Error al cargar detalle:', err);
      alert('Error al cargar el detalle de la compra');
    }
  };

  const formatFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMoneda = (monto) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(monto);
  };

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'completado': return '#27ae60';
      case 'pendiente': return '#f39c12';
      case 'cancelado': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  if (loading) {
    return (
      <div className="historial-page">
        <div className="historial-container">
          <div className="loading">Cargando historial de compras...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="historial-page">
        <div className="historial-container">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={cargarHistorial} className="btn-primary">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="historial-page">
      <div className="historial-container">
        <div className="historial-header">
          <h1>Mi Historial de Compras</h1>
          <p>Revisa todas tus compras realizadas en TecnoClick</p>
        </div>

        {historial.length === 0 ? (
          <div className="historial-vacio">
            <div className="vacio-icon">🛒</div>
            <h3>No has realizado compras aún</h3>
            <p>Descubre nuestros productos y realiza tu primera compra</p>
            <button 
              onClick={() => navigate('/products')}
              className="btn-primary"
            >
              Ver Productos
            </button>
          </div>
        ) : (
          <div className="historial-list">
            {historial.map((compra) => (
              <div key={compra.id} className="compra-card">
                <div className="compra-header">
                  <div className="compra-info">
                    <div className="compra-id">Orden #{compra.id}</div>
                    <div className="compra-fecha">{formatFecha(compra.fecha)}</div>
                  </div>
                  <div className="compra-estado">
                    <span 
                      className="estado-badge"
                      style={{ backgroundColor: getEstadoColor(compra.estado) }}
                    >
                      {compra.estado}
                    </span>
                  </div>
                </div>

                <div className="compra-body">
                  <div className="compra-detalles">
                    <div className="detalle-item">
                      <span className="detalle-label">Total:</span>
                      <span className="detalle-value">{formatMoneda(compra.total)}</span>
                    </div>
                    <div className="detalle-item">
                      <span className="detalle-label">Método de pago:</span>
                      <span className="detalle-value">
                        {compra.metodoPago === 'efectivo' ? ' Efectivo' : ' Tarjeta'}
                      </span>
                    </div>
                    <div className="detalle-item">
                      <span className="detalle-label">Folio:</span>
                      <span className="detalle-value">{compra.folio}</span>
                    </div>
                    <div className="detalle-item">
                      <span className="detalle-label">Productos:</span>
                      <span className="detalle-value">{compra.cantidadProductos} items</span>
                    </div>
                  </div>

                  <button 
                    className="btn-ver-detalle"
                    onClick={() => verDetalle(compra.id)}
                  >
                    {detalleVisible === compra.id ? 'Ocultar Detalle' : 'Ver Detalle'}
                  </button>
                </div>

                {detalleVisible === compra.id && compra.detalleCompleto && (
                  <div className="compra-detalle-completo">
                    <h4>Detalle de la Compra</h4>
                    <div className="productos-list">
                      {compra.detalleCompleto.productos.map((producto, index) => (
                        <div key={index} className="producto-item">
                          <div className="producto-imagen">
                            <img 
                              src={producto.imagen || '/images/placeholder.jpg'} 
                              alt={producto.nombre}
                              onError={(e) => {
                                e.target.src = '/images/placeholder.jpg';
                              }}
                            />
                          </div>
                          <div className="producto-info">
                            <div className="producto-nombre">{producto.nombre}</div>
                            <div className="producto-precio">
                              {formatMoneda(producto.precioUnitario)} x {producto.cantidad}
                            </div>
                          </div>
                          <div className="producto-subtotal">
                            {formatMoneda(producto.subtotal)}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="detalle-total">
                      <strong>Total: {formatMoneda(compra.detalleCompleto.total)}</strong>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialCompras;
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import './CheckoutForm.css';

const CheckoutForm = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState('tarjeta');
  const [formData, setFormData] = useState({
    // Datos personales
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    
    // Datos de tarjeta
    numeroTarjeta: '',
    nombreTitular: '',
    fechaExpiracion: '',
    cvv: '',
    
    // Datos de envío
    ciudad: '',
    codigoPostal: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    return parts.length ? parts.join(' ') : value;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({
      ...prev,
      numeroTarjeta: formatted
    }));
  };

  const generateFolio = () => {
    return 'TEC' + Date.now().toString().slice(-8);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));

      let orderData = {
        ...formData,
        paymentMethod,
        productos: state.cart,
        total: state.cart.reduce((sum, item) => {
          const price = parseFloat(item.price.replace(/,/g, ''));
          return sum + (price * item.quantity);
        }, 0),
        fecha: new Date().toISOString()
      };

      if (paymentMethod === 'efectivo') {
        orderData.folio = generateFolio();
        orderData.estado = 'pendiente';
      } else {
        orderData.estado = 'procesado';
      }

      console.log('Orden creada:', orderData);
      
      // Limpiar carrito
      dispatch({ type: 'CLEAR_CART' });
      
      // Mostrar mensaje de éxito
      alert(paymentMethod === 'efectivo' 
        ? `¡Pedido creado! Tu folio de pago es: ${orderData.folio}`
        : '¡Pago procesado exitosamente!'
      );
      
      // Redirigir a home
      navigate('/');
      
    } catch (error) {
      console.error('Error al procesar pedido:', error);
      alert('Error al procesar el pedido. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = state.cart.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/,/g, ''));
    return sum + (price * item.quantity);
  }, 0);

  if (state.cart.length === 0) {
    return (
      <div className="checkout-empty">
        <h1>Checkout</h1>
        <p>No hay productos en el carrito</p>
        <button onClick={() => navigate('/products')} className="btn-primary">
          Ir a Productos
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Finalizar Compra</h1>
        
        <form onSubmit={handleSubmit} className="checkout-form">
          {/* Sección de Información Personal */}
          <section className="form-section">
            <h2>Información Personal</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Nombre completo *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Teléfono *</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </section>

          {/* Sección de Dirección */}
          <section className="form-section">
            <h2>Dirección de Envío</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Dirección completa *</label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Ciudad *</label>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Código Postal *</label>
                <input
                  type="text"
                  name="codigoPostal"
                  value={formData.codigoPostal}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </section>

          {/* Sección de Método de Pago */}
          <section className="form-section">
            <h2>Método de Pago</h2>
            
            <div className="payment-methods">
              <div className="payment-option">
                <input
                  type="radio"
                  id="tarjeta"
                  name="paymentMethod"
                  checked={paymentMethod === 'tarjeta'}
                  onChange={() => handlePaymentMethodChange('tarjeta')}
                />
                <label htmlFor="tarjeta">
                  <span className="payment-icon">💳</span>
                  Tarjeta de Crédito/Débito
                </label>
              </div>
              
              <div className="payment-option">
                <input
                  type="radio"
                  id="efectivo"
                  name="paymentMethod"
                  checked={paymentMethod === 'efectivo'}
                  onChange={() => handlePaymentMethodChange('efectivo')}
                />
                <label htmlFor="efectivo">
                  <span className="payment-icon">💰</span>
                  Pago en Efectivo
                </label>
              </div>
            </div>

            {/* Formulario de Tarjeta */}
            {paymentMethod === 'tarjeta' && (
              <div className="card-form">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Número de Tarjeta *</label>
                    <input
                      type="text"
                      name="numeroTarjeta"
                      value={formData.numeroTarjeta}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      required
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Nombre del Titular *</label>
                    <input
                      type="text"
                      name="nombreTitular"
                      value={formData.nombreTitular}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Fecha de Expiración *</label>
                    <input
                      type="text"
                      name="fechaExpiracion"
                      value={formData.fechaExpiracion}
                      onChange={handleInputChange}
                      placeholder="MM/AA"
                      maxLength="5"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>CVV *</label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength="3"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Información de Pago en Efectivo */}
            {paymentMethod === 'efectivo' && (
              <div className="cash-info">
                <div className="cash-message">
                  <h3>💰 Pago en Efectivo</h3>
                  <p>Al confirmar tu pedido, se generará un folio único que deberás presentar para realizar el pago en cualquiera de nuestras sucursales.</p>
                  <ul>
                    <li>🕒 Tienes 24 horas para realizar el pago</li>
                    <li>🏪 Puedes pagar en cualquier sucursal</li>
                    <li>📦 Tu pedido se preparará una vez confirmado el pago</li>
                  </ul>
                </div>
              </div>
            )}
          </section>

          {/* Resumen del Pedido */}
          <section className="order-summary">
            <h2>Resumen del Pedido</h2>
            <div className="order-items">
              {state.cart.map(item => (
                <div key={item.id} className="order-item">
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(parseFloat(item.price.replace(/,/g, '')) * item.quantity).toLocaleString()} MXN</span>
                </div>
              ))}
            </div>
            <div className="order-total">
              <strong>Total: ${total.toLocaleString()} MXN</strong>
            </div>
          </section>

          {/* Botón de Envío */}
          <button 
            type="submit" 
            className="submit-order-btn"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? 'Procesando...' 
              : paymentMethod === 'efectivo' 
                ? 'Generar Folio de Pago' 
                : 'Pagar Ahora'
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;
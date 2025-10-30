import React, { useState, useEffect } from 'react'; // CAMBIO: agregamos useEffect
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/authUtils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({ folio: '', method: '' });

  const [userCards, setUserCards] = useState([]);

  useEffect(() => {
  const fetchUserCards = async () => {
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      const token = localStorage.getItem("token");

      if (!usuario || !token) {
        console.warn("No hay usuario o token en localStorage");
        return;
      }

      const res = await fetch(`http://localhost:3000/api/datos_tarjeta/${usuario.id_usuario}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        console.error("Error de respuesta del backend:", res.status);
        return;
      }

      const data = await res.json();
      console.log("Tarjetas cargadas:", data);

      // Evita romper el render
      if (Array.isArray(data)) {
        setUserCards(data);
      } else if (data && data.id_tarjeta) {
        setUserCards([data]);
      } else {
        setUserCards([]);
      }
    } catch (error) {
      console.error("Error cargando tarjetas del usuario:", error);
    }
  };

  fetchUserCards();
  }, []);

  // FIN CAMBIO

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

  const generarPDF = async (folio, userData, productos, total) => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    // Colores y estilos
    const colorPrimario = [41, 128, 185]; // azul elegante
    const colorTexto = [60, 60, 60];

    // Encabezado
    doc.setFillColor(...colorPrimario);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('Comprobante de Pago - TecnoClick', 105, 16, { align: 'center' });

    // Datos generales
    doc.setTextColor(...colorTexto);
    doc.setFontSize(12);
    doc.text(`Folio: ${folio}`, 20, 40);
    doc.text(`Cliente: ${userData.nombre}`, 20, 50);
    doc.text(`Correo: ${userData.email}`, 20, 60);
    doc.text(`Método de pago: Efectivo`, 20, 70);
    doc.text(`Fecha: ${new Date().toLocaleString()}`, 20, 80);

    // Línea separadora
    doc.setDrawColor(...colorPrimario);
    doc.line(20, 85, 190, 85);

    // Tabla de productos
    let y = 95;
    doc.setFontSize(13);
    doc.setTextColor(...colorPrimario);
    doc.text('Detalle de productos', 20, y);
    y += 8;

    // Encabezados
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(...colorPrimario);
    doc.rect(20, y, 170, 8, 'F');
    doc.text('Producto', 25, y + 6);
    doc.text('Cant.', 110, y + 6);
    doc.text('Precio', 135, y + 6);
    doc.text('Subtotal', 165, y + 6);
    y += 12;

    // Filas
    doc.setTextColor(...colorTexto);
    productos.forEach((item) => {
      const price = typeof item.price === 'number'
        ? item.price
        : parseFloat(item.price.replace(/,/g, ''));
      const subtotal = price * item.quantity;

      doc.text(item.name, 25, y);
      doc.text(String(item.quantity), 112, y);
      doc.text(`$${price.toLocaleString()}`, 135, y);
      doc.text(`$${subtotal.toLocaleString()}`, 165, y);
      y += 8;

      // salto de página si se llena
      if (y > 250) {
        doc.addPage();
        y = 30;
      }
    });

    // Línea separadora
    doc.setDrawColor(...colorPrimario);
    doc.line(20, y + 4, 190, y + 4);

    // Total
    doc.setFontSize(13);
    doc.setTextColor(...colorPrimario);
    doc.text(`Total a pagar: $${total.toLocaleString()} MXN`, 130, y + 14);

    // Pie de página
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(
      'Gracias por tu compra en TecnoClick. ¡Esperamos verte pronto!',
      105,
      280,
      { align: 'center' }
    );

    doc.setFontSize(9);
    doc.text('Documento generado electrónicamente - No requiere firma', 105, 288, { align: 'center' });

    // Guardar PDF
    doc.save(`Comprobante_${folio}.pdf`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Recuperar id_usuario del localStorage
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      const idUsuario = usuario?.id_usuario;

      if (!idUsuario) {
        alert("No se pudo determinar el usuario logueado.");
        setIsSubmitting(false);
        return;
      }

      // Calcular total
      const total = state.cart.reduce((sum, item) => {
        let price;
        if (typeof item.price === 'number') {
          price = item.price;
        } else if (typeof item.price === 'string') {
          price = parseFloat(item.price.replace(/,/g, ''));
        } else {
          return sum;
        }
        return sum + price * item.quantity;
      }, 0);

      // Generar datos de pedido comunes
      const orderData = {
        productos: state.cart.map(item => ({
          id: item.id,
          quantity: item.quantity
        })),
        total,
        fecha: new Date().toISOString()
      };

      if (paymentMethod === 'efectivo') {
        const folio = 'TEC' + Date.now().toString().slice(-8);
        const token = getToken();

        const response = await fetch('http://localhost:3000/api/checkout/efectivo', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            idUsuario,
            productos: orderData.productos,
            total: orderData.total,
            folio
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al registrar el pago en efectivo');
        }

        // Mostrar notificación en lugar de alert
        setNotificationData({ folio: data.folio, method: 'efectivo' });
        setShowNotification(true);
        // Generar PDF del comprobante
        generarPDF(
          data.folio,
          { nombre: usuario.nombre_usuario, email: usuario.correo_usuario },
          state.cart,
          orderData.total
        );

        
        // Ocultar notificación después de 4 segundos
        setTimeout(() => {
          setShowNotification(false);
        }, 6000);

      } else if (paymentMethod === 'tarjeta') {
        const tarjeta = {
          nombre_titular: formData.nombreTitular,
          numero_tarjeta: formData.numeroTarjeta.replace(/\s/g, ''),
          fecha_vencimiento: formData.fechaExpiracion,
          cvv: formData.cvv
        };
        const token = getToken();

        const response = await fetch('http://localhost:3000/api/checkout/tarjeta', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            idUsuario,
            productos: orderData.productos,
            total: orderData.total,
            tarjeta
          })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al registrar el pago con tarjeta');

        //mostrar notificación 
        setNotificationData({ folio: data.folio, method: 'tarjeta' });
        setShowNotification(true);
        
        //ocultar notificación después de 6 segundos
        setTimeout(() => {
          setShowNotification(false);
        }, 6000);
      }

      //limpiar carrito y redirigir después de un breve delay
      setTimeout(() => {
        dispatch({ type: 'CLEAR_CART' });
        navigate('/');
      }, 6000);

    } catch (error) {
      console.error('Error al procesar pedido:', error);
      alert('Error al procesar el pedido. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = state.cart.reduce((sum, item) => {
    let price;
    if (typeof item.price === 'number') {
      price = item.price;
    } else if (typeof item.price === 'string') {
      price = parseFloat(item.price.replace(/,/g, ''));
    } else {
      return sum;
    }
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
      {/* Notificación de pago exitoso */}
      {showNotification && (
        <div className="payment-notification">
          <div className="payment-notification-content">
            <span className="payment-notification-icon">✓</span>
            <div className="payment-notification-text">
              <strong>
                {notificationData.method === 'efectivo' ? '¡Compra completada!' : '¡Pago completado!'}
              </strong>
              <p>Folio: {notificationData.folio}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="checkout-container">
        <h1>Finalizar Compra</h1>
        
        <form onSubmit={handleSubmit} className="checkout-form">
          

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
                    <label>cvv *</label>
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

                  {/* CAMBIO: select tarjetas */}
                  {userCards.length > 0 && (
                    <div className="form-group full-width">
                      <label>Seleccionar tarjeta existente</label>
                      <select
                        onChange={(e) => {
                          const selectedCard = userCards.find(card => card.numero_tarjeta.slice(-4) === e.target.value);
                          if (selectedCard) {
                            setFormData(prev => ({
                              ...prev,
                              numeroTarjeta: selectedCard.numero_tarjeta,
                              nombreTitular: selectedCard.nombre_titular,
                              fechaExpiracion: selectedCard.fecha_vencimiento,
                              cvv: selectedCard.cvv
                            }));
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>-- Elige una tarjeta --</option>
                        {userCards.map((card, idx) => (
                          <option key={idx} value={card.numero_tarjeta.slice(-4)}>
                            **** **** **** {card.numero_tarjeta.slice(-4)} - {card.nombre_titular}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {/* FIN CAMBIO */}


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
                  <span>${(() => {
                    const price = typeof item.price === 'number' 
                      ? item.price 
                      : parseFloat(item.price.replace(/,/g, ''));
                    return (price * item.quantity).toLocaleString();
                  })()} MXN</span>
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
import React, {useState} from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../common/Modal';
import CheckoutForm from './Reg_Compra';
import { Link, useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const { state, dispatch } = useApp();
  const { cart } = state;

  const usuario = JSON.parse(localStorage.getItem('usuario'));

const navigate = useNavigate();

  const [isModalOpen, setModalOpen] = useState(false);

  const updateQuantity = (productId, quantity) => {
    if (quantity === 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    } else {
      dispatch({ 
        type: 'UPDATE_QUANTITY', 
        payload: { productId, quantity } 
      });
    }
  };

  const removeItem = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const handleCheckout = () => {
    alert('Compra realizada con éxito!');
    dispatch({ type: 'CLEAR_CART' });
    setModalOpen(false);
  };

  
  const total = cart.reduce((sum, item) => {
    // Manejar tanto números como strings
    let price;
    if (typeof item.price === 'number') {
      price = item.price;
    } else if (typeof item.price === 'string') {
      const cleanPrice = item.price.replace(/,/g, '');
      price = parseFloat(cleanPrice);
    } else {
      console.warn(`Precio inválido para ${item.name}: ${item.price}`);
      return sum;
    }
    
    if (isNaN(price)) {
      console.warn(`Precio inválido para ${item.name}: ${item.price}`);
      return sum;
    }
    
    return sum + (price * item.quantity);
  }, 0);

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <h2>🛒 Tu carrito está vacío</h2>
        <p>Agrega algunos productos tecnológicos increíbles</p>
        <Link to="/products" className="continue-shopping">
          Ver Productos
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h2>Tu Carrito de Compras</h2>
          <button onClick={clearCart} className="clear-cart-btn">
            Vaciar Carrito
          </button>
        </div>
        
        <div className="cart-items">
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              {/* Imagen del producto */}
              <div className="item-image">
                <img 
                  src={item.image || '/imagenes_productos/placeholder.jpg'} 
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = '/imagenes_productos/placeholder.jpg';
                  }}
                />
              </div>
              
              <div className="item-details">
                <h4>{item.name}</h4>
                <p className="item-price">{item.price} {item.currency}</p>
              </div>
              
              <div className="quantity-controls">
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              
              <div className="item-total">
                {(() => {
                  const price = typeof item.price === 'number' 
                    ? item.price 
                    : parseFloat(item.price.replace(/,/g, ''));
                  return (price * item.quantity).toLocaleString();
                })()} {item.currency}
              </div>
              
              <button 
                onClick={() => removeItem(item.id)}
                className="remove-btn"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="cart-total">
            <h3>Total: ${total.toLocaleString()} MXN</h3>
          </div>
          
          <div className="cart-actions">
            <Link to="/products" className="continue-shopping">
              Seguir Comprando
            </Link>
            <button
              className="checkout-btn"
              onClick={() => {
                if (usuario) {
                  // Usuario logueado → ir directo al checkout
                  navigate('/checkout'); 
                } else {
                  // Usuario NO logueado → abrir modal de registro
                  setModalOpen(true);
                }
              }} >Continuar con la compra
            </button>
          </div>
          
          <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
            <CheckoutForm onSubmit={handleCheckout} />
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Cart;
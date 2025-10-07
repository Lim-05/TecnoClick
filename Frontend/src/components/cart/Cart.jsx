// src/components/cart/Cart.jsx
import React from 'react';
import { useApp } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const { state, dispatch } = useApp();
  const { cart } = state;

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

  const total = cart.reduce((sum, item) => {
    const price = parseInt(item.price.replace(/\./g, ''));
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
                {(parseFloat(item.price.replace(/,/g, '')) * item.quantity).toLocaleString()} {item.currency}
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
            <h3>Total: {total.toLocaleString()} MXN</h3>
          </div>
          
          <div className="cart-actions">
            <Link to="/products" className="continue-shopping">
              Seguir Comprando
            </Link>
            <Link to="/checkout" className="checkout-btn">
              Proceder al Pago
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
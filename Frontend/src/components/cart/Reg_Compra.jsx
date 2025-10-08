// src/components/cart/Reg_Compra.jsx
import React from 'react';
import './Reg_compra.css';

const CheckoutForm = ({ onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <h3>Registro de Compra</h3>

      {/* Sección: Domicilio */}
        <fieldset>
        <legend>Domicilio</legend>
        <div className="form-grid">
            <label>
            Dirección o lugar de entrega
            <input type="text" required />
            </label>
            <label>
            Código postal
            <input type="text" required />
            </label>
            <label>
            Estado
            <input type="text" required />
            </label>
            <label>
            Municipio
            <input type="text" required />
            </label>
            <label>
            Localidad
            <input type="text" />
            </label>
            <label>
            Colonia
            <input type="text" />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
            Referencias para entrega (opcional)
            <textarea maxLength={150}></textarea>
            </label>
        </div>
        </fieldset>

        <fieldset>
        <legend>Contacto</legend>
        <div className="form-grid">
            <label>
            Nombre
            <input type="text" required />
            </label>
            <label>
            Apellido
            <input type="text" required />
            </label>
            <label>
            Teléfono
            <input type="tel" required />
            </label>
            <label>
            Correo electrónico (opcional)
            <input type="email" />
            </label>
        </div>
        </fieldset>

      <button type="submit">Continuar</button>
    </form>
  );
};

export default CheckoutForm;

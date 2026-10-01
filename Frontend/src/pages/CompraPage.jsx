import React from 'react';
import Reg_Compra from '../components/cart/Reg_Compra';
import CheckoutForm from '../components/checkout/CheckoutForm';

const CompraPage = () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  return (
    <div>
      {usuario ? <CheckoutForm /> : <Reg_Compra />}
    </div>
  );
};

export default CompraPage;

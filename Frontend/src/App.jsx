import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/common/Header';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import Cart from './components/cart/Cart';
import ProductDetail from './pages/ProductDetail';
import CheckoutForm from './components/checkout/CheckoutForm';
import Reg_Compra from './components/cart/Reg_Compra'; // ← Agregar esta importación
import Favoritos from './components/cart/Favoritos'; 
import Perfil from './pages/Perfil'; 
import Login from './pages/Login';
import UsuariosAdmin from './pages/administrador/UsuariosAdmin';
import AdminHome from './pages/administrador/AdminHome';
import ProductosAdmin from './pages/administrador/ProductosAdmin';
import CompraPage from './pages/CompraPage'; 
import HistorialCompras from './components/historial/HistorialCompras';
import TarjetaForm from './components/tarjetas/TarjetaForm';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetail />} /> 
              <Route path="/cart" element={<Cart />} />
              <Route path="/compra" element={<CompraPage />} /> {/* ← NUEVO */}
              <Route path="/favoritos" element={<Favoritos />} />
              <Route path="/checkout" element={<CheckoutForm />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/usuarios" element={<UsuariosAdmin />} />
              <Route path="/admin" element={<AdminHome />} />
              <Route path="/admin/productos" element={<ProductosAdmin />} />
              <Route path="/historial-compras" element={<HistorialCompras />} />
              <Route path="/tarjetas" element={<TarjetaForm />}/>
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
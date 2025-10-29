import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/common/Header';
import SessionMonitor from './components/common/SessionMonitor';
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
import IngresosAdmin from './pages/administrador/IngresosAdmin';
import PedidoAdmin from './pages/administrador/PedidosAdmin';
import CompraPage from './pages/CompraPage'; 
import HistorialCompras from './components/historial/HistorialCompras';
import TarjetaForm from './components/tarjetas/TarjetaForm';
import ProtectedRoute from './components/common/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Header />
          <SessionMonitor /> {/* Monitor de sesión global */}
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
              <Route path="/historial-compras" element={<HistorialCompras />} />
              <Route path="/tarjetas" element={<TarjetaForm />}/>

              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminHome />
                </ProtectedRoute>
              } />
              <Route path="/admin/usuarios" element={
                <ProtectedRoute requiredRole="admin">
                  <UsuariosAdmin />
                </ProtectedRoute>
              } />
              <Route path="/admin/productos" element={
                <ProtectedRoute requiredRole="admin">
                  <ProductosAdmin />
                </ProtectedRoute>
              } />
              <Route path="/admin/ingresos" element={
                <ProtectedRoute requiredRole="admin">
                  <IngresosAdmin />
                </ProtectedRoute>
              } />
              <Route path="/admin/pedidos" element={
                <ProtectedRoute requiredRole="admin">
                  <PedidoAdmin />
                </ProtectedRoute>
              } />

            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
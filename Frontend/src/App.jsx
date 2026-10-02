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
import RecuperarContrasena from './pages/RecuperarContrasena';
import RestablecerContrasena from './pages/RestablecerContrasena';
import UsuariosAdmin from './pages/administrador/UsuariosAdmin';
import AdminHome from './pages/administrador/AdminHome';
import ContenidoAdmin from './pages/administrador/ContenidoAdmin';
import RolesAdmin from './pages/administrador/RolesAdmin';
import AuditoriaAdmin from './pages/administrador/AuditoriaAdmin';
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
              <Route path="/recuperar" element={<RecuperarContrasena />} />
              <Route path="/restablecer-contrasena/:token" element={<RestablecerContrasena />} />
              <Route path="/historial-compras" element={<HistorialCompras />} />
              <Route path="/tarjetas" element={<TarjetaForm />}/>

              <Route path="/admin" element={
                <ProtectedRoute anyPermissions={['productos.crear','productos.editar','productos.eliminar','categorias.crear','categorias.editar','categorias.eliminar','usuarios.ver','roles.ver','auditoria.ver','ingresos.ver','pedidos.gestionar']}>
                  <AdminHome />
                </ProtectedRoute>
              } />
              <Route path="/admin/usuarios" element={
                <ProtectedRoute requiredPermission="usuarios.ver">
                  <UsuariosAdmin />
                </ProtectedRoute>
              } />
              <Route path="/admin/productos" element={
                <ProtectedRoute requiredPermission="productos.ver">
                  <ContenidoAdmin resource="productos" />
                </ProtectedRoute>
              } />
              <Route path="/admin/ingresos" element={
                <ProtectedRoute requiredPermission="ingresos.ver">
                  <IngresosAdmin />
                </ProtectedRoute>
              } />
              <Route path="/admin/pedidos" element={
                <ProtectedRoute requiredPermission="pedidos.gestionar">
                  <PedidoAdmin />
                </ProtectedRoute>
              } />

              <Route path="/admin/categorias" element={<ProtectedRoute requiredPermission="categorias.ver"><ContenidoAdmin resource="categorias" /></ProtectedRoute>} />
              <Route path="/admin/roles" element={<ProtectedRoute requiredPermission="roles.ver"><RolesAdmin /></ProtectedRoute>} />
              <Route path="/admin/auditoria" element={<ProtectedRoute requiredPermission="auditoria.ver"><AuditoriaAdmin /></ProtectedRoute>} />
              <Route path="/editor" element={<ProtectedRoute requiredRole="editor"><AdminHome /></ProtectedRoute>} />

            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;

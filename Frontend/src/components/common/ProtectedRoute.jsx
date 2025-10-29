// src/components/common/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { isAuthenticated, hasRole, logout } from '../../utils/authUtils';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { state } = useApp();
  const user = state.user;

  // Verificar autenticación con token
  useEffect(() => {
    if (!isAuthenticated()) {
      console.warn('⚠️ Token inválido o expirado. Cerrando sesión...');
      logout();
    }
  }, []);

  // Verificar si hay usuario y token válido
  if (!user || !isAuthenticated()) {
    console.log('🔒 Acceso denegado: Usuario no autenticado');
    return <Navigate to="/login" replace />;
  }

  // Verificar rol requerido
  if (requiredRole && !hasRole(requiredRole)) {
    console.log(`🔒 Acceso denegado: Se requiere rol "${requiredRole}"`);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

// src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { state } = useApp();
  const user = state.user;

  if (!user) {
    // No hay usuario logueado 
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.rol !== requiredRole) {
    // Usuario no tiene el rol requerido
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

// src/context/AppContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

// Función para obtener el estado inicial desde localStorage
const getInitialState = () => {
  try {
    const savedUser = localStorage.getItem('usuario');
    const user = savedUser ? JSON.parse(savedUser) : null;
    
    // Si hay un usuario logueado, cargar sus datos específicos
    if (user && user.id_usuario) {
      const userCartKey = `cart_${user.id_usuario}`;
      const userFavoritosKey = `favoritos_${user.id_usuario}`;
      
      const savedCart = localStorage.getItem(userCartKey);
      const savedFavoritos = localStorage.getItem(userFavoritosKey);
      
      return {
        cart: savedCart ? JSON.parse(savedCart) : [],
        user: user,
        favoritos: savedFavoritos ? JSON.parse(savedFavoritos) : [],
      };
    }
    
    // Si no hay usuario, devolver estado vacío
    return {
      cart: [],
      user: null,
      favoritos: [],
    };
  } catch (error) {
    console.error('Error al cargar datos desde localStorage:', error);
    return {
      cart: [],
      user: null,
      favoritos: [],
    };
  }
};

const initialState = getInitialState();

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      // Cuando se establece un usuario, cargar sus datos específicos
      const user = action.payload;
      if (user && user.id_usuario) {
        const userCartKey = `cart_${user.id_usuario}`;
        const userFavoritosKey = `favoritos_${user.id_usuario}`;
        
        const savedCart = localStorage.getItem(userCartKey);
        const savedFavoritos = localStorage.getItem(userFavoritosKey);
        
        return {
          ...state,
          user: user,
          cart: savedCart ? JSON.parse(savedCart) : [],
          favoritos: savedFavoritos ? JSON.parse(savedFavoritos) : [],
        };
      }
      // Si no hay usuario (logout), limpiar carrito y favoritos
      return {
        ...state,
        user: null,
        cart: [],
        favoritos: [],
      };

    case 'ADD_TO_FAVORITOS':
    return {
      ...state,
      favoritos: [...state.favoritos, action.payload],
    };

    case 'REMOVE_FROM_FAVORITOS':
    return {
      ...state,
      favoritos: state.favoritos.filter(item => item.id !== action.payload),
    };

    case 'ADD_TO_CART':
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      const quantityToAdd = action.payload.quantity || 1;
      
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + quantityToAdd }
              : item
          ),
        };
      }
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity: quantityToAdd }],
      };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload),
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case 'CLEAR_CART':
      return {
        ...state,
        cart: [],
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Guardar el carrito en localStorage cada vez que cambie
  useEffect(() => {
    if (state.user && state.user.id_usuario) {
      try {
        const userCartKey = `cart_${state.user.id_usuario}`;
        localStorage.setItem(userCartKey, JSON.stringify(state.cart));
      } catch (error) {
        console.error('Error al guardar el carrito:', error);
      }
    }
  }, [state.cart, state.user]);

  // Guardar los favoritos en localStorage cada vez que cambien
  useEffect(() => {
    if (state.user && state.user.id_usuario) {
      try {
        const userFavoritosKey = `favoritos_${state.user.id_usuario}`;
        localStorage.setItem(userFavoritosKey, JSON.stringify(state.favoritos));
      } catch (error) {
        console.error('Error al guardar los favoritos:', error);
      }
    }
  }, [state.favoritos, state.user]);

  // Sincronizar con cambios en localStorage del usuario
  useEffect(() => {
    const handleStorageChange = () => {
      const savedUser = localStorage.getItem('usuario');
      const user = savedUser ? JSON.parse(savedUser) : null;
      
      // Si el usuario cambió (login o logout), actualizar el estado
      if (user?.id_usuario !== state.user?.id_usuario) {
        dispatch({ type: 'SET_USER', payload: user });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('usuarioChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('usuarioChange', handleStorageChange);
    };
  }, [state.user]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de AppProvider');
  }
  return context;
}
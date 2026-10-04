import { authFetch } from '../../utils/authFetch.js';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reg_compra.css';

const Reg_Compra = () => {
  const navigate = useNavigate();

  
  const [formData, setFormData] = useState({
    // Datos de domicilio
    direccion: '',
    codigoPostal: '',
    estado: '',
    municipio: '',
    colonia: '',
    referencias: '',
    
    // Datos de contacto
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    password: '' 
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar campos requeridos de domicilio
    if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es requerida';
    if (!formData.codigoPostal.trim()) newErrors.codigoPostal = 'El código postal es requerido';
    if (!formData.estado.trim()) newErrors.estado = 'El estado es requerido';
    if (!formData.municipio.trim()) newErrors.municipio = 'El municipio es requerido';
    if (!formData.colonia.trim()) newErrors.colonia = 'La colonia es requerida';
    if (!formData.email.trim()) newErrors.email = 'El correo es requerido';
    
    // Validar campos requeridos de contacto
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.password.trim()) newErrors.password = 'La contraseña es requerida';
    
    // Validar formato de teléfono (mínimo 10 dígitos)
    if (formData.telefono && formData.telefono.replace(/\D/g, '').length < 10) {
      newErrors.telefono = 'El teléfono debe tener al menos 10 dígitos';
    }
    
    // Validar formato de email si se proporciona
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  console.log('1. Se presionó Continuar al Pago');

  if (!validateForm()) {
    console.log('2. El formulario no pasó la validación');
    return;
  }

  try {
    console.log('3. Enviando registro...');

    const response = await authFetch('https://localhost:3000/api/usuarios', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
        correo: formData.email,
        direccion: formData.direccion,
        contra: formData.password,
        CP: formData.codigoPostal,
        estado: formData.estado,
        municipio: formData.municipio,
        colonia: formData.colonia,
        referencias: formData.referencias
      })
    });

    const data = await response.json();

    console.log('4. Respuesta registro:', response.status, data);

    if (!response.ok) {
      alert(`Error al guardar: ${data.mensaje || data.error || 'Error desconocido'}`);
      return;
    }

    console.log('5. Usuario creado correctamente. Iniciando sesión...');

    const login = await authFetch('https://localhost:3000/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        correo: formData.email,
        contra: formData.password
      })
    });

    const session = await login.json();

    console.log('6. Respuesta login:', login.status, session);

    if (!login.ok) {
      alert('Tu cuenta fue creada. Inicia sesión para continuar.');
      navigate('/login');
      return;
    }

    localStorage.setItem(
      'usuario',
      JSON.stringify(session.usuario)
    );

    window.dispatchEvent(new Event('usuarioChange'));

    console.log('7. Sesión iniciada correctamente');

    navigate('/checkout', {
      state: {
        customerData: formData
      }
    });

  } catch (error) {
    console.error('ERROR EN REGISTRO/LOGIN:', error);
    alert('Error de conexión con el servidor');
  }
};

  const isFormValid = () => {
    return (
      formData.direccion.trim() &&
      formData.codigoPostal.trim() &&
      formData.estado.trim() &&
      formData.municipio.trim() &&
      formData.colonia.trim() &&
      formData.email.trim() &&
      formData.password.trim() &&
      formData.nombre.trim() &&
      formData.apellido.trim() &&
      formData.telefono.trim() &&
      formData.telefono.replace(/\D/g, '').length >= 10
    );
  };

  return (
    <div className="reg-compra-page">
      <form className="checkout-form" onSubmit={handleSubmit}>
        <h4>Registro de Compra</h4>

        {/* Sección: Domicilio */}
        <fieldset>
          <legend>Domicilio</legend>
          <div className="form-grid">
            <label>
              Dirección o lugar de entrega *
              <input 
                type="text" 
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                required 
              />
              {errors.direccion && <span className="error-message">{errors.direccion}</span>}
            </label>
            
            <label>
              Código postal *
              <input 
                type="text" 
                name="codigoPostal"
                value={formData.codigoPostal}
                onChange={handleInputChange}
                required 
              />
              {errors.codigoPostal && <span className="error-message">{errors.codigoPostal}</span>}
            </label>
            
            <label>
              Estado *
              <input 
                type="text" 
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                required 
              />
              {errors.estado && <span className="error-message">{errors.estado}</span>}
            </label>
            
            <label>
              Municipio *
              <input 
                type="text" 
                name="municipio"
                value={formData.municipio}
                onChange={handleInputChange}
                required 
              />
              {errors.municipio && <span className="error-message">{errors.municipio}</span>}
            </label>
            
            <label>
              Colonia *
              <input 
                type="text" 
                name="colonia"
                required
                value={formData.colonia}
                onChange={handleInputChange}
              />
            </label>
            
            <label style={{ gridColumn: '1 / -1' }}>
              Referencias para entrega (opcional)
              <textarea 
                maxLength={150}
                name="referencias"
                value={formData.referencias}
                onChange={handleInputChange}
              ></textarea>
            </label>
          </div>
        </fieldset>

        {/* Sección: Contacto */}
        <fieldset>
          <legend>Contacto</legend>
          <div className="form-grid">
            <label>
              Nombre *
              <input 
                type="text" 
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required 
              />
              {errors.nombre && <span className="error-message">{errors.nombre}</span>}
            </label>
            
            <label>
              Apellido *
              <input 
                type="text" 
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                required 
              />
              {errors.apellido && <span className="error-message">{errors.apellido}</span>}
            </label>
            
            <label>
              Teléfono *
              <input 
                type="tel" 
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                required 
              />
              {errors.telefono && <span className="error-message">{errors.telefono}</span>}
            </label>
            
            <label>
              Correo electrónico *
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </label>
            
            <label>
              Contraseña *
              <input 
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </label>
          </div>
        </fieldset>
        
        <p className="login-text">¿Ya haz registrado tus datos antes?{' '}
          <span className="login-link" onClick={() => navigate('/login')}>
            Inicia sesión
          </span>
        </p>
        <button 
          type="submit" 
          className={`continue-btn ${isFormValid() ? 'active' : ''}`}
          disabled={!isFormValid()}
        >
          Continuar al Pago
        </button>
      </form>
    </div>
  );
};

export default Reg_Compra;

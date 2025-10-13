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

  if (validateForm()) {
    try {
      const response = await fetch('/api/usuarios', { // ruta relativa, proxy de Vite la redirige
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          referencias: formData.referencias,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Usuario guardado correctamente');
        navigate('/checkout', { state: { customerData: formData } });
      } else {
        alert(`Error al guardar: ${data.mensaje || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al enviar datos:', error);
      alert('Error de conexión con el servidor');
    }
  }
};



  /*const handleSubmit = async (e) => {
  e.preventDefault();

  if (validateForm()) {
    try {
      const response = await fetch('http://172.23.185.97:3000/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          referencias: formData.referencias,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Usuario guardado correctamente');
        navigate('/checkout', { state: { customerData: formData } });
      } else {
        alert(`Error al guardar: ${data.mensaje || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al enviar datos:', error);
      alert('Error de conexión con el servidor');
    }
  }
};*/


  /*const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Pasar los datos al CheckoutForm a través del estado de navegación
      navigate('/checkout', { 
        state: { 
          customerData: formData 
        } 
      });
    }
  };*/

  /*const handleSubmit = async (e) => {
  e.preventDefault();

  if (validateForm()) {
    try {
      // Enviar los datos al backend
      //no usamos localhost porque desde Windows donde corre vite no apunta a wsl
      const response = await fetch('http://172.23.185.97:3000/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          referencias: formData.referencias,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Usuario guardado correctamente');
        // Opcional: pasar los datos al checkout
        navigate('/checkout', { state: { customerData: formData } });
      } else {
        alert(`Error al guardar: ${data.mensaje || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al enviar datos:', error);
      alert('Error de conexión con el servidor');
    }
  }
};*/


  const isFormValid = () => {
    return (
      formData.direccion.trim() &&
      formData.codigoPostal.trim() &&
      formData.estado.trim() &&
      formData.municipio.trim() &&
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
              Colonia
              <input 
                type="text" 
                name="colonia"
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
              Correo electrónico (opcional)
              <input 
                type="email" 
                name="email"
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

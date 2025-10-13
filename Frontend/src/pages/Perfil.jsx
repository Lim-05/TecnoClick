import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Perfil.css';

const Perfil = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    direccion: '', codigoPostal: '', estado: '', municipio: '', colonia: '', referencias: '',
    nombre: '', apellido: '', telefono: '', email: '', password: ''
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClick = () => setIsEditing(true);
  const handleSaveClick = () => {
    console.log('Guardando datos del usuario:', formData);
    setIsEditing(false);
  };

  const handleLogout = () => {
    console.log('Cerrar sesión'); 
    navigate('/login');
  };

return (
  <div className="perfil-page">
    <div className="perfil-container">
      <h4>Mi Perfil</h4>

      <fieldset>
        <legend>Domicilio</legend>
        <div className="form-grid">
          {['direccion','codigoPostal','estado','municipio','colonia','referencias'].map(field => (
            <label key={field}>
              {field === 'referencias' ? 'Referencias (opcional)' : field.charAt(0).toUpperCase() + field.slice(1)}
              <input
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Contacto</legend>
        <div className="form-grid">
          {['nombre','apellido','telefono','email','password'].map(field => (
            <label key={field}>
              {field.charAt(0).toUpperCase() + field.slice(1)}
              <input
                type={field === 'password' ? 'password' : 'text'}
                name={field}
                value={formData[field]}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </label>
          ))}
        </div>
      </fieldset>

      {!isEditing ? (
        <button className="continue-btn active" onClick={handleEditClick}>Editar</button>
      ) : (
        <button className="continue-btn active" onClick={handleSaveClick}>Guardar Cambios</button>
      )}

      <div className="sidebar-right">
        <Link to="/cart" title="Carrito">Carr</Link>
        <Link to="/favorites" title="Favoritos">Fav</Link>
        <button onClick={handleLogout} title="Cerrar sesión" style={{border:'none', fontSize:'1.5rem', cursor:'pointer'}}>CS</button>
      </div>
    </div>
  </div>
);
};

export default Perfil;

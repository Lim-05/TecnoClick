import React, { useEffect, useState } from 'react'; //
import { Link, useNavigate } from 'react-router-dom';
import './Perfil.css';

const Perfil = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null); // aqui se guarda el usuario desde el localStorage
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    apellido_usuario: '',
    telefono_usuario: '',
    correo_usuario: '',
    direccion_usuario: '',
    codigo_postal: '',
    estado_usuario: '',
    municipio_usuario: '',
    colonia_usuario: '',
    contrasena: '',
    referencias: ''
    });

  //manejo de inputs
  const handleInputChange = (e) => { //funcion que se ejecuta cada vez que se cambia un input
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Cargar datos del usuario desde localStorage al montar el componente
  useEffect(() => {
    const data = localStorage.getItem('usuario'); //recupera los datos del usuario guardados
    if (data) {
      const usuarioData = JSON.parse(data); //convierte la cadena JSON a un objeto
      setUsuario(usuarioData); //actualiza el estado del usuario
      setFormData({
        nombre_usuario: usuarioData.nombre_usuario || '',
        apellido_usuario: usuarioData.apellido_usuario || '',
        telefono_usuario: usuarioData.telefono_usuario || '',
        correo_usuario: usuarioData.correo_usuario || '',
        direccion_usuario: usuarioData.direccion_usuario || '',
        codigo_postal: usuarioData.codigo_postal || '',
        estado_usuario: usuarioData.estado_usuario || '',
        municipio_usuario: usuarioData.municipio_usuario || '',
        colonia_usuario: usuarioData.colonia_usuario || '',
        referencias: usuarioData.referencias || ''
      });
    }
  }, []);

  //activar edicion
  const handleEditClick = () => setIsEditing(true);

  //guardar cambios loclamente
  const handleSaveClick = () => {
    setIsEditing(false);
    setUsuario(formData); // actualizar estado del usuario
    localStorage.setItem('usuario', JSON.stringify(formData)); // guardar en localStorage
    console.log('Guardando datos del usuario:', formData);
  };

  //cerrar sesion
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
          {['direccion_usuario','codigo_postal','estado_usuario','municipio_usuario','colonia_usuario','referencias'].map(field => (
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
          {['nombre_usuario','apellido_usuario','telefono_usuario','correo_usuario','contrasena'].map(field => (
            <label key={field}>
              {field.charAt(0).toUpperCase() + field.slice(1)}
              <input
                type="text"
                //type={field === 'contrasena' ? 'password' : 'text'}
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
        <Link to="/favoritos" title="Favoritos">Fav</Link>
        <button onClick={handleLogout} title="Cerrar sesión" style={{border:'none', fontSize:'1.5rem', cursor:'pointer'}}>CS</button>
      </div>
    </div>
  </div>
);
};

export default Perfil;
import React, { useEffect, useState } from 'react'; //
import { Link, useNavigate } from 'react-router-dom';
import { getToken } from '../utils/authUtils';
import './Perfil.css';
import Modal from '../components/common/Modal';

const Perfil = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null); // aqui se guarda el usuario desde el localStorage
  const [isEditing, setIsEditing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('success'); // 'success' o 'error'
  const [showNotification, setShowNotification] = useState(false);

  
  const [formData, setFormData] = useState({
    id_usuario: '',
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
    //localStorage.removeItem('usuario')
    const data = localStorage.getItem('usuario'); //recupera los datos del usuario guardados
    if (data) {
      const usuarioData = JSON.parse(data); //convierte la cadena JSON a un objeto
      setUsuario(usuarioData); //actualiza el estado del usuario
      setFormData({
        id_usuario: usuarioData.id_usuario, 
        nombre_usuario: usuarioData.nombre_usuario || '',
        apellido_usuario: usuarioData.apellido_usuario || '',
        telefono_usuario: usuarioData.telefono_usuario || '',
        correo_usuario: usuarioData.correo_usuario || '',
        direccion_usuario: usuarioData.direccion_usuario || '',
        codigo_postal: usuarioData.codigo_postal || '',
        estado_usuario: usuarioData.estado_usuario || '',
        municipio_usuario: usuarioData.municipio_usuario || '',
        colonia_usuario: usuarioData.colonia_usuario || '',
        referencias: usuarioData.referencias || '',
        contrasena: usuarioData.contrasena || ''
      });
    }
  }, []);

  //activar edicion
  const handleEditClick = () => setIsEditing(true);

  //guardar cambios loclamente
  const handleSaveClick = async (e) => {
    e.preventDefault();

    const id = formData.id_usuario || usuario?.id_usuario; //respaldo
    if(!id) return console.error('ID de usuario no disponible');
      try {
        const token = getToken();
        const response = await fetch(`http://localhost:3000/api/usuarios/${formData.id_usuario}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
          nombre_usuario: formData.nombre_usuario,
          apellido_usuario: formData.apellido_usuario,
          telefono_usuario: formData.telefono_usuario,
          correo_usuario: formData.correo_usuario,
          direccion_usuario: formData.direccion_usuario,
          contrasena: formData.contrasena,
          codigo_postal: formData.codigo_postal,
          estado_usuario: formData.estado_usuario,
          municipio_usuario: formData.municipio_usuario,
          colonia_usuario: formData.colonia_usuario,
          referencias: formData.referencias,
        })
      });

      if (response.ok) {
        const updateUser = { ...usuario, ...formData };
        localStorage.setItem('usuario', JSON.stringify(updateUser));
        setUsuario(updateUser);
        setIsEditing(false);
        
        //mostrar notificación de éxito al editar los datos
        setShowNotification(true);
        
        //ocultar notificación después de 4 segundos
        setTimeout(() => {
          setShowNotification(false);
        }, 4000);
      } else {
        alert('Error al actualizar los datos del usuario');
      }
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
    }
  };
  //cerrar sesion
  const handleLogout = () => {
    console.log('Cerrar sesión');
    localStorage.removeItem('usuario'); // elimina los datos del usuario guardado
  // Disparar evento personalizado para notificar al contexto
    window.dispatchEvent(new Event('usuarioChange'));
    navigate('/'); // redirige a la página principal
  };


return (
  <div className="perfil-page">
    {/* Notificación de datos actualizados */}
    {showNotification && (
      <div className="update-notification">
        <div className="update-notification-content">
          <span className="update-notification-icon">✓</span>
          <div className="update-notification-text">
            <strong>¡Datos actualizados!</strong>
            <p>Tu información ha sido guardada correctamente</p>
          </div>
        </div>
      </div>
    )}
    
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
        <Link to="/historial-compras" title="Historial de Compras">His</Link>
        <Link to="/Tarjetas" title="Tarjetas">Tarj</Link>
        <button onClick={handleLogout} title="Cerrar sesión" style={{border:'none', fontSize:'1.5rem', cursor:'pointer'}}>CS</button>
      </div>
    </div>
  </div>
);
};

export default Perfil;
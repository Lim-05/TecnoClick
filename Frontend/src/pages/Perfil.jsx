import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getToken, logout } from '../utils/authUtils';
import './Perfil.css';

const CAMPOS_CONTACTO = [
  { name: 'nombre_usuario', label: 'Nombre', autoComplete: 'given-name' },
  { name: 'apellido_usuario', label: 'Apellido', autoComplete: 'family-name' },
  { name: 'telefono_usuario', label: 'Teléfono', type: 'tel', autoComplete: 'tel' },
  { name: 'correo_usuario', label: 'Correo electrónico', type: 'email', autoComplete: 'email' },
  { name: 'contrasena', label: 'Nueva contraseña', type: 'password', autoComplete: 'new-password', placeholder: 'Déjala vacía para conservar la actual' },
];

const CAMPOS_DOMICILIO = [
  { name: 'direccion_usuario', label: 'Calle y número', full: true },
  { name: 'codigo_postal', label: 'Código postal', autoComplete: 'postal-code' },
  { name: 'colonia_usuario', label: 'Colonia' },
  { name: 'municipio_usuario', label: 'Municipio' },
  { name: 'estado_usuario', label: 'Estado' },
  { name: 'referencias', label: 'Referencias (opcional)', full: true },
];

const ATAJOS = [
  { to: '/cart', label: 'Carrito', icon: 'M3 4h2l2.4 11h10.2L20 7H6.2M9 20a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z' },
  { to: '/favoritos', label: 'Favoritos', icon: 'M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.600-7 10-7 10z' },
  { to: '/historial-compras', label: 'Historial de compras', icon: 'M12 7v5l3 2M4 12a8 8 0 108-8 8 8 0 00-6 2.700M4 4v4h4' },
  { to: '/Tarjetas', label: 'Tarjetas', icon: 'M3 7h18v10H3zM3 10.500h18M6.500 14.500H10' },
];

const Icono = ({ d }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
       strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const armarFormulario = (u = {}) => ({
  id_usuario: u.id_usuario || '',
  nombre_usuario: u.nombre_usuario || '',
  apellido_usuario: u.apellido_usuario || '',
  telefono_usuario: u.telefono_usuario || '',
  correo_usuario: u.correo_usuario || '',
  direccion_usuario: u.direccion_usuario || '',
  codigo_postal: u.codigo_postal || '',
  estado_usuario: u.estado_usuario || '',
  municipio_usuario: u.municipio_usuario || '',
  colonia_usuario: u.colonia_usuario || '',
  referencias: u.referencias || '',
  contrasena: '', // nunca se guarda en localStorage
});

const Perfil = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [formData, setFormData] = useState(armarFormulario());

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const data = localStorage.getItem('usuario');
    if (data) {
      const usuarioData = JSON.parse(data);
      setUsuario(usuarioData);
      setFormData(armarFormulario(usuarioData));
    }
  }, []);

  const handleCancelClick = () => {
    setFormData(armarFormulario(usuario));
    setIsEditing(false);
  };

  const handleSaveClick = async (e) => {
    e.preventDefault();
    const id = formData.id_usuario || usuario?.id_usuario;
    if (!id) return console.error('ID de usuario no disponible');

    // No enviamos la contraseña si el campo está vacío
    const { id_usuario, contrasena, ...resto } = formData;
    const body = contrasena ? { ...resto, contrasena } : resto;

    try {
      const response = await fetch(`https://localhost:3000/api/usuarios/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        const updateUser = { ...usuario, ...data.usuario };
        localStorage.setItem('usuario', JSON.stringify(updateUser));
        window.dispatchEvent(new Event('usuarioChange'));
        setUsuario(updateUser);
        setFormData(armarFormulario(updateUser));
        setIsEditing(false);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 4000);
      } else {
        alert('Error al actualizar los datos del usuario');
      }
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
    }
  };

  const handleLogout = () => {
    logout();
    window.dispatchEvent(new Event('usuarioChange'));
    navigate('/');
  };

  const iniciales =
    `${formData.nombre_usuario[0] || ''}${formData.apellido_usuario[0] || ''}`.toUpperCase() || '?';

  const renderCampo = ({ name, label, type = 'text', full, ...resto }) => (
    <div key={name} className={`campo${full ? ' campo-full' : ''}`}>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={formData[name]}
        onChange={handleInputChange}
        disabled={!isEditing}
        {...resto}
      />
    </div>
  );

  return (
    <div className="perfil-page">
      {showNotification && (
        <div className="perfil-toast" role="status">
          <span className="perfil-toast-icono">✓</span>
          <div>
            <strong>Datos actualizados</strong>
            <p>Guardamos tu información correctamente.</p>
          </div>
        </div>
      )}

      <div className="perfil-layout">
        <aside className="perfil-lateral">
          <div className="perfil-identidad">
            <div className="perfil-avatar" aria-hidden="true">{iniciales}</div>
            <div className="perfil-identidad-texto">
              <h1>{`${formData.nombre_usuario} ${formData.apellido_usuario}`.trim() || 'Mi perfil'}</h1>
              <span>{formData.correo_usuario}</span>
            </div>
          </div>

          <nav className="perfil-nav" aria-label="Mi cuenta">
            {ATAJOS.map(({ to, label, icon }) => (
              <Link key={to} to={to}><Icono d={icon} />{label}</Link>
            ))}
            <button type="button" className="perfil-salir" onClick={handleLogout}>
              <Icono d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />
              Cerrar sesión
            </button>
          </nav>
        </aside>

        <form className="perfil-contenido" onSubmit={handleSaveClick}>
          <header className="perfil-encabezado">
            <div>
              <h2>Mis datos</h2>
              <p>{isEditing ? 'Edita lo que necesites y guarda los cambios.' : 'Revisa y actualiza tu información de contacto y envío.'}</p>
            </div>
            {!isEditing && (
              <button type="button" className="btn btn-primario" onClick={() => setIsEditing(true)}>
                Editar datos
              </button>
            )}
          </header>

          <section className="perfil-seccion">
            <h3>Contacto</h3>
            <div className="form-grid">{CAMPOS_CONTACTO.map(renderCampo)}</div>
          </section>

          <section className="perfil-seccion">
            <h3>Domicilio de envío</h3>
            <div className="form-grid">{CAMPOS_DOMICILIO.map(renderCampo)}</div>
          </section>

          {isEditing && (
            <div className="perfil-acciones">
              <button type="button" className="btn btn-secundario" onClick={handleCancelClick}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primario">Guardar cambios</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Perfil;

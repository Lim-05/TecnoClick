import React, { useEffect, useState } from "react";
import Modal from "../../components/common/Modal";
import "./UsuariosAdmin.css";

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre_usuario: "",
    apellido_usuario: "",
    telefono_usuario: "",
    correo_usuario: "",
    direccion_usuario: "",
    codigo_postal: "",
    estado_usuario: "",
    municipio_usuario: "",
    colonia_usuario: "",
    referencias: "",
  });

  // 🔹 Obtener todos los usuarios (solo datos necesarios para la tabla)
  const obtenerUsuarios = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/usuarios");
      const data = await res.json();
      setUsuarios(data);
      setCargando(false);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  // 🔹 Abrir modal y traer datos completos del usuario
  const abrirModalEdicion = async (usuario) => {
    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${usuario.id_usuario}`);
      const data = await res.json();
      const u = data.usuario; // datos completos del usuario

      setUsuarioEditando(u);
      setFormData({
        nombre_usuario: u.nombre_usuario || "",
        apellido_usuario: u.apellido_usuario || "",
        telefono_usuario: u.telefono_usuario || "",
        correo_usuario: u.correo_usuario || "",
        direccion_usuario: u.direccion_usuario || "",
        codigo_postal: u.codigo_postal || "",
        estado_usuario: u.estado_usuario || "",
        municipio_usuario: u.municipio_usuario || "",
        colonia_usuario: u.colonia_usuario || "",
        referencias: u.referencias || "",
      });

      setModalAbierto(true);
    } catch (error) {
      console.error("Error al obtener usuario para edición:", error);
    }
  };

  // 🔹 Cerrar modal
  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioEditando(null);
  };

  // 🔹 Manejar cambios en inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Guardar cambios en la base de datos
  const guardarCambios = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/usuarios/${usuarioEditando.id_usuario}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (res.ok) {
        const data = await res.json();
        // Actualizar usuario en estado local
        setUsuarios(
          usuarios.map((u) =>
            u.id_usuario === usuarioEditando.id_usuario ? data.usuario : u
          )
        );
        cerrarModal();
      } else {
        const errorData = await res.json();
        alert(errorData.mensaje || "Error al actualizar usuario");
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  };

  if (cargando) return <p>Cargando usuarios...</p>;

  return (
    <div className="usuarios-admin-page">
      <div className="usuarios-admin-container">
        <h4>Gestión de Usuarios</h4>

        {usuarios.length === 0 ? (
          <p>No hay usuarios registrados.</p>
        ) : (
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id_usuario}>
                  <td>{u.id_usuario}</td>
                  <td>{u.nombre_usuario}</td>
                  <td>{u.correo_usuario}</td>
                  <td>{u.estado_usuario}</td>
                  <td>
                    <button
                      className="btn-editar"
                      onClick={() => abrirModalEdicion(u)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de edición */}
      <Modal isOpen={modalAbierto} onClose={cerrarModal}>
        <h3>Editar Usuario</h3>
        {usuarioEditando && (
          <>
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                name="nombre_usuario"
                value={formData.nombre_usuario}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Apellido:</label>
              <input
                type="text"
                name="apellido_usuario"
                value={formData.apellido_usuario}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Teléfono:</label>
              <input
                type="text"
                name="telefono_usuario"
                value={formData.telefono_usuario}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Correo:</label>
              <input
                type="email"
                name="correo_usuario"
                value={formData.correo_usuario}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Dirección:</label>
              <input
                type="text"
                name="direccion_usuario"
                value={formData.direccion_usuario}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Código postal:</label>
              <input
                type="text"
                name="codigo_postal"
                value={formData.codigo_postal}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Estado:</label>
              <input
                type="text"
                name="estado_usuario"
                value={formData.estado_usuario}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Municipio:</label>
              <input
                type="text"
                name="municipio_usuario"
                value={formData.municipio_usuario}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Colonia:</label>
              <input
                type="text"
                name="colonia_usuario"
                value={formData.colonia_usuario}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Referencias:</label>
              <input
                type="text"
                name="referencias"
                value={formData.referencias}
                onChange={handleChange}
              />
            </div>

            <div className="modal-buttons">
              <button className="btn-guardar" onClick={guardarCambios}>
                Guardar cambios
              </button>
              <button className="btn-cancelar" onClick={cerrarModal}>
                Cancelar
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default UsuariosAdmin;

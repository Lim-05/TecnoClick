import React, { useEffect, useState } from "react";
import "./UsuariosAdmin.css";

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Obtener usuarios
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

  const eliminarUsuario = async (id) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar este usuario?");
    if (!confirmar) return;

    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsuarios(usuarios.filter((u) => u.id_usuario !== id));
      } else {
        const errorData = await res.json();
        alert(errorData.mensaje || "Error al eliminar usuario");
      }
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  if (cargando) {
    return <p>Cargando usuarios...</p>;
  }

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
                <th>Estado de residencia</th>
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
                      className="btn-eliminar"
                      onClick={() => eliminarUsuario(u.id_usuario)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UsuariosAdmin;

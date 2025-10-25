import React from "react";
import { Link } from "react-router-dom";
import "./AdminHome.css";

const AdminHome = () => {
  const opciones = [
    {
      id: 1,
      titulo: "Gestionar Usuarios",
      ruta: "/admin/usuarios",
      color: "#007bff",
    },
    {
      id: 2,
      titulo: "Gestionar Productos",
      ruta: "/admin/productos",
      color: "#28a745",
    },
    {
      id: 3,
      titulo: "Gestionar Compras",
      ruta: "/admin/ingresos",
      color: "#ffc107",
    },
  ];

  return (
    <div className="admin-home-page">
      <div className="admin-home-container">
        <h4>Panel de Administración</h4>
        <p className="admin-subtitle">Selecciona una sección para gestionar</p>

        <div className="admin-grid">
          {opciones.map((op) => (
            <Link
              key={op.id}
              to={op.ruta}
              className="admin-card"
              style={{ borderTopColor: op.color }}
            >

              <h5>{op.titulo}</h5>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;

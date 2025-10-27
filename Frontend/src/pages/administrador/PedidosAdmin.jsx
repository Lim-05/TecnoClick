import React, { useEffect, useState } from "react";
import "./PedidosAdmin.css";

const PedidoAdmin = () => {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/pedidos/pendientes")
      .then(res => res.json())
      .then(data => setPedidos(data))
      .catch(err => console.error(err));
  }, []);

  const completarPedido = async (id) => {
    if (!window.confirm("¿Marcar este pedido como completado?")) return;

    const response = await fetch(`http://localhost:3000/api/pedidos/${id}/completar`, {
      method: "PUT"
    });

    if (response.ok) {
      setPedidos(pedidos.filter(p => p.id_pedido !== id));
      alert("Pedido completado y registrado en ingresos ✅");
    } else {
      alert("Error al completar el pedido ❌");
    }
  };

  return (
    <div className="pedido-admin-page">
      <h4>Pedidos Pendientes</h4>

      <div className="tabla-container">
        {pedidos.length === 0 ? (
          <p className="mensaje-vacio">No hay pedidos pendientes.</p>
        ) : (
          <table className="pedido-table">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Cliente</th>
                <th>Correo</th>
                <th>Monto</th>
                <th>Fecha</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(p => (
                <tr key={p.id_pedido}>
                  <td>{p.id_pedido}</td>
                  <td>{p.nombre_usuario}</td>
                  <td>{p.correo_usuario}</td>
                  <td>${p.monto_pedido}</td>
                  <td>{new Date(p.fecha_pedido).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-completar"
                      onClick={() => completarPedido(p.id_pedido)}
                    >
                      Completar
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

export default PedidoAdmin;

import React, { useEffect, useState } from "react";
import "./IngresosAdmin.css";

const IngresosAdmin = () => {
  const [ingresosEfectivo, setIngresosEfectivo] = useState([]);
  const [ingresosTarjeta, setIngresosTarjeta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tablaActiva, setTablaActiva] = useState("efectivo");

  useEffect(() => {
    const fetchIngresos = async () => {
      try {
        const resEfectivo = await fetch("http://localhost:3000/api/ingresos/efectivo");
        const dataEfectivo = await resEfectivo.json();

        const resTarjeta = await fetch("http://localhost:3000/api/ingresos/tarjeta");
        const dataTarjeta = await resTarjeta.json();

        setIngresosEfectivo(dataEfectivo);
        setIngresosTarjeta(dataTarjeta);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIngresos();
  }, []);

  if (loading) return <p className="loading">Cargando ingresos...</p>;
  if (error) return <p className="error">⚠️ {error}</p>;

  const renderTabla = (ingresos) => (
    <table className="ingresos-table">
      <thead>
        <tr>
          <th>Usuario</th>
          <th>Correo</th>
          <th>Fecha de ingreso</th>
          <th>Folio</th>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {ingresos.length === 0 ? (
          <tr><td colSpan="7">No hay registros</td></tr>
        ) : (
          ingresos.map((i, index) => {
            // Formatear fecha solo como YYYY-MM-DD
            const fechaFormateada = new Date(i.fecha_ingreso).toISOString().split("T")[0];

            return (
              <tr key={index}>
                <td>{i.cliente}</td>
                <td>{i.correo_usuario}</td>
                <td>{fechaFormateada}</td>
                <td>{i.folio_pago}</td>
                <td>{i.producto}</td>
                <td>{i.cantidad}</td>
                <td>${i.subtotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );


  return (
    <div className="ingresos-admin-page">
      <h4>Gestión de Ingresos</h4>
      <div className="botones-tabla">
        <button className={tablaActiva === "efectivo" ? "activo" : ""} onClick={() => setTablaActiva("efectivo")}>
          Ingresos en Efectivo
        </button>
        <button className={tablaActiva === "tarjeta" ? "activo" : ""} onClick={() => setTablaActiva("tarjeta")}>
          Ingresos con Tarjeta
        </button>
      </div>
      <div className="tabla-container">
        {tablaActiva === "efectivo" ? renderTabla(ingresosEfectivo) : renderTabla(ingresosTarjeta)}
      </div>
    </div>
  );
};

export default IngresosAdmin;

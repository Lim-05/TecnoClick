import React, { useEffect, useState } from "react";
import "./TarjetaForm.css";

const TarjetaForm = () => {
  const [tarjeta, setTarjeta] = useState(null);

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) return;

    fetch(`http://localhost:3000/api/datos_tarjeta/${usuario.id_usuario}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Datos recibidos del backend:", data);

        if (data && data.id_tarjeta) {
          setTarjeta(data);
        } else {
          setTarjeta(null);
          console.log("No hay tarjeta registrada");
        }
      })
      .catch((err) => console.error("Error cargando tarjeta:", err));
  }, []);

  return (
    <div className="tarjeta-page">
      <div className="tarjeta-container">
        <h4>Mi Tarjeta Registrada</h4>

        {tarjeta ? (
          <form className="tarjeta-form">
            <label>
              Número de Tarjeta
              <input type="text" value={tarjeta.numero_tarjeta} disabled />
            </label>

            <label>
              Nombre del Titular
              <input type="text" value={tarjeta.nombre_titular} disabled />
            </label>

            <label>
              Fecha de Expiración
              <input type="text" value={tarjeta.fecha_vencimiento} disabled />
            </label>

            <label>
              CVV
              <input type="password" value={tarjeta.cvv} disabled />
            </label>
          </form>
        ) : (
          <p>No tienes ninguna tarjeta registrada.</p>
        )}
      </div>
    </div>
  );
};

export default TarjetaForm;

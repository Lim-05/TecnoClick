import React, { useEffect, useState } from "react";
import "./TarjetaForm.css";

const TarjetaForm = () => {
const [tarjetas, setTarjetas] = useState([]); // 🔹 Ahora manejamos un array

useEffect(() => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const token = localStorage.getItem("token");
  if (!usuario || !token) return;

  fetch(`http://localhost:3000/api/datos_tarjeta/${usuario.id_usuario}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return res.json();
    })
    .then((data) => {
  console.log("Datos recibidos del backend:", data);

  let tarjetasArray = [];

  if (Array.isArray(data)) {
    tarjetasArray = data;
  } else if (data && Array.isArray(data.tarjetas)) {
    tarjetasArray = data.tarjetas;
  } else if (data && data.id_tarjeta) {
    tarjetasArray = [data];
  }

  setTarjetas(tarjetasArray);
  console.log("Tarjetas cargadas:", tarjetasArray);
})

    .catch((err) => console.error("Error cargando tarjetas:", err));
}, []);

  return (
    <div className="tarjeta-page">
      <div className="tarjeta-container">
        <h4>Mis Tarjetas Registradas</h4>

        {tarjetas.length > 0 ? (
          tarjetas.map((tarjeta, index) => (
            <form key={index} className="tarjeta-form">
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
          ))
        ) : (
          <p>No tienes ninguna tarjeta registrada.</p>
        )}
      </div>
    </div>
  );
};

export default TarjetaForm;

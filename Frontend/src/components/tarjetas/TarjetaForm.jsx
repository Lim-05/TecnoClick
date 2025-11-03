import React, { useEffect, useState } from "react";
import "./TarjetaForm.css";

const TarjetaForm = () => {
  const [tarjetas, setTarjetas] = useState([]);

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

  // Función para formatear el número de tarjeta (mostrar solo últimos 4 dígitos)
  const formatCardNumber = (cardNumber) => {
    if (!cardNumber) return "**** **** **** ****";
    const lastFour = cardNumber.slice(-4);
    return `**** **** **** ${lastFour}`;
  };

  // Función para determinar el tipo de tarjeta basado en el número
  const getCardType = (cardNumber) => {
    if (!cardNumber) return "Tarjeta";
    
    if (/^4/.test(cardNumber)) return "Visa";
    if (/^5[1-5]/.test(cardNumber)) return "Mastercard";
    if (/^3[47]/.test(cardNumber)) return "American Express";
    if (/^6(?:011|5)/.test(cardNumber)) return "Discover";
    
    return "Tarjeta";
  };

  return (
    <div className="tarjeta-page">
      <div className="tarjeta-container">
        <h4>Mis Tarjetas Registradas</h4>

        {tarjetas.length > 0 ? (
          <div className="tarjetas-grid">
            {tarjetas.map((tarjeta, index) => (
              <div key={index} className="tarjeta-card">
                <div className="tarjeta-header">
                  <div className="tarjeta-tipo">{getCardType(tarjeta.numero_tarjeta)}</div>
                  <div className="tarjeta-chip"></div>
                </div>
                
                <div className="tarjeta-numero">
                  {formatCardNumber(tarjeta.numero_tarjeta)}
                </div>
                
                <div className="tarjeta-info">
                  <div className="tarjeta-titular">
                    <span className="label">Titular</span>
                    <span className="value">{tarjeta.nombre_titular || "No especificado"}</span>
                  </div>
                  
                  <div className="tarjeta-detalles">
                    <div className="tarjeta-vencimiento">
                      <span className="label">Vence</span>
                      <span className="value">{tarjeta.fecha_vencimiento || "--/--"}</span>
                    </div>
                    
                    <div className="tarjeta-cvv">
                      <span className="label">CVV</span>
                      <span className="value">***</span>
                    </div>
                  </div>
                </div>
                
                <div className="tarjeta-acciones">
                  <button className="btn-eliminar">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-tarjetas">
            <p>No tienes ninguna tarjeta registrada.</p>
            <button className="btn-agregar">Agregar Tarjeta</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TarjetaForm;
import { authFetch } from '../../utils/authFetch.js';
import React, { useEffect, useState } from "react";
import "./TarjetaForm.css";

const TarjetaForm = () => {
  const [tarjetas, setTarjetas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState("");

  const [nuevaTarjeta, setNuevaTarjeta] = useState({
    nombre_titular: "",
    numero_tarjeta: "",
    fecha_vencimiento: "",
    cvv: ""
  });

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "null");


    if (!usuario?.id_usuario) return;;

    authFetch(`/api/datos_tarjeta/${usuario.id_usuario}`, {
      credentials: 'include'
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

  const guardarTarjeta = async (event) => {
    event.preventDefault();

    if (guardando) return;

    setErrorFormulario("");
    setGuardando(true);

    try {
      const respuesta = await authFetch("/api/datos_tarjeta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tarjeta: {
            ...nuevaTarjeta,
            nombre_titular: nuevaTarjeta.nombre_titular.trim(),
            numero_tarjeta: nuevaTarjeta.numero_tarjeta.replace(/\s/g, "")
          }
        })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.error || datos.mensaje || "No se pudo guardar la tarjeta."
        );
      }

      // Recarga para consultar las tarjetas guardadas desde el backend.
      window.location.reload();
    } catch (error) {
      setErrorFormulario(error.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="tarjeta-page">
      <div className="tarjeta-container">
        <h4>Mis Tarjetas Registradas</h4>
        <button
          type="button"
          className="btn-agregar"
          disabled={guardando}
          onClick={() => {
            setErrorFormulario("");
            setMostrarFormulario((actual) => !actual);
          }}
        >
          {mostrarFormulario ? "Cerrar formulario" : "Agregar Tarjeta"}
        </button>

        {mostrarFormulario && (
          <form onSubmit={guardarTarjeta}>
            <h3>Nueva tarjeta de prueba</h3>

            <div>
              <label htmlFor="tarjeta-titular">Titular</label>
              <input
                id="tarjeta-titular"
                type="text"
                maxLength={150}
                required
                disabled={guardando}
                value={nuevaTarjeta.nombre_titular}
                onChange={(e) =>
                  setNuevaTarjeta({
                    ...nuevaTarjeta,
                    nombre_titular: e.target.value
                  })
                }
              />
            </div>

            <div>
              <label htmlFor="tarjeta-numero">Número de tarjeta</label>
              <input
                id="tarjeta-numero"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{13,19}"
                minLength={13}
                maxLength={19}
                placeholder="Número ficticio, sin espacios"
                required
                disabled={guardando}
                value={nuevaTarjeta.numero_tarjeta}
                onChange={(e) =>
                  setNuevaTarjeta({
                    ...nuevaTarjeta,
                    numero_tarjeta: e.target.value.replace(/\D/g, "")
                  })
                }
              />
            </div>

            <div>
              <label htmlFor="tarjeta-vencimiento">Vencimiento</label>
              <input
                id="tarjeta-vencimiento"
                type="text"
                placeholder="MM/AA"
                pattern="(0[1-9]|1[0-2])/[0-9]{2}"
                maxLength={5}
                required
                disabled={guardando}
                value={nuevaTarjeta.fecha_vencimiento}
                onChange={(e) =>
                  setNuevaTarjeta({
                    ...nuevaTarjeta,
                    fecha_vencimiento: e.target.value
                  })
                }
              />
            </div>

            <div>
              <label htmlFor="tarjeta-cvv">CVV de prueba</label>
              <input
                id="tarjeta-cvv"
                type="password"
                inputMode="numeric"
                pattern="[0-9]{3,4}"
                maxLength={4}
                required
                disabled={guardando}
                value={nuevaTarjeta.cvv}
                onChange={(e) =>
                  setNuevaTarjeta({
                    ...nuevaTarjeta,
                    cvv: e.target.value.replace(/\D/g, "")
                  })
                }
              />
            </div>

            {errorFormulario && (
              <p role="alert">{errorFormulario}</p>
            )}

            <button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar tarjeta"}
            </button>
          </form>
        )}

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
          </div>
        )}
      </div>
    </div>
  );
};

export default TarjetaForm;
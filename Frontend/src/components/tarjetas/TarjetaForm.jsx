import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TarjetaForm.css";

const TarjetaForm = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [tarjeta, setTarjeta] = useState(null);

  const [formData, setFormData] = useState({
    id_tarjeta: "",
    numero_tarjeta: "",
    nombre_titular: "",
    fecha_vencimiento: "",
    cvv: "",
  });

  // Cargar datos de tarjeta desde la API 
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) return;

    fetch(`http://localhost:3000/api/datos_tarjeta/${usuario.id_usuario}`)
      .then(res => res.json())
      .then(data => {
        console.log("Datos recibidos del backend:", data);

        // Si recibes un objeto directo, basta con verificar que tenga id_tarjeta
        if (data && data.id_tarjeta) {
          setTarjeta(data);
          setFormData({
            id_tarjeta: data.id_tarjeta,
            numero_tarjeta: data.numero_tarjeta,
            nombre_titular: data.nombre_titular,
            fecha_vencimiento: data.fecha_vencimiento,
            cvv: data.cvv
          });
        } else {
          setTarjeta(null);
          console.log("No hay tarjeta registrada");
        }
      })
      .catch(err => console.error('Error cargando tarjeta:', err));
  }, []);


  // Manejar cambios de inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Activar modo edición
  const handleEditClick = () => setIsEditing(true);

  // Guardar cambios
  const handleSaveClick = async (e) => {
    e.preventDefault();

    const id = formData.id_tarjeta || tarjeta?.id_tarjeta;
    if (!formData.id_tarjeta) return alert("No hay tarjeta para actualizar.");

    try {
      const res = await fetch(`http://localhost:3000/api/datos_tarjeta/${formData.id_tarjeta}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            numero_tarjeta: formData.numero_tarjeta,
            nombre_titular: formData.nombre_titular,
            fecha_vencimiento: formData.fecha_vencimiento,
            cvv: formData.cvv,
          }),
        }
      );

      if (res.ok) {
        alert("Datos de tarjeta actualizados correctamente.");
        setIsEditing(false);
      } else {
        alert("Error al actualizar la tarjeta.");
      }
    } catch (error) {
      console.error("Error guardando tarjeta:", error);
    }
  };

  return (
    <div className="tarjeta-page">
      <div className="tarjeta-container">
        <h4>Mi Tarjeta Registrada</h4>

        {tarjeta ? (
          <form className="tarjeta-form">
            <label>
              Número de Tarjeta
              <input
                type="text"
                name="numero_tarjeta"
                value={formData.numero_tarjeta}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </label>

            <label>
              Nombre del Titular
              <input
                type="text"
                name="nombre_titular"
                value={formData.nombre_titular}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </label>

            <label>
              Fecha de Expiración
              <input
                type="text"
                name="fecha_vencimiento"
                value={formData.fecha_vencimiento}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="MM/AA"
              />
            </label>

            <label>
              CVV
              <input
                type="password"
                name="cvv"
                value={formData.cvv}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </label>

            {!isEditing ? (
              <button type="button" className="continue-btn active" onClick={handleEditClick}>
                Editar
              </button>
            ) : (
              <button type="button" className="continue-btn active" onClick={handleSaveClick}>
                Guardar Cambios
              </button>
            )}
          </form>
        ) : (
          <p>No tienes ninguna tarjeta registrada.</p>
        )}
      </div>
    </div>
  );
};

export default TarjetaForm;

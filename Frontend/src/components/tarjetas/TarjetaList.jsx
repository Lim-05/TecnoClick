import React, { useEffect, useState } from 'react';
import TarjetaForm from './TarjetaForm';

const TarjetaList = ({ userId, onSelectTarjeta }) => {
  const [tarjetas, setTarjetas] = useState([]);
  const [editingTarjeta, setEditingTarjeta] = useState(null);

  const fetchTarjetas = async () => {
    const res = await fetch(`http://localhost:3000/api/datos_tarjeta/${userId}`);
    const data = await res.json();
    setTarjetas(data);
  };

  useEffect(() => { fetchTarjetas(); }, []);

  const handleEdit = t => setEditingTarjeta(t);
  const handleDelete = async id_tarjeta => {
    await fetch(`http://localhost:3000/api/datos_tarjeta/${userId}/${id_tarjeta}`, { method: 'DELETE' });
    fetchTarjetas();
  };

  return (
    <div>
      <ul>
        {tarjetas.map(t => (
          <li key={t.id_tarjeta}>
            **** **** **** {t.numero_tarjeta.slice(-4)} - {t.nombre_titular}
            <button onClick={() => handleEdit(t)}>Editar</button>
            <button onClick={() => handleDelete(t.id_tarjeta)}>Eliminar</button>
            <button onClick={() => onSelectTarjeta(t)}>Usar en compra</button>
          </li>
        ))}
      </ul>

      <h3>{editingTarjeta ? 'Editar Tarjeta' : 'Agregar Tarjeta'}</h3>
      <TarjetaForm 
        userId={userId} 
        tarjeta={editingTarjeta} 
        onFormSubmit={() => { setEditingTarjeta(null); fetchTarjetas(); }} 
      />
    </div>
  );
};

export default TarjetaList;

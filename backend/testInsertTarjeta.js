const pool = require('./config/db'); // asegúrate de que la ruta sea correcta

async function testInsertTarjeta() {
  try {
    const tarjeta = {
      nombre_titular: 'Juan Pérez',
      numero_tarjeta: '1234567812345678',
      fecha_vencimiento: '12/25',
      cvv: '123',
      id_usuario: 1 // asegúrate de usar un id_usuario válido en tu BD
    };

    console.log('Datos a insertar:', tarjeta);

    const query = `
      INSERT INTO datos_tarjeta (nombre_titular, numero_tarjeta, fecha_vencimiento, cvv, id_usuario)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_tarjeta;
    `;
    const values = [tarjeta.nombre_titular, tarjeta.numero_tarjeta, tarjeta.fecha_vencimiento, tarjeta.cvv, tarjeta.id_usuario];

    const result = await pool.query(query, values);
    console.log('Tarjeta insertada con id:', result.rows[0].id_tarjeta);

  } catch (error) {
    console.error('Error insertando tarjeta:', error.message);
  } finally {
    await pool.end(); // cerramos la conexión al final
  }
}

testInsertTarjeta();

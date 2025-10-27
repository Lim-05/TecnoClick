const resenaModel = require('../models/resenaModel');

// Crear una nueva reseña
async function crearResena(req, res) {
  try {
    const { resena, id_producto } = req.body;
    const id_usuario = req.usuario.id_usuario; 

    // Validaciones
    if (!resena || !id_producto) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos (reseña, id_producto)' 
      });
    }

    // Verificar si el usuario ya reseñó este producto
    const yaReseno = await resenaModel.hasUserReviewed(id_usuario, id_producto);
    if (yaReseno) {
      return res.status(400).json({ 
        error: 'Ya has escrito una reseña para este producto' 
      });
    }

    // Verificar si el usuario compró el producto
    const haComprado = await resenaModel.hasUserPurchasedProduct(id_usuario, id_producto);
    if (!haComprado) {
      return res.status(403).json({ 
        error: 'Solo puedes reseñar productos que hayas comprado' 
      });
    }

    // Crear la reseña
    const nuevaResena = await resenaModel.createResena({
      resena,
      id_usuario,
      id_producto
    });

    res.status(201).json({ 
      message: 'Reseña creada exitosamente',
      resena: nuevaResena 
    });

  } catch (error) {
    console.error('Error al crear reseña:', error);
    res.status(500).json({ error: 'Error al crear la reseña' });
  }
}

// Obtener reseñas de un producto
async function obtenerResenasPorProducto(req, res) {
  try {
    const { id_producto } = req.params;

    if (!id_producto) {
      return res.status(400).json({ error: 'ID de producto requerido' });
    }

    const resenas = await resenaModel.getResenasByProducto(id_producto);
    const promedioRating = await resenaModel.getAverageRating(id_producto);

    res.json({
      resenas,
      promedio: parseFloat(promedioRating.promedio).toFixed(1),
      total: parseInt(promedioRating.total_resenas)
    });

  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ error: 'Error al obtener las reseñas' });
  }
}

// Verificar si el usuario puede reseñar un producto
async function verificarPuedeResenar(req, res) {
  try {
    const { id_producto } = req.params;
    const id_usuario = req.usuario.id_usuario;

    const yaReseno = await resenaModel.hasUserReviewed(id_usuario, id_producto);
    const haComprado = await resenaModel.hasUserPurchasedProduct(id_usuario, id_producto);

    res.json({
      puedeResenar: !yaReseno && haComprado,
      yaReseno,
      haComprado
    });

  } catch (error) {
    console.error('Error al verificar permisos de reseña:', error);
    res.status(500).json({ error: 'Error al verificar permisos' });
  }
}

module.exports = {
  crearResena,
  obtenerResenasPorProducto,
  verificarPuedeResenar
};

const { getAllUsers, deleteUserById } = require('../models/userModel');

// Obtener todos los usuarios
async function obtenerUsuarios(req, res) {
  try {
    const usuarios = await getAllUsers();
    res.status(200).json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error.message);
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
}

// Eliminar un usuario
async function eliminarUsuario(req, res) {
  try {
    const id = parseInt(req.params.id);
    const eliminado = await deleteUserById(id);

    if (!eliminado) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.status(200).json({ mensaje: 'Usuario eliminado correctamente', usuario: eliminado });
  } catch (error) {
    console.error('Error al eliminar usuario:', error.message);
    res.status(500).json({ mensaje: 'Error al eliminar usuario' });
  }
}

module.exports = { obtenerUsuarios, eliminarUsuario };

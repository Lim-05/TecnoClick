const { getAllUsers, deleteUserById, actualizar, obtenerPorId } = require('../models/userModel');


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

async function obtenerUsuarioPorId(req, res) {
  try {
    const id = parseInt(req.params.id);
    const usuario = await obtenerPorId(id);

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.status(200).json({ usuario });
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error.message);
    res.status(500).json({ mensaje: 'Error al obtener usuario' });
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

// Actualizar un usuario
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    // temporal: no actualizar contraseña
    delete datosActualizados.contrasena;

    const usuarioActualizado = await actualizar(id, datosActualizados);

    if (usuarioActualizado) {
      res.status(200).json({ mensaje: "Actualización válida", usuario: usuarioActualizado });
    } else {
      res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ error: error.message });
  }
};

// Exportar todas las funciones juntas
module.exports = { obtenerUsuarios, obtenerUsuarioPorId, eliminarUsuario, actualizarUsuario };

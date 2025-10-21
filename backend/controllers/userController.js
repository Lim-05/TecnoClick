const Usuario = require('../models/userModel.js');
const actualizar = require('../models/userModel.js');

const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    // temporal: no actualizar contraseña
    delete datosActualizados.contrasena;

    const usuarioActualizado = await Usuario.actualizar(id, datosActualizados);

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

module.exports = { actualizarUsuario };

const express = require('express');
const router = express.Router();
const { obtenerUsuarios, obtenerUsuarioPorId, eliminarUsuario, actualizarUsuario } = require('../controllers/userController');

// Rutas de usuarios
router.get('/', obtenerUsuarios);         // Obtener todos los usuarios
router.get('/:id', obtenerUsuarioPorId); // Obtener usuario por ID
router.delete('/:id', eliminarUsuario);  // Eliminar usuario por ID
router.put('/:id', actualizarUsuario);   // Actualizar usuario por ID

module.exports = router;

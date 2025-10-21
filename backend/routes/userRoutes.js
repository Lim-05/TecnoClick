const express = require('express');
const router = express.Router();
const { obtenerUsuarios, eliminarUsuario, actualizarUsuario } = require('../controllers/userController');

// Rutas de usuarios
router.get('/', obtenerUsuarios);         // Obtener todos los usuarios
router.delete('/:id', eliminarUsuario);  // Eliminar usuario por ID
router.put('/:id', actualizarUsuario);   // Actualizar usuario por ID

module.exports = router;

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { obtenerUsuarios, obtenerUsuarioPorId, eliminarUsuario, actualizarUsuario } = require('../controllers/userController');

// Rutas de usuarios - TODAS PROTEGIDAS CON AUTENTICACIÓN
router.get('/', authMiddleware, obtenerUsuarios);         // Obtener todos los usuarios
router.get('/:id', authMiddleware, obtenerUsuarioPorId); // Obtener usuario por ID
router.delete('/:id', authMiddleware, eliminarUsuario);  // Eliminar usuario por ID
router.put('/:id', authMiddleware, actualizarUsuario);   // Actualizar usuario por ID

module.exports = router;

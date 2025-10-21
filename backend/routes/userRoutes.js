const express = require('express');
const router = express.Router();
const { obtenerUsuarios, eliminarUsuario } = require('../controllers/userController');

// GET - todos los usuarios
router.get('/', obtenerUsuarios);

// DELETE - eliminar usuario por ID
router.delete('/:id', eliminarUsuario);

const { actualizarUsuario } = require('../controllers/userController.js');

const router = express.Router();

router.put('/:id', actualizarUsuario);

module.exports = router;

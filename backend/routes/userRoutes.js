const express = require('express');
const { actualizarUsuario } = require('../controllers/userController.js');

const router = express.Router();

router.put('/:id', actualizarUsuario);

module.exports = router;

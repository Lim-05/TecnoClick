const express = require('express');
const { login, session } = require('../controllers/authController');
const auth = require('../middleware/auth');
const router = express.Router();
router.post('/login', login);
router.get('/sesion', auth, session);
module.exports = router;

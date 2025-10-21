import express from 'express';
import cors from 'cors';
import usuarioRuta from '../rutes/userRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

//rutas
app.use('/api', userRoutes);

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const authController = require('../controllers/authController');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }));
app.use(express.static('public'));

app.get('/', (req, res) => res.sendFile(__dirname + '/views/login.html'));
app.post('/login', authController.login);
app.get('/dashboard', authController.dashboard);

app.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));

export default app;
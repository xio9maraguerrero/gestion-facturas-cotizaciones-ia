// C:\xampp\htdocs\gestion-facturas-cotizaciones-ia\src\routes\auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rutas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
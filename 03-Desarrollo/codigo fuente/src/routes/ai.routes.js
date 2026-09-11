// C:\xampp\htdocs\gestion-facturas-cotizaciones-ia\src\routes\ai.routes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const aiController = require('../controllers/aiController');

// Procesar documento con IA
router.post('/procesar/:documento_id', authMiddleware, aiController.procesarDocumento);

// Chat sobre documento
router.post('/chat', authMiddleware, aiController.chat);

module.exports = router;
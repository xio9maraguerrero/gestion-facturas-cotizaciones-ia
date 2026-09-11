// src/routes/analisis.routes.js
const express = require('express');
const router = express.Router();
const analisisController = require('../controllers/analisisController');
const authMiddleware = require('../middlewares/authMiddleware'); // usa tu middleware de autenticación

// GET /api/analisis?documento_id=ID
router.get('/', authMiddleware, analisisController.getAnalisisByDocumento);

// GET /api/analisis/:id  (opcional, devuelve lo mismo pero usando param)
router.get('/:id', authMiddleware, analisisController.getAnalisisByDocumento);

module.exports = router;
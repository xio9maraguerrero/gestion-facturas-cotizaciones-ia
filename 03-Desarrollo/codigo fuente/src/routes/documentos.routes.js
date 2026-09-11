// src/routes/documentos.routes.js
const express = require('express');
const router = express.Router();
const docController = require('../controllers/docController');
const authMiddleware = require('../middlewares/authMiddleware');

// GET /api/documentos/:id
router.get('/:id', authMiddleware, docController.getDocumentById);

module.exports = router;
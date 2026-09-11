// C:\xampp\htdocs\gestion-facturas-cotizaciones-ia\src\routes\repos.routes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const docController = require('../controllers/docController');

// GET /api/repositorios
router.get('/', authMiddleware, docController.getRepos);

// POST /api/repositorios
router.post('/', authMiddleware, docController.createRepo);

// PUT /api/repositorios/:id
router.put('/:id', authMiddleware, docController.updateRepo);

// DELETE /api/repositorios/:id
router.delete('/:id', authMiddleware, docController.deleteRepo);

module.exports = router;
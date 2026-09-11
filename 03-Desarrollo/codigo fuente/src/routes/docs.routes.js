// C:\xampp\htdocs\gestion-facturas-cotizaciones-ia\src\routes\docs.routes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const authMiddleware = require('../middlewares/authMiddleware');
const docController = require('../controllers/docController');

// Configurar multer storage al directorio uploads (crea si no existe)
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // límite 50MB
});

/**
 * Rutas para repositorios (carpetas)
 */
router.post('/repos', authMiddleware, docController.createRepo);
router.get('/repos', authMiddleware, docController.getRepos);
router.put('/repos/:id', authMiddleware, docController.updateRepo);
router.delete('/repos/:id', authMiddleware, docController.deleteRepo);

/**
 * Rutas para documentos
 */

// Listar documentos del usuario (soporta query params ?repositorio_id=X&categoria=Y)
router.get('/', authMiddleware, docController.listDocuments);

// Obtener documento por id
router.get('/:id', authMiddleware, docController.getDocumentById);

// Subir documento (FormData campo 'file')
router.post('/upload', authMiddleware, upload.single('file'), docController.uploadDocument);

// Eliminar documento
router.delete('/:id', authMiddleware, docController.deleteDocument);

module.exports = router;
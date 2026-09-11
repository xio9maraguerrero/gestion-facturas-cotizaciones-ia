/**
 * server.js - Servidor principal Express
 * Monta rutas: /api/auth, /api/docs, /api/ai, /api/repositorios
 * Sirve carpeta public y uploads.
 */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Conexión a DB (Ajustado para coincidir con src/config/db.js)
const pool = require('./src/config/db'); 

// Importación de Servicio de IA para probar modelos
const { getAvailableModels } = require('./src/services/aiService');

// Importación de Rutas
const authRoutes = require('./src/routes/auth.routes');
const docsRoutes = require('./src/routes/docs.routes');
const aiRoutes = require('./src/routes/ai.routes');
const repoRoutes = require('./src/routes/repos.routes'); // <-- 1. IMPORTAR RUTA DE REPOSITORIOS
const analisisRoutes = require('./src/routes/analisis.routes');
const documentosRoutes = require('./src/routes/documentos.routes');
const app = express();

// Middlewares globales (Ajustado Helmet para permitir servir /uploads sin bloqueos CORS)
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Directorios estáticos
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Crear la carpeta uploads si no existe
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use(express.static(PUBLIC_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper: registro de errores en DB
async function logErrorToDB({ documento_id = null, mensaje }) {
  try {
    const sql = 'INSERT INTO logs_errores (documento_id, mensaje_error) VALUES (?, ?)';
    await pool.execute(sql, [documento_id, mensaje]);
  } catch (err) {
    console.error('Error al insertar log en BD:', err);
  }
}

// Endpoint temporal para auditar modelos disponibles en Groq
app.get('/api/ai/test-models', async (req, res) => {
  try {
    const models = await getAvailableModels();
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Montaje de rutas API
app.use('/api/auth', authRoutes);
app.use('/api/docs', docsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/repositorios', repoRoutes); // <-- 2. MONTAR RUTA EN /api/repositorios
app.use('/api/analisis', analisisRoutes);
app.use('/api/documentos', documentosRoutes);
// Ruta healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Manejo centralizado de errores
app.use(async (err, req, res, next) => {
  console.error('Unhandled error:', err);
  const documentoId = (req.body && req.body.documento_id) ? req.body.documento_id : null;
  await logErrorToDB({ documento_id: documentoId, mensaje: err.message || String(err) });
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Inicialización del servidor
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Verificar conexión a la BD
    const connection = await pool.getConnection();
    connection.release();
    console.log('Conectado a la base de datos MySQL');

    app.listen(PORT, () => {
      console.log(`Servidor iniciado en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Error al iniciar la aplicación:', err);
    await logErrorToDB({ mensaje: `Fallo arranque servidor: ${err.message || String(err)}` });
    process.exit(1);
  }
}

start();

module.exports = app;
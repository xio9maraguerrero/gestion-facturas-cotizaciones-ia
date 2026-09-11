// src/controllers/docController.js
const pool = require('../config/db');
const path = require('path');
const fs = require('fs');
const textExtractor = require('../services/textExtractor');
const aiService = require('../services/aiService');

/* ==========================================
   GESTIÓN DE REPOSITORIOS (CARPETAS)
   ========================================== */

async function createRepo(req, res) {
  try {
    const usuarioId = req.user.id;
    const { nombre, descripcion } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ ok: false, message: 'El nombre del repositorio es obligatorio' });
    }

    const [result] = await pool.execute(
      'INSERT INTO repositorios (usuario_id, nombre, descripcion, fecha_creacion) VALUES (?, ?, ?, NOW())',
      [usuarioId, nombre.trim(), descripcion || '']
    );

    return res.status(201).json({
      ok: true,
      message: 'Repositorio creado exitosamente',
      data: {
        id: result.insertId,
        usuario_id: usuarioId,
        nombre: nombre.trim(),
        descripcion
      }
    });
  } catch (err) {
    console.error('createRepo error:', err);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
}

async function getRepos(req, res) {
  try {
    const usuarioId = req.user.id;
    const [rows] = await pool.execute(
      'SELECT id, nombre, descripcion, fecha_creacion FROM repositorios WHERE usuario_id = ? ORDER BY fecha_creacion DESC',
      [usuarioId]
    );

    return res.json({ ok: true, data: rows });
  } catch (err) {
    console.error('getRepos error:', err);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
}

async function updateRepo(req, res) {
  try {
    const usuarioId = req.user.id;
    const repoId = req.params.id;
    const { nombre, descripcion } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ ok: false, message: 'El nombre del repositorio es obligatorio' });
    }

    const [result] = await pool.execute(
      'UPDATE repositorios SET nombre = ?, descripcion = ? WHERE id = ? AND usuario_id = ?',
      [nombre.trim(), descripcion || '', repoId, usuarioId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, message: 'Repositorio no encontrado o no autorizado' });
    }

    return res.json({ ok: true, message: 'Repositorio actualizado' });
  } catch (err) {
    console.error('updateRepo error:', err);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
}

async function deleteRepo(req, res) {
  try {
    const usuarioId = req.user.id;
    const repoId = req.params.id;

    const [result] = await pool.execute(
      'DELETE FROM repositorios WHERE id = ? AND usuario_id = ?',
      [repoId, usuarioId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, message: 'Repositorio no encontrado o no autorizado' });
    }

    return res.json({ ok: true, message: 'Repositorio eliminado' });
  } catch (err) {
    console.error('deleteRepo error:', err);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
}

/* ==========================================
   GESTIÓN DE DOCUMENTOS Y FILTROS IA
   ========================================== */

/**
 * processDocumentAI(documentoId, usuarioId, filePath)
 * - Extrae texto, llama al servicio IA, guarda resumen + datos (INSERT/UPDATE analisis_ia)
 * - Actualiza estado en documentos y registra errores en logs_errores
 */
async function processDocumentAI(documentoId, usuarioId, filePath) {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      await pool.execute('UPDATE documentos SET estado_procesamiento = ? WHERE id = ?', ['error', documentoId]);
      await pool.execute('INSERT INTO logs_errores (documento_id, mensaje_error, fecha_registro) VALUES (?, ?, NOW())', [documentoId, 'Archivo físico no encontrado para procesamiento IA']);
      console.warn(`processDocumentAI: archivo no encontrado para documento ${documentoId}`);
      return;
    }

    // Marcar como procesando
    await pool.execute('UPDATE documentos SET estado_procesamiento = ? WHERE id = ?', ['procesando', documentoId]);

    // 1) Extraer texto
    let texto;
    try {
      texto = await textExtractor.extractTextFromFile(filePath);
    } catch (errText) {
      const msg = `Error extrayendo texto: ${errText?.message || String(errText)}`;
      await pool.execute('UPDATE documentos SET estado_procesamiento = ? WHERE id = ?', ['error', documentoId]);
      await pool.execute('INSERT INTO logs_errores (documento_id, mensaje_error, fecha_registro) VALUES (?, ?, NOW())', [documentoId, msg]);
      console.error(`processDocumentAI - extract error doc ${documentoId}:`, errText);
      return;
    }

    if (!texto || String(texto).trim().length === 0) {
      await pool.execute('UPDATE documentos SET estado_procesamiento = ? WHERE id = ?', ['error', documentoId]);
      await pool.execute('INSERT INTO logs_errores (documento_id, mensaje_error, fecha_registro) VALUES (?, ?, NOW())', [documentoId, 'Texto extraído vacío durante procesamiento IA']);
      console.warn(`processDocumentAI: texto vacío para documento ${documentoId}`);
      return;
    }

    // 2) Llamar al servicio IA
    let analysis;
    try {
      analysis = await aiService.analyzeDocumentText(texto);
      // expected: { categoria, resumen, datos_extraidos }
    } catch (errAI) {
      const msg = `Error en análisis IA: ${errAI?.message || String(errAI)}`;
      await pool.execute('UPDATE documentos SET estado_procesamiento = ? WHERE id = ?', ['error', documentoId]);
      await pool.execute('INSERT INTO logs_errores (documento_id, mensaje_error, fecha_registro) VALUES (?, ?, NOW())', [documentoId, msg]);
      console.error(`processDocumentAI - ai error doc ${documentoId}:`, errAI);
      return;
    }

    // 3) Guardar resultado en analisis_ia (UPDATE si existe, INSERT si no)
    try {
      const datosJson = JSON.stringify(analysis.datos_extraidos ?? {});
      const [existing] = await pool.execute('SELECT id FROM analisis_ia WHERE documento_id = ?', [documentoId]);

      if (existing.length > 0) {
        // Actualizar fila(s) existentes para este documento_id
        await pool.execute(
          'UPDATE analisis_ia SET categoria = ?, resumen = ?, datos_extraidos_json = ?, fecha_analisis = NOW() WHERE documento_id = ?',
          [analysis.categoria || 'Otro', analysis.resumen || '', datosJson, documentoId]
        );
      } else {
        await pool.execute(
          'INSERT INTO analisis_ia (documento_id, categoria, resumen, datos_extraidos_json, fecha_analisis) VALUES (?, ?, ?, ?, NOW())',
          [documentoId, analysis.categoria || 'Otro', analysis.resumen || '', datosJson]
        );
      }

      // 4) Marcar documento como completado
      await pool.execute('UPDATE documentos SET estado_procesamiento = ? WHERE id = ?', ['completado', documentoId]);

      console.info(`processDocumentAI: análisis guardado correctamente para documento ${documentoId}`);
    } catch (errSave) {
      const msg = `Error guardando análisis: ${errSave?.message || String(errSave)}`;
      await pool.execute('UPDATE documentos SET estado_procesamiento = ? WHERE id = ?', ['error', documentoId]);
      await pool.execute('INSERT INTO logs_errores (documento_id, mensaje_error, fecha_registro) VALUES (?, ?, NOW())', [documentoId, msg]);
      console.error(`processDocumentAI - save error doc ${documentoId}:`, errSave);
      return;
    }

  } catch (err) {
    console.error(`processDocumentAI unexpected error for doc ${documentoId}:`, err);
    try {
      await pool.execute('UPDATE documentos SET estado_procesamiento = ? WHERE id = ?', ['error', documentoId]);
      await pool.execute('INSERT INTO logs_errores (documento_id, mensaje_error, fecha_registro) VALUES (?, ?, NOW())', [documentoId, err?.message || String(err)]);
    } catch (e) {}
  }
}

/**
 * uploadDocument - modificado para lanzar procesamiento IA en background.
 */
async function uploadDocument(req, res) {
  try {
    const usuarioId = req.user.id;
    let repositorioId = req.body.repositorio_id;
    const categoriaManual = req.body.categoria; // Categoría enviada desde el frontend

    if (!req.file) {
      return res.status(400).json({ ok: false, message: 'Archivo no subido' });
    }

    // Validar o asignar repositorio
    if (repositorioId) {
      const [r] = await pool.execute('SELECT id FROM repositorios WHERE id = ? AND usuario_id = ?', [repositorioId, usuarioId]);
      if (r.length === 0) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
        return res.status(403).json({ ok: false, message: 'Repositorio no encontrado o no pertenece al usuario' });
      }
    } else {
      const [repos] = await pool.execute('SELECT id FROM repositorios WHERE usuario_id = ? ORDER BY id ASC LIMIT 1', [usuarioId]);
      if (repos.length > 0) repositorioId = repos[0].id;
      else {
        const [newRepo] = await pool.execute('INSERT INTO repositorios (usuario_id, nombre, descripcion, fecha_creacion) VALUES (?, ?, ?, NOW())', [usuarioId, 'Mi Repositorio', 'Repositorio automático por defecto']);
        repositorioId = newRepo.insertId;
      }
    }

    const ext = path.extname(req.file.originalname || '').toLowerCase().replace('.', '') || '';

    // Fix de caracteres especiales para nombres de archivos
    const nombreOriginal = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

    // 1. Guardar documento en la tabla `documentos`
    // NOTA: dejamos estado_procesamiento = 'procesando' para indicar que se iniciará análisis IA en background.
    const insertQuery = `
      INSERT INTO documentos
      (repositorio_id, nombre_original, nombre_servidor, ruta_archivo, tipo_formato, tamano_bytes, estado_procesamiento, fecha_subida)
      VALUES (?, ?, ?, ?, ?, ?, 'procesando', NOW())
    `;
    const [result] = await pool.execute(insertQuery, [
      repositorioId,
      nombreOriginal,
      req.file.filename,
      req.file.path,
      ext,
      req.file.size
    ]);

    const docId = result.insertId;

    // Validar que la categoría coincida con los valores permitidos del ENUM
    const categoriasValidas = ['Factura', 'Cotización', 'Cuenta de Cobro', 'Otro'];
    const catFinal = categoriasValidas.includes(categoriaManual) ? categoriaManual : 'Otro';

    // 2. Guardar registro inicial en la tabla `analisis_ia` (estado inicial)
    await pool.execute(`
      INSERT INTO analisis_ia (documento_id, categoria, resumen, datos_extraidos_json, fecha_analisis)
      VALUES (?, ?, ?, ?, NOW())
    `, [
      docId,
      catFinal,
      'Análisis documental procesado tras la carga.',
      JSON.stringify({ estado: 'inicializado', origen: 'Carga manual/automatica' })
    ]);

    // Lanzar procesamiento IA en background (no bloquea la respuesta HTTP)
    setImmediate(() => {
      processDocumentAI(docId, usuarioId, req.file.path)
        .catch(err => console.error(`processDocumentAI background error doc ${docId}:`, err));
    });

    // Responder inmediatamente al cliente
    return res.status(201).json({
      ok: true,
      message: 'Archivo subido. Procesamiento IA en curso.',
      data: {
        id: docId,
        repositorio_id: repositorioId,
        nombre_original: nombreOriginal,
        nombre_servidor: req.file.filename,
        tipo_formato: ext,
        tamano_bytes: req.file.size,
        estado_procesamiento: 'procesando',
        categoria: catFinal
      }
    });
  } catch (err) {
    console.error('uploadDocument error:', err);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
}

async function listDocuments(req, res) {
  try {
    const usuarioId = req.user.id;
    const { repositorio_id, categoria } = req.query;

    let sql = `
      SELECT d.id, d.repositorio_id, d.nombre_original, d.nombre_servidor, d.ruta_archivo,
             d.tipo_formato, d.tamano_bytes, d.estado_procesamiento, d.fecha_subida,
             r.nombre AS repo_nombre,
             ai.categoria AS analisis_categoria,
             ai.resumen AS analisis_resumen
      FROM documentos d
      JOIN repositorios r ON r.id = d.repositorio_id
      LEFT JOIN analisis_ia ai ON ai.documento_id = d.id
      WHERE r.usuario_id = ?
    `;
    const params = [usuarioId];

    if (repositorio_id) {
      sql += ' AND d.repositorio_id = ?';
      params.push(repositorio_id);
    }
    if (categoria && categoria !== 'Todas') {
      sql += ' AND ai.categoria = ?';
      params.push(categoria);
    }

    sql += ' ORDER BY d.fecha_subida DESC';

    const [rows] = await pool.execute(sql, params);
    return res.json({ ok: true, data: rows });
  } catch (err) {
    console.error('listDocuments error:', err);
    return res.status(500).json({ ok: false, message: 'Error interno' });
  }
}

async function getDocumentById(req, res) {
  try {
    const usuarioId = req.user.id;
    const docId = req.params.id;

    const [rows] = await pool.execute(`
      SELECT d.id, d.repositorio_id, d.nombre_original, d.nombre_servidor, d.ruta_archivo,
             d.tipo_formato, d.tamano_bytes, d.estado_procesamiento, d.fecha_subida,
             r.nombre AS repo_nombre
      FROM documentos d
      JOIN repositorios r ON r.id = d.repositorio_id
      WHERE d.id = ? AND r.usuario_id = ?
    `, [docId, usuarioId]);

    if (rows.length === 0) return res.status(404).json({ ok: false, message: 'Documento no encontrado' });

    return res.json({ ok: true, data: rows[0] });
  } catch (err) {
    console.error('getDocumentById error:', err);
    return res.status(500).json({ ok: false, message: 'Error interno' });
  }
}

async function deleteDocument(req, res) {
  try {
    const usuarioId = req.user.id;
    const docId = req.params.id;

    const [rows] = await pool.execute(`
      SELECT d.id, d.ruta_archivo, r.usuario_id
      FROM documentos d
      JOIN repositorios r ON r.id = d.repositorio_id
      WHERE d.id = ? AND r.usuario_id = ?
    `, [docId, usuarioId]);

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, message: 'Documento no encontrado o no pertenece al usuario' });
    }

    const doc = rows[0];

    await pool.execute('DELETE FROM documentos WHERE id = ?', [docId]);

    try {
      if (doc.ruta_archivo && fs.existsSync(doc.ruta_archivo)) fs.unlinkSync(doc.ruta_archivo);
    } catch (e) { console.warn('No se pudo eliminar archivo físico:', e.message || e); }

    return res.json({ ok: true, message: 'Documento eliminado' });
  } catch (err) {
    console.error('deleteDocument error:', err);
    return res.status(500).json({ ok: false, message: 'Error interno' });
  }
}

module.exports = {
  createRepo,
  getRepos,
  updateRepo,
  deleteRepo,
  uploadDocument,
  listDocuments,
  getDocumentById,
  deleteDocument
};
// C:\xampp\htdocs\gestion-facturas-cotizaciones-ia\src\controllers\aiController.js
const pool = require('../config/db');
const path = require('path');
const fs = require('fs');
const textExtractor = require('../services/textExtractor');
const aiService = require('../services/aiService');

/**
 * POST /procesar/:documento_id
 * (Si lo usas) procesa y guarda análisis — lo dejamos como estaba.
 */
async function procesarDocumento(req, res) {
  const usuarioId = req.user.id;
  const documentoId = req.params.documento_id;

  try {
    const [rows] = await pool.execute(`
      SELECT d.id, d.ruta_archivo, d.repositorio_id, r.usuario_id
      FROM documentos d
      JOIN repositorios r ON r.id = d.repositorio_id
      WHERE d.id = ? AND r.usuario_id = ?
    `, [documentoId, usuarioId]);

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, message: 'Documento no encontrado o no pertenece al usuario' });
    }

    const doc = rows[0];
    const filePath = doc.ruta_archivo;

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ ok: false, message: 'Archivo físico no encontrado en el servidor' });
    }

    await pool.execute('UPDATE documentos SET estado_procesamiento = ? WHERE id = ?', ['procesando', documentoId]);

    let texto;
    try {
      texto = await textExtractor.extractTextFromFile(filePath);
    } catch (errText) {
      const errMsg = `Error extrayendo texto: ${errText.message || String(errText)}`;
      await pool.execute('UPDATE documentos SET estado_procesamiento = ? WHERE id = ?', ['error', documentoId]);
      await pool.execute('INSERT INTO logs_errores (documento_id, mensaje_error, fecha_registro) VALUES (?, ?, NOW())', [documentoId, errMsg]);
      return res.status(500).json({ ok: false, message: 'Error extrayendo texto del documento' });
    }

    if (!texto || texto.trim().length === 0) {
      await pool.execute('UPDATE documentos SET estado_procesamiento = ? WHERE id = ?', ['error', documentoId]);
      await pool.execute('INSERT INTO logs_errores (documento_id, mensaje_error, fecha_registro) VALUES (?, ?, NOW())', [documentoId, 'Texto extraído vacío']);
      return res.status(400).json({ ok: false, message: 'No se pudo extraer texto del documento' });
    }

    let analysis;
    try {
      analysis = await aiService.analyzeDocumentText(texto);
    } catch (errAI) {
      const errMsg = `Error en análisis IA: ${errAI.message || String(errAI)}`;
      await pool.execute('UPDATE documentos SET estado_procesamiento = ? WHERE id = ?', ['error', documentoId]);
      await pool.execute('INSERT INTO logs_errores (documento_id, mensaje_error, fecha_registro) VALUES (?, ?, NOW())', [documentoId, errMsg]);
      console.error('AI analysis failed', errAI);
      return res.status(500).json({ ok: false, message: 'Error procesando documento con IA' });
    }

    try {
      const datosJson = JSON.stringify(analysis.datos_extraidos ?? {});
      const [existing] = await pool.execute('SELECT id FROM analisis_ia WHERE documento_id = ?', [documentoId]);

      if (existing.length > 0) {
        await pool.execute(
          'UPDATE analisis_ia SET categoria = ?, resumen = ?, datos_extraidos_json = ?, fecha_analisis = NOW() WHERE documento_id = ?',
          [analysis.categoria || null, analysis.resumen || null, datosJson, documentoId]
        );
      } else {
        await pool.execute(
          'INSERT INTO analisis_ia (documento_id, categoria, resumen, datos_extraidos_json, fecha_analisis) VALUES (?, ?, ?, ?, NOW())',
          [documentoId, analysis.categoria || null, analysis.resumen || null, datosJson]
        );
      }

      await pool.execute('UPDATE documentos SET estado_procesamiento = ? WHERE id = ?', ['completado', documentoId]);

      return res.json({ ok: true, message: 'Procesamiento completado', data: { documento_id: documentoId, analysis } });
    } catch (errSave) {
      const errMsg = `Error guardando análisis: ${errSave.message || String(errSave)}`;
      await pool.execute('UPDATE documentos SET estado_procesamiento = ? WHERE id = ?', ['error', documentoId]);
      await pool.execute('INSERT INTO logs_errores (documento_id, mensaje_error, fecha_registro) VALUES (?, ?, NOW())', [documentoId, errMsg]);
      console.error('Error saving analysis', errSave);
      return res.status(500).json({ ok: false, message: 'Error guardando resultado de análisis' });
    }
  } catch (err) {
    console.error('procesarDocumento unexpected error', err);
    try {
      await pool.execute('UPDATE documentos SET estado_procesamiento = ? WHERE id = ?', ['error', documentoId]);
      await pool.execute('INSERT INTO logs_errores (documento_id, mensaje_error, fecha_registro) VALUES (?, ?, NOW())', [documentoId, err.message || String(err)]);
    } catch (e) {}
    return res.status(500).json({ ok: false, message: 'Error interno' });
  }
}

/**
 * POST /chat
 * body: { documento_id, pregunta }
 * Devuelve: { ok: true, data: { respuesta: "..." } } en caso exitoso
 */
async function chat(req, res) {
  try {
    const usuarioId = req.user.id;
    const { documento_id, pregunta } = req.body;
    if (!documento_id || !pregunta) return res.status(400).json({ ok: false, message: 'documento_id y pregunta son requeridos' });

    // Verificar documento y pertenencia
    const [rows] = await pool.execute(`
      SELECT d.id, d.ruta_archivo, r.usuario_id
      FROM documentos d
      JOIN repositorios r ON r.id = d.repositorio_id
      WHERE d.id = ? AND r.usuario_id = ?
    `, [documento_id, usuarioId]);

    if (rows.length === 0) return res.status(404).json({ ok: false, message: 'Documento no encontrado o no pertenece al usuario' });

    const doc = rows[0];
    const filePath = doc.ruta_archivo;
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ ok: false, message: 'Archivo físico no encontrado en el servidor' });
    }

    // Extraer texto
    let texto;
    try {
      texto = await textExtractor.extractTextFromFile(filePath);
    } catch (errText) {
      const errMsg = `Error extrayendo texto para chat: ${errText.message || String(errText)}`;
      await pool.execute('INSERT INTO logs_errores (documento_id, mensaje_error, fecha_registro) VALUES (?, ?, NOW())', [documento_id, errMsg]);
      return res.status(500).json({ ok: false, message: 'Error extrayendo texto del documento' });
    }

    if (!texto || texto.trim().length === 0) {
      return res.status(400).json({ ok: false, message: 'No se pudo extraer texto del documento' });
    }

    // Llamada a servicio de chat
    let respuesta;
    try {
      respuesta = await aiService.chatRespond(texto, pregunta);
    } catch (errChat) {
      const errMsg = `Error en chat IA: ${errChat.message || String(errChat)}`;
      await pool.execute('INSERT INTO logs_errores (documento_id, mensaje_error, fecha_registro) VALUES (?, ?, NOW())', [documento_id, errMsg]);
      console.error('AI chat failed', errChat);
      return res.status(500).json({ ok: false, message: 'Error procesando la consulta con IA' });
    }

    return res.json({ ok: true, data: { respuesta } });
  } catch (err) {
    console.error('aiController.chat error', err);
    return res.status(500).json({ ok: false, message: 'Error interno' });
  }
}

module.exports = {
  procesarDocumento,
  chat
};
// src/controllers/analisisController.js
const pool = require('../config/db');

async function getAnalisisByDocumento(req, res) {
  try {
    // Soportamos tanto ?documento_id=ID como /:id
    const documentoId = req.query.documento_id || req.params.id;
    if (!documentoId) return res.status(400).json({ ok: false, message: 'documento_id es requerido' });

    const [rows] = await pool.execute(
      `SELECT id, documento_id, categoria, resumen, datos_extraidos_json, fecha_analisis
       FROM analisis_ia
       WHERE documento_id = ?
       ORDER BY fecha_analisis DESC`,
      [documentoId]
    );

    // Devolvemos arreglo (puede ser vacío) — frontend tomará el más reciente si hay varios
    return res.json({ ok: true, data: rows });
  } catch (err) {
    console.error('getAnalisisByDocumento error:', err);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
}

module.exports = {
  getAnalisisByDocumento
};
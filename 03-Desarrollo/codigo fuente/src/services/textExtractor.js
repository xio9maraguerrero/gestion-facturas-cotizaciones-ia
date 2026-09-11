// src/services/textExtractor.js
const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extrae texto del archivo indicado por filePath.
 * Soporta: .pdf, .docx, .txt
 *
 * @param {string} filePath Ruta absoluta al archivo guardado (ej. uploads/...)
 * @returns {Promise<string>} Texto extraído (texto plano)
 */
async function extractTextFromFile(filePath) {
  if (!filePath) throw new Error('filePath es requerido');
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    return extractFromPDF(filePath);
  } else if (ext === '.docx') {
    return extractFromDocx(filePath);
  } else if (ext === '.txt') {
    return extractFromTxt(filePath);
  } else {
    // Intentamos leer como texto por defecto
    return extractFromTxt(filePath);
  }
}

async function extractFromPDF(filePath) {
  try {
    const data = await fs.readFile(filePath);
    const result = await pdfParse(data);
    // result.text es texto plano extraído
    return (result.text || '').trim();
  } catch (err) {
    console.error('Error extrayendo PDF:', err);
    throw err;
  }
}

async function extractFromDocx(filePath) {
  try {
    // mammoth permite pasar un buffer o filepath (en Node >=)
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return (result.value || '').toString().trim();
  } catch (err) {
    console.error('Error extrayendo DOCX:', err);
    throw err;
  }
}

async function extractFromTxt(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content.trim();
  } catch (err) {
    console.error('Error leyendo TXT:', err);
    throw err;
  }
}

module.exports = {
  extractTextFromFile,
  extractFromPDF,
  extractFromDocx,
  extractFromTxt
};
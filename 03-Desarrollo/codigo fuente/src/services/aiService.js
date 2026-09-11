// C:\xampp\htdocs\gestion-facturas-cotizaciones-ia\src\services\aiService.js
require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const GROQ_API_BASE = 'https://api.groq.com/openai/v1';

if (!GROQ_API_KEY) {
  console.warn('GROQ_API_KEY no configurada en .env — las llamadas a Groq fallarán.');
}

function buildAnalysisPrompt(text) {
  return `
Eres un extractor automatizado que RESPONDE EXCLUSIVAMENTE en formato JSON válido sin texto adicional.
Analiza el siguiente documento y devuelve UN SOLO objeto JSON con las claves exactas:
- categoria: ("Factura","Cotización","Cuenta de Cobro","Otro").
- resumen: un resumen breve en español (1-3 líneas).
- datos_extraidos: objeto con campos (fecha, total, subtotal, impuestos, nit_proveedor, nombre_proveedor, numero_documento, direccion_proveedor, concepto, items, vencimiento, moneda, telefono, email).

Documento:
<DOC>
${text}
</DOC>

Salida requerida: SOLO JSON.
`.trim();
}

async function callGroqModel(messages, temperature = 0.1) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY no configurada en el entorno');
  }

  const url = `${GROQ_API_BASE}/chat/completions`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: messages,
      temperature: temperature
    })
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(`Groq API error: ${resp.status} ${resp.statusText} ${txt}`);
  }

  const json = await resp.json();
  return json.choices?.[0]?.message?.content || '';
}

function extractJsonFromText(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    const match = String(text).match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error('Respuesta del modelo no contiene JSON reconocible');
  }
}

async function analyzeDocumentText(text) {
  if (!text || text.trim().length === 0) {
    throw new Error('Texto del documento vacío');
  }

  const prompt = buildAnalysisPrompt(text);
  const messages = [
    { role: 'system', content: 'Eres un asistente experto en extracción de datos estructurados en formato JSON.' },
    { role: 'user', content: prompt }
  ];

  const generated = await callGroqModel(messages, 0.1);
  const parsed = extractJsonFromText(generated);

  return {
    categoria: parsed.categoria ?? 'Otro',
    resumen: parsed.resumen ?? '',
    datos_extraidos: parsed.datos_extraidos ?? {}
  };
}

/**
 * chatRespond: responde preguntas sobre un documento (RAG).
 * - Si la pregunta es un saludo/cierre/agradecimiento, devuelve una respuesta cordial localmente (sin llamar al modelo).
 * - Para preguntas de contenido, envía el prompt al modelo pidiéndole que responda basándose en el documento; si la info no está, que responda "No se encuentra la información solicitada en el documento."
 */
async function chatRespond(documentText, question) {
  if (!question || question.trim().length === 0) throw new Error('Pregunta vacía');

  const q = String(question || '').trim();

  // Heurística simple para detectar salutaciones/despedidas/agradecimientos
  const lower = q.toLowerCase();
  const thanksRegex = /\b(gracias|muchas gracias|gracias!)\b/i;
  const byeRegex = /\b(adiós|adios|chao|chau|hasta luego|hasta+ luego|bye|nos vemos|terminamos|fin de la conversación)\b/i;
  const greetRegex = /\b(hola|buenos días|buenas tardes|buenas noches)\b/i;

  if (thanksRegex.test(lower)) {
    return 'De nada — me alegra haber ayudado. Si necesitas algo más sobre el documento, pregúntame.';
  }
  if (byeRegex.test(lower)) {
    return 'Hasta luego — si necesitas volver a consultar el documento, aquí estaré para ayudarte.';
  }
  if (greetRegex.test(lower) && q.length < 30) {
    return '¡Hola! Estoy listo para ayudarte con preguntas sobre el documento. ¿Qué te gustaría saber?';
  }

  // System prompt mejorado: principal restricción a usar el documento, pero permite respuestas breves de cortesía si el usuario las solicita.
  const system = `
Eres un asistente que responde preguntas en español basándose PRIMARIAMENTE en el texto del documento provisto.
- Si la respuesta está en el documento, responde usando solamente la información presente en el documento.
- Si la respuesta NO está en el documento, responde exactamente: "No se encuentra la información solicitada en el documento."
- Para saludos, agradecimientos o despedidas breves del usuario, responde con una frase corta y cordial (por ejemplo: "De nada", "Hasta luego") en lugar de decir que la información no está en el documento.
Responde de forma clara y concisa.
`.trim();

  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: `Documento:\n<DOC>\n${documentText}\n</DOC>\n\nPregunta:\n${question}` }
  ];

  const response = await callGroqModel(messages, 0.2);
  return response.trim();
}

/* Optional: listar modelos disponibles (útil para debug/admin) */
async function getAvailableModels() {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY no configurada');
  const url = `${GROQ_API_BASE}/models`;
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY.trim()}`
    }
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(`Error fetching models: ${resp.status} ${resp.statusText} ${txt}`);
  }
  return await resp.json();
}

module.exports = {
  analyzeDocumentText,
  chatRespond,
  getAvailableModels
};
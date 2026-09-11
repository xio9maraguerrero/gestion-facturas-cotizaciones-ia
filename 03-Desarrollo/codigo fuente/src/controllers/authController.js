// C:\xampp\htdocs\gestion-facturas-cotizaciones-ia\src\controllers\authController.js
const pool = require('../config/db'); // pool exportado directamente
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_UTS_2026';

/**
 * Registro de usuario
 * body: { nombre, email, password }
 */
async function register(req, res) {
  try {
    const { nombre, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'Email y password son requeridos' });
    }

    // Verificar si existe
    const [existing] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ ok: false, message: 'Usuario ya registrado con ese email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const [result] = await pool.execute(
      'INSERT INTO usuarios (nombre, email, password_hash, fecha_creacion) VALUES (?, ?, ?, NOW())',
      [nombre || null, email, hashed]
    );

    const usuarioId = result.insertId;

    const token = jwt.sign({ id: usuarioId, email }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      ok: true,
      message: 'Usuario registrado',
      data: { id: usuarioId, email, nombre: nombre || null, token }
    });
  } catch (err) {
    console.error('authController.register error', err);
    return res.status(500).json({ ok: false, message: 'Error interno' });
  }
}

/**
 * Login
 * body: { email, password }
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'Email y password son requeridos' });
    }

    const [rows] = await pool.execute('SELECT id, nombre, email, password_hash FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ ok: false, message: 'Credenciales inválidas' });
    }

    const usuario = rows[0];

    const match = await bcrypt.compare(password, usuario.password_hash);
    if (!match) {
      return res.status(401).json({ ok: false, message: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      ok: true,
      message: 'Autenticación exitosa',
      data: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        token
      }
    });
  } catch (err) {
    console.error('authController.login error', err);
    return res.status(500).json({ ok: false, message: 'Error interno' });
  }
}

module.exports = {
  register,
  login
};
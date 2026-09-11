// C:\xampp\htdocs\gestion-facturas-cotizaciones-ia\src\middlewares\authMiddleware.js
require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_UTS_2026';

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) {
      return res.status(401).json({ ok: false, message: 'Authorization header missing' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ ok: false, message: 'Formato de Authorization inválido. Use: Bearer <token>' });
    }

    const token = parts[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ ok: false, message: 'Token inválido o expirado' });
      }
      // decoded debe contener { id, email } según tu implementación de login
      req.user = decoded;
      next();
    });
  } catch (err) {
    console.error('authMiddleware error:', err);
    return res.status(500).json({ ok: false, message: 'Error en autenticación' });
  }
}

module.exports = authMiddleware;
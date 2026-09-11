// C:\xampp\htdocs\gestion-facturas-cotizaciones-ia\src\config\db.js
require('dotenv').config();
const mysql = require('mysql2/promise');

const {
  DB_HOST = 'localhost',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'gestion_documental_uts',
  DB_CONNECTION_LIMIT = 10
} = process.env;

if (!DB_NAME) {
  console.warn('DB_NAME no está definido en .env — usando "gestion_documental_uts" por defecto');
}

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  decimalNumbers: true,
  namedPlaceholders: false
});

// pool.getConnection() y pool.execute(...) están disponibles con mysql2/promise
module.exports = pool;
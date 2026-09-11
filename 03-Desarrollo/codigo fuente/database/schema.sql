-- Script SQL para XAMPP / phpMyAdmin hecho por xiomara mendoza 
-- Aplicaciones Empresariales - Universidad Tecnológica de Santander
-- Crea la base de datos y las tablas necesarias para el proyecto
-- Base de datos: gestion_documental_uts

DROP DATABASE IF EXISTS gestion_documental_uts;
CREATE DATABASE gestion_documental_uts CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE gestion_documental_uts;

-- Tabla usuarios
CREATE TABLE usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('admin','usuario') NOT NULL DEFAULT 'usuario',
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla repositorios
CREATE TABLE repositorios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla documentos
CREATE TABLE documentos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  repositorio_id INT UNSIGNED NOT NULL,
  nombre_original VARCHAR(255) NOT NULL,
  nombre_servidor VARCHAR(255) NOT NULL,
  ruta_archivo VARCHAR(1024) NOT NULL,
  tipo_formato VARCHAR(50) NOT NULL, -- pdf, docx, txt
  tamano_bytes BIGINT UNSIGNED DEFAULT 0,
  estado_procesamiento ENUM('pendiente','procesando','completado','error') DEFAULT 'pendiente',
  fecha_subida TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (repositorio_id) REFERENCES repositorios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla analisis_ia
CREATE TABLE analisis_ia (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  documento_id INT UNSIGNED NOT NULL,
  categoria ENUM('Factura','Cotización','Cuenta de Cobro','Otro') DEFAULT 'Otro',
  resumen TEXT,
  datos_extraidos_json JSON,
  fecha_analisis TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (documento_id) REFERENCES documentos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla logs_errores
CREATE TABLE logs_errores (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  documento_id INT UNSIGNED NULL,
  mensaje_error TEXT NOT NULL,
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (documento_id) REFERENCES documentos(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inserciones iniciales
-- Nota: password_hash debe ser un hash bcrypt. El siguiente valor es un ejemplo de hash bcrypt para "Password123!".
-- Reemplaza si lo deseas por el hash que generes con bcryptjs en tu entorno.
INSERT INTO usuarios (nombre, email, password_hash, rol)
VALUES ('Admin UTS', 'admin@uts.edu', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8sWq3qQxA1J/6pG0YyF7Z8V7Zr0p6', 'admin');

-- Insertar 3 repositorios de prueba para el usuario con id = 1
INSERT INTO repositorios (usuario_id, nombre, descripcion)
VALUES
  (1, 'Repositorio Facturas 2026', 'Repositorio de facturas de ejemplo para el demo'),
  (1, 'Repositorio Cotizaciones - Ventas', 'Cotizaciones comerciales y propuestas'),
  (1, 'Repositorio Mis Documentos', 'Documentos misceláneos para pruebas');

-- Opcional: crear índices para búsquedas frecuentes
CREATE INDEX idx_documentos_repositorio ON documentos(repositorio_id);
CREATE INDEX idx_analisis_documento ON analisis_ia(documento_id);
CREATE INDEX idx_logs_documento ON logs_errores(documento_id);
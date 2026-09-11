# Fase V — Implementación y Despliegue
## Sistema de Gestión Documental de Facturas y Cotizaciones con IA

---

## 1. Descripción del Ambiente de Implementación

El sistema se implementa bajo un ambiente de **desarrollo local con simulación de servidor**, que reproduce las condiciones de un entorno de producción reducido, apto para fines académicos y de validación funcional.

| Componente | Rol en el ambiente | Herramienta utilizada |
|---|---|---|
| Servidor de aplicaciones | Ejecuta la API REST en Node.js/Express | Node.js (runtime local) |
| Servidor de base de datos | Gestiona el motor MySQL | XAMPP (módulo MySQL/MariaDB) |
| Administrador de BD | Interfaz gráfica de administración | phpMyAdmin (incluido en XAMPP) |
| Cliente | Consumo de la interfaz web | Navegador (Chrome/Edge) |
| Servicio de IA | Procesamiento de lenguaje natural | Groq Cloud API (externo, bajo demanda) |

Este esquema permite validar el ciclo completo de la aplicación (autenticación, carga de documentos, análisis con IA y búsqueda semántica) sin necesidad de un servidor de producción dedicado, cumpliendo así con el alcance definido para el proyecto de VI semestre.

---

## 2. Requisitos de Hardware y Software

### 2.1 Requisitos del Servidor (equipo donde corre el backend y XAMPP)

| Recurso | Mínimo | Recomendado |
|---|---|---|
| Procesador | Dual Core 2.0 GHz | Quad Core 2.5 GHz+ |
| Memoria RAM | 4 GB | 8 GB o superior |
| Almacenamiento | 5 GB libres | 10 GB libres (SSD recomendado) |
| Sistema Operativo | Windows 10 / Linux Ubuntu 20.04+ | Windows 11 / Ubuntu 22.04+ |
| Conexión a Internet | Requerida (para consumo de Groq API) | Banda ancha estable |

### 2.2 Requisitos de Software (Servidor)

| Software | Versión mínima | Propósito |
|---|---|---|
| Node.js | 18.x LTS | Motor de ejecución del backend |
| npm | 9.x | Gestor de dependencias |
| XAMPP | 8.0+ (PHP 8, MySQL/MariaDB) | Motor de base de datos y phpMyAdmin |
| Git | 2.40+ | Control de versiones y clonación del repositorio |
| Editor de código | VS Code (recomendado) | Desarrollo y mantenimiento |

### 2.3 Requisitos del Cliente (usuario final)

| Recurso | Requisito |
|---|---|
| Navegador web | Google Chrome, Microsoft Edge o Firefox (versión reciente) |
| Resolución mínima | 1280x720 |
| Conexión a Internet | Requerida para el correcto funcionamiento de la app |
| JavaScript | Habilitado en el navegador |

---

## 3. Configuración de Base de Datos y Almacenamiento

### 3.1 Motor y nombre de la base de datos

- **Motor:** MySQL (gestionado mediante XAMPP)
- **Nombre de la base de datos:** `gestion_documental_uts`
- **Administración:** phpMyAdmin (`http://localhost/phpmyadmin`)

### 3.2 Script de creación de la base de datos (`schema.sql`)

```sql
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
INSERT INTO usuarios (nombre, email, password_hash, rol)
VALUES ('Admin UTS', 'admin@uts.edu', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8sWq3qQxA1J/6pG0YyF7Z8V7Zr0p6', 'admin');

INSERT INTO repositorios (usuario_id, nombre, descripcion)
VALUES
  (1, 'Repositorio Facturas 2026', 'Repositorio de facturas de ejemplo para el demo'),
  (1, 'Repositorio Cotizaciones - Ventas', 'Cotizaciones comerciales y propuestas'),
  (1, 'Repositorio Mis Documentos', 'Documentos misceláneos para pruebas');

CREATE INDEX idx_documentos_repositorio ON documentos(repositorio_id);
CREATE INDEX idx_analisis_documento ON analisis_ia(documento_id);
CREATE INDEX idx_logs_documento ON logs_errores(documento_id);
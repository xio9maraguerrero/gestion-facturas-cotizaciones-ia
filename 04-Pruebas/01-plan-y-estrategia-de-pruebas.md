# 01. Plan y Estrategia de Pruebas

## Proyecto: Gestión de Facturas y Cotizaciones con IA
## Fase IV: Pruebas y Aseguramiento de Calidad

---

## 1. Objetivo y Alcance del Plan de Pruebas

### 1.1 Objetivo

Verificar y validar que el sistema **"Gestión de Facturas y Cotizaciones con IA"** cumpla con los requisitos funcionales y no funcionales definidos en las Fases I y II del proyecto, garantizando el correcto funcionamiento de los módulos de autenticación, gestión documental, procesamiento con inteligencia artificial (Groq API) y persistencia de datos en MySQL, antes de su despliegue o entrega final.

### 1.2 Alcance

El presente plan cubre:

- **Backend (API REST):** endpoints de autenticación, repositorios, documentos, análisis e inteligencia artificial (`src/routes/`, `src/controllers/`).
- **Integración con servicios externos:** comunicación con la API de Groq Cloud (`llama-3.3-70b-versatile`).
- **Persistencia de datos:** operaciones CRUD sobre la base de datos MySQL (`gestion_documental_uts`), verificadas mediante phpMyAdmin.
- **Frontend:** flujos de interacción del usuario en `public/index.html` y `public/app.js` (pruebas End-to-End básicas desde navegador).
- **Seguridad básica:** validación de JWT, hashing de contraseñas y control de acceso a rutas protegidas.

Quedan **fuera del alcance** de esta fase las pruebas de carga masiva (*stress testing*), pruebas de penetración avanzadas (*pentesting*) y pruebas de compatibilidad multi-navegador exhaustivas, dado el carácter académico del proyecto.

---

## 2. Estrategia de Pruebas

La estrategia combina distintos niveles de prueba para garantizar cobertura tanto funcional como de integración:

| Tipo de Estrategia | Descripción | Herramienta |
|---|---|---|
| **Pruebas de Caja Negra (API)** | Verificación de los endpoints REST sin conocimiento interno del código, evaluando entradas y salidas esperadas (códigos de estado HTTP, estructura JSON de respuesta) | Postman / Thunder Client |
| **Pruebas de Caja Negra (Frontend)** | Verificación de los flujos de usuario desde la interfaz web, sin inspeccionar la lógica interna de `app.js` | Navegador web (Chrome/Edge) |
| **Pruebas de Integración (MySQL)** | Validación de que las operaciones del backend se reflejen correctamente en la base de datos (inserciones, actualizaciones, consultas) | phpMyAdmin |
| **Pruebas de Integración (Groq Cloud)** | Validación de la comunicación entre `aiService.js` y la API externa de Groq, incluyendo manejo de respuestas y errores | Postman / Thunder Client + logs del servidor |

Esta combinación permite validar el sistema tanto de forma **aislada** (cada endpoint por separado) como de forma **integrada** (el flujo completo: carga de documento → extracción → IA → persistencia → visualización).

---

## 3. Tipos de Pruebas Aplicadas

| Categoría | Descripción |
|---|---|
| **Funcionales** | Validan que las funcionalidades base (registro, login, creación de repositorios, gestión de documentos) operen conforme a lo especificado |
| **Validación de Archivos** | Verifican la correcta aceptación de formatos permitidos (PDF, DOCX, TXT) y el rechazo de formatos no soportados o archivos corruptos |
| **Procesamiento de IA** | Validan la correcta normalización del texto extraído y su envío estructurado hacia la API de Groq (`llama-3.3-70b-versatile`) |
| **Extracción / Clasificación** | Verifican que el modelo de IA extraiga correctamente datos estructurados clave (proveedor, total, fecha, tipo de documento) |
| **Búsqueda / RAG (Retrieval-Augmented)** | Validan las consultas semánticas sobre documentos previamente procesados y la generación de respuestas enriquecidas basadas en dicho contenido |
| **Seguridad Básica** | Verifican el control de acceso mediante JWT y el correcto hashing de contraseñas (`bcryptjs`) |
| **Manejo de Errores y Casos Límite** | Evalúan el comportamiento del sistema ante fallas de servicios externos (MySQL, Groq API), archivos vacíos, PDFs escaneados sin texto, entre otros escenarios adversos |

---

## 4. Entorno de Pruebas

### 4.1 Hardware

| Componente | Especificación mínima utilizada |
|---|---|
| Procesador | Intel Core i5 / equivalente AMD (o superior) |
| Memoria RAM | 8 GB mínimo |
| Almacenamiento | 10 GB de espacio libre disponible |
| Conexión a Internet | Requerida para las pruebas de integración con Groq API |

### 4.2 Software

| Componente | Versión / Detalle |
|---|---|
| Sistema Operativo | Windows 10/11 (entorno de desarrollo y pruebas) |
| Node.js | v18 LTS o superior |
| XAMPP | Incluye Apache y MySQL/MariaDB |
| MySQL | Gestionado vía XAMPP, base de datos `gestion_documental_uts` |
| Navegador Web | Google Chrome / Microsoft Edge (última versión estable) |
| Postman / Thunder Client | Cliente REST utilizado para pruebas de API (Thunder Client como extensión de VS Code) |
| phpMyAdmin | Verificación visual de la persistencia de datos en MySQL |

---

## 5. Matriz de Trazabilidad Requisito – Prueba

La siguiente matriz relaciona los requisitos funcionales (RF) y no funcionales (RNF) definidos en las Fases I y II del proyecto con los casos de prueba (CP) documentados en el Archivo 2 (`02-casos-de-prueba-y-ejecucion.md`).

| Requisito | Descripción del Requisito | Caso(s) de Prueba Asociado(s) |
|---|---|---|
| RF-01 | El sistema debe permitir el registro e inicio de sesión de usuarios mediante autenticación segura | CP-01, CP-09 |
| RF-02 | El sistema debe permitir la creación y organización de repositorios de documentos | CP-02 |
| RF-03 | El sistema debe permitir la carga de documentos en formatos PDF, DOCX y TXT | CP-03, CP-04 |
| RF-04 | El sistema debe validar y rechazar archivos no soportados o corruptos | CP-04, CP-11 |
| RF-05 | El sistema debe normalizar el texto extraído de los documentos antes de enviarlo al módulo de IA | CP-05 |
| RF-06 | El sistema debe procesar el contenido documental mediante la API de Groq (`llama-3.3-70b-versatile`) | CP-05, CP-10 |
| RF-07 | El sistema debe extraer datos estructurados (proveedor, total, fecha, tipo de documento) | CP-06 |
| RF-08 | El sistema debe permitir consultas semánticas (RAG) sobre documentos previamente procesados | CP-07 |
| RNF-01 (Seguridad) | El sistema debe restringir el acceso a rutas protegidas sin autenticación válida (JWT) | CP-08 |
| RNF-02 (Seguridad) | Las contraseñas deben almacenarse cifradas mediante hashing, nunca en texto plano | CP-09 |
| RNF-03 (Confiabilidad) | El sistema debe manejar adecuadamente errores de conexión con MySQL o con servicios externos (Groq API) | CP-10 |
| RNF-04 (Robustez) | El sistema debe manejar adecuadamente casos límite (archivos vacíos, PDFs sin capa de texto) | CP-11 |
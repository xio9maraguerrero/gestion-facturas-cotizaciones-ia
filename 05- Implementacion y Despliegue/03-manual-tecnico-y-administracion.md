# Fase V — Manual Técnico y de Administración
## Sistema de Gestión Documental de Facturas y Cotizaciones con IA

---

## 1. Arquitectura del Código Fuente

El backend del sistema sigue una **arquitectura modular en capas**, propia de aplicaciones Node.js/Express de mediana complejidad, lo cual favorece el mantenimiento, la escalabilidad y la separación de responsabilidades.

```
gestion-facturas-cotizaciones-ia/
├── database/
│   └── schema.sql
├── public/
│   ├── vendor/
│   │   ├── chart.umd.min.js
│   │   └── marked.min.js
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── aiController.js
│   │   ├── analisisController.js
│   │   ├── authController.js
│   │   └── docController.js
│   ├── middlewares/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── ai.routes.js
│   │   ├── analisis.routes.js
│   │   ├── auth.routes.js
│   │   ├── docs.routes.js
│   │   ├── documentos.routes.js
│   │   └── repos.routes.js
│   └── services/
│       ├── aiService.js
│       └── textExtractor.js
├── uploads/
├── .env.example
├── package.json
├── package-lock.json
└── server.js
```

### 1.1 Descripción de cada capa

| Ruta | Responsabilidad |
|---|---|
| `server.js` | Punto de entrada de la aplicación. Inicializa Express, carga middlewares globales, monta las rutas modulares de `src/routes/` y levanta el servidor en el puerto definido por `PORT`. |
| `database/schema.sql` | Script único de creación de la base de datos `gestion_documental_uts`, sus tablas (`usuarios`, `repositorios`, `documentos`, `analisis_ia`, `logs_errores`), índices y datos iniciales. |
| `public/` | Frontend estático servido directamente por Express: `index.html` (estructura de la interfaz), `styles.css` (estilos CSS3) y `app.js` (lógica del cliente mediante Fetch API y manipulación del DOM). |
| `public/vendor/` | Librerías de terceros cargadas del lado del cliente sin gestor de paquetes: `chart.umd.min.js` (gráficos e indicadores visuales) y `marked.min.js` (renderizado de contenido Markdown/resúmenes generados por IA en el navegador). |
| `src/config/db.js` | Configuración centralizada de la conexión a MySQL mediante `mysql2`, leyendo credenciales (`DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`) desde variables de entorno cargadas con `dotenv`. |
| `src/controllers/authController.js` | Lógica de registro y login de usuarios: validación de datos, hashing/verificación de contraseñas con `bcryptjs` y emisión de tokens JWT. |
| `src/controllers/docController.js` | Gestión de repositorios y documentos: creación de repositorios, carga de archivos (junto con `multer`), listado y eliminación. |
| `src/controllers/aiController.js` | Orquesta el análisis de un documento: invoca `src/services/textExtractor.js` para obtener el texto y `src/services/aiService.js` para el análisis con IA. |
| `src/controllers/analisisController.js` | Expone y gestiona los resultados almacenados en `analisis_ia` (consulta de categoría, resumen y `datos_extraidos_json`), y soporta las consultas de búsqueda semántica (RAG) sobre el contenido ya analizado. |
| `src/middlewares/authMiddleware.js` | Middleware único de autenticación: valida el token JWT recibido en el encabezado `Authorization`, adjunta el usuario autenticado a la solicitud y verifica el campo `rol` (`admin` / `usuario`) para las rutas restringidas. |
| `src/routes/auth.routes.js` | Endpoints de registro e inicio de sesión (`/api/auth/...`), consumidos por `authController`. |
| `src/routes/repos.routes.js` | Endpoints de gestión de repositorios (`/api/repos/...`), consumidos por `docController`. |
| `src/routes/docs.routes.js` y `src/routes/documentos.routes.js` | Endpoints relacionados con la carga, listado y administración de documentos, consumidos por `docController`. |
| `src/routes/ai.routes.js` | Endpoint que dispara el análisis con IA de un documento (`/api/ai/...`), consumido por `aiController`. |
| `src/routes/analisis.routes.js` | Endpoints de consulta de resultados de análisis y de búsqueda semántica/RAG, consumidos por `analisisController`. |
| `src/services/aiService.js` | Encapsula la comunicación con Groq Cloud API: construcción del prompt, envío del texto extraído, parseo de la respuesta del modelo `llama-3.3-70b-versatile` y manejo de errores/límites de tasa. |
| `src/services/textExtractor.js` | Extracción de texto plano a partir de los archivos cargados, usando `pdf-parse` (PDF), `mammoth` (DOCX) y `fs` (TXT). |
| `uploads/` | Almacenamiento físico de los documentos cargados por los usuarios, gestionado por el middleware `multer` desde `docController`. |
| `.env.example` | Plantilla de variables de entorno del proyecto, sin credenciales reales. |

### 1.2 Flujo general de una solicitud

```
Cliente (public/app.js)
   → server.js (enruta la solicitud a src/routes/*.routes.js)
      → src/middlewares/authMiddleware.js (valida JWT y rol)
         → src/controllers/*Controller.js (ejecuta la lógica de negocio)
            → src/services/textExtractor.js (extrae texto del documento, si aplica)
            → src/services/aiService.js (consulta a Groq Cloud API, si aplica)
            → src/config/db.js (consulta/actualiza MySQL vía mysql2)
               → respuesta JSON al cliente
               → (en caso de falla) registro en la tabla logs_errores
```

**Ejemplo — análisis de un documento con IA:**

1. `public/app.js` envía la solicitud a `src/routes/ai.routes.js`.
2. `authMiddleware.js` valida el token JWT del usuario.
3. `aiController.js` recupera el documento desde la base de datos (`src/config/db.js`) y su archivo físico en `uploads/`.
4. `textExtractor.js` extrae el texto según el `tipo_formato` (PDF, DOCX o TXT).
5. `aiService.js` envía el texto a Groq Cloud API y procesa la respuesta del modelo `llama-3.3-70b-versatile`.
6. `analisisController.js`, junto con `aiController.js`, persiste el resultado (`categoria`, `resumen`, `datos_extraidos_json`) en la tabla `analisis_ia`, o registra el incidente en `logs_errores` si el proceso falla.

### 1.3 Modelo de datos de referencia

El código fuente opera sobre las cinco tablas definidas en `database/schema.sql`: `usuarios`, `repositorios`, `documentos`, `analisis_ia` y `logs_errores`. Es responsabilidad del equipo de mantenimiento conservar la correspondencia exacta entre este esquema y las consultas implementadas en `src/config/db.js`, `src/controllers/` y `src/services/`.

---

## 2. Mantenimiento y Soporte Técnico

### 2.1 Estrategia de Respaldo (Backup)

**Respaldo de la base de datos (MySQL vía phpMyAdmin):**

1. Ingresar a `http://localhost/phpmyadmin`.
2. Seleccionar la base de datos `gestion_documental_uts`.
3. Ir a la pestaña **"Exportar"**.
4. Elegir el método **"Rápido"** y formato **SQL**.
5. Descargar el archivo generado (ej. `gestion_documental_uts_backup_AAAAMMDD.sql`) y almacenarlo en una ubicación segura fuera del servidor local.

**Respaldo de archivos físicos:**

```bash
# Ejemplo de respaldo comprimido de la carpeta de documentos
tar -czvf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

Se recomienda una periodicidad **semanal** para entornos de práctica académica, y **diaria** si el sistema se usa de forma continua con datos reales.

### 2.2 Estrategia de Recuperación ante Desastres

| Escenario | Procedimiento de recuperación |
|---|---|
| Pérdida o corrupción de la base de datos | Restaurar el último `.sql` exportado desde phpMyAdmin, pestaña **"Importar"**. Si no hay respaldo disponible, re-ejecutar `database/schema.sql` (nota: esto reinicia los datos a los valores iniciales del script, incluyendo el usuario `Admin UTS` y los tres repositorios de ejemplo). |
| Pérdida de archivos en `uploads/` | Restaurar desde el último respaldo `.tar.gz` (o `.zip`) generado. Los registros de `documentos` cuyo archivo físico no pueda recuperarse deben marcarse como `error` en `estado_procesamiento`. |
| Falla total del entorno local (XAMPP/Node.js) | Reinstalar XAMPP y Node.js, clonar nuevamente el repositorio `gestion-facturas-cotizaciones-ia`, restaurar `.env` a partir de `.env.example`, ejecutar `database/schema.sql` mediante `npm install` y restaurar el respaldo de datos más reciente. |
| Pérdida de la clave `GROQ_API_KEY` | Generar una nueva clave desde el panel de Groq Cloud y actualizar el archivo `.env`. |

### 2.3 Plan de Mantenimiento Preventivo y Correctivo

**Mantenimiento preventivo (periódico):**
- Limpieza de archivos huérfanos en `uploads/` (archivos físicos sin registro correspondiente en la tabla `documentos`, producto de cargas fallidas).
- Revisión periódica de la tabla `logs_errores` para identificar patrones recurrentes de fallas antes de que se conviertan en incidentes mayores.
- Revisión y actualización de dependencias declaradas en `package.json` / `package-lock.json`:

```bash
# Verificar dependencias desactualizadas
npm outdated

# Actualizar dependencias de forma controlada
npm update

# Auditoría de vulnerabilidades
npm audit
npm audit fix
```

- Rotación periódica de credenciales sensibles: `JWT_SECRET` y `GROQ_API_KEY`, actualizando el archivo `.env` y notificando a los usuarios administradores.
- Verificación del espacio en disco disponible para el crecimiento de la carpeta `uploads/`.
- Revisión ocasional de las librerías estáticas en `public/vendor/` (`chart.umd.min.js`, `marked.min.js`) para confirmar que no existan versiones con vulnerabilidades conocidas.

**Mantenimiento correctivo (ante fallas detectadas):**
- Consulta de `logs_errores` filtrando por `documento_id` para aislar la causa raíz de un fallo reportado.
- Corrección de errores en los controladores (`src/controllers/`) o servicios (`src/services/`) identificados durante pruebas o uso real.
- Reprocesamiento manual de documentos cuyo `estado_procesamiento` haya quedado en `error`, una vez corregida la causa (por ejemplo, tras restablecer la conexión con Groq Cloud API).
- Ajuste de límites de tamaño de archivo en el middleware `multer` (invocado desde `docController.js`) si se detectan fallos recurrentes de carga.

### 2.4 Diagnóstico y Resolución de Fallas Técnicas Frecuentes

| Falla | Causa probable | Solución |
|---|---|---|
| Error de conexión a MySQL (`ECONNREFUSED`) | El servicio MySQL de XAMPP no está iniciado, o las credenciales en `.env` son incorrectas | Iniciar el módulo MySQL desde el panel de XAMPP; verificar `DB_HOST`, `DB_USER`, `DB_PASS` y `DB_NAME` en `.env`; confirmar que `src/config/db.js` pueda establecer la conexión al iniciar `server.js` |
| Error 500 al analizar documentos con IA | Modelo Groq deprecado, cuota agotada, o clave `GROQ_API_KEY` inválida | Verificar el estado del modelo `llama-3.3-70b-versatile` en la documentación oficial de Groq; regenerar la API Key si es necesario; revisar el saldo/cuota disponible; consultar el detalle del error en `logs_errores` |
| Token JWT expirado o inválido (`401 Unauthorized`) | El usuario permaneció inactivo más allá del tiempo de expiración del token, o `JWT_SECRET` fue modificado en el servidor | Solicitar al usuario iniciar sesión nuevamente; evitar cambiar `JWT_SECRET` en producción sin invalidar sesiones activas de forma controlada; revisar la lógica de `src/middlewares/authMiddleware.js` |
| Error `429 Too Many Requests` desde Groq API | Se superó el límite de tasa (rate limit) del plan contratado en Groq Cloud | Implementar reintentos con espera (backoff) en `src/services/aiService.js`; limitar la frecuencia de análisis simultáneos; considerar actualizar el plan de Groq si el uso es constante |
| Documento queda en `estado_procesamiento = error` | El PDF es una imagen escaneada sin capa de texto, el DOCX está corrupto, o falló la llamada a Groq API | Revisar el `mensaje_error` correspondiente en `logs_errores`; verificar en `src/services/textExtractor.js` que el PDF contenga texto seleccionable; en caso de documentos escaneados, evaluar la incorporación de OCR como mejora futura |
| Puerto 3000 ocupado al iniciar `server.js` | Otra instancia del proceso Node.js sigue activa, o el puerto es usado por otra aplicación | Finalizar el proceso anterior o cambiar el valor de `PORT` en el archivo `.env` |
| `datos_extraidos_json` llega vacío o mal formado | La respuesta del modelo de IA no cumplió el formato JSON esperado | Revisar el prompt/parseo en `src/services/aiService.js`; registrar el caso en `logs_errores` para ajustar la validación de la respuesta de Groq |
| El frontend no renderiza gráficos o resúmenes en Markdown | Falla en la carga de las librerías estáticas de `public/vendor/` (`chart.umd.min.js` o `marked.min.js`) | Verificar que los archivos existan en `public/vendor/` y que `index.html` los referencie correctamente; revisar la consola del navegador para errores 404 |

---

## 3. Recomendaciones Generales de Operación

- Mantener siempre una copia actualizada del archivo `.env.example` en el repositorio (sin datos sensibles reales) para facilitar la puesta en marcha en nuevos entornos.
- Documentar cualquier cambio en el esquema de base de datos directamente en `database/schema.sql`, manteniendo la trazabilidad del modelo de datos y actualizando este manual en consecuencia.
- Supervisar periódicamente la tabla `logs_errores` como fuente principal de diagnóstico, en lugar de depender únicamente de la consola del servidor.
- Validar, antes de cada sesión de demostración o sustentación, que el servicio de Groq Cloud esté operativo y que la clave configurada en `.env` tenga cuota disponible.
- Evitar modificar directamente los archivos de `public/vendor/`; cualquier actualización de dichas librerías debe hacerse reemplazando el archivo completo y verificando la compatibilidad con `app.js`.

---

*Documento generado como parte del entregable de la Fase V — Implementación, Despliegue, Manuales y Mantenimiento.*

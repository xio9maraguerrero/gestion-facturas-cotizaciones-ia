# Fase V — Manual de Usuario
## Sistema de Gestión Documental de Facturas y Cotizaciones con IA

**Institución:** Unidades Tecnológicas de Santander (UTS)
**Asignatura:** Desarrollo de Aplicaciones Empresariales (VI Semestre)
**Docente:** Wilson Castaño Galviz
**Repositorio Git:** `gestion-facturas-cotizaciones-ia`
**Documento:** 06-manual-de-usuario.md

---

## 1. Introducción

Este manual está dirigido al usuario final del **Sistema de Gestión Documental de Facturas y Cotizaciones con IA**, y tiene como propósito guiarlo en el uso de todas las funcionalidades disponibles: registro, autenticación, gestión de repositorios, carga de documentos, análisis inteligente y búsqueda semántica.

## 2. Requisitos para el Usuario

| Requisito | Detalle |
|---|---|
| Navegador web | Google Chrome o Microsoft Edge (versión reciente) |
| Conexión a Internet | Necesaria para el correcto funcionamiento del análisis con IA |
| Resolución de pantalla | 1280x720 o superior recomendada |
| Cuenta de usuario | Registro previo en el sistema (ver Paso 1) |

---

## 3. Guía Paso a Paso

### Paso 1: Registro de Usuario y Login

1. Ingresar a la URL del sistema: `http://localhost:3000`.
2. En la pantalla de bienvenida, seleccionar la opción **"Registrarse"**.
3. Completar el formulario con: nombre completo (`nombre`), correo electrónico (`email`) y contraseña.
4. Confirmar el registro. El sistema almacena la contraseña de forma segura en el campo `password_hash`, cifrada mediante `bcryptjs`, nunca en texto plano. Por defecto, todo usuario nuevo se registra con `rol = usuario`.
5. Una vez registrado, dirigirse a la pantalla de **"Iniciar sesión"** e ingresar el `email` y la contraseña registrados.
6. Al autenticarse correctamente, el sistema emite un token de sesión (JWT) y redirige al usuario al panel principal (dashboard).

> **Consejo:** Utiliza una contraseña que combine letras, números y caracteres especiales para mayor seguridad.

### Paso 2: Creación y Gestión de Repositorios

Los repositorios funcionan como carpetas o categorías donde se organizan los documentos. El sistema incluye por defecto tres repositorios de ejemplo asociados al usuario administrador: **"Repositorio Facturas 2026"**, **"Repositorio Cotizaciones - Ventas"** y **"Repositorio Mis Documentos"**.

1. Desde el panel principal, seleccionar **"Nuevo repositorio"**.
2. Asignar un nombre (`nombre`) y, opcionalmente, una descripción (`descripcion`).
3. Confirmar la creación; el nuevo repositorio aparecerá listado en el panel del usuario, asociado a su `usuario_id`.
4. Cada repositorio puede renombrarse o eliminarse desde el menú de opciones (⋮) junto a su nombre.

> **Nota:** Eliminar un repositorio elimina también, de forma permanente, todos los documentos, análisis de IA y registros de log asociados a él (relación en cascada).

### Paso 3: Carga y Almacenamiento de Documentos

1. Ingresar al repositorio correspondiente.
2. Seleccionar el botón **"Subir documento"**.
3. Elegir un archivo desde el equipo en alguno de los formatos soportados (`tipo_formato`):

| Formato | Extensión | Procesamiento |
|---|---|---|
| PDF | `.pdf` | Extracción de texto mediante `pdf-parse` |
| Word | `.docx` | Extracción de texto mediante `mammoth` |
| Texto plano | `.txt` | Lectura directa mediante `fs` |

4. Confirmar la carga. El sistema almacena el archivo físicamente en `/uploads/` y registra en la tabla `documentos` su nombre original, nombre en servidor, ruta, formato y tamaño en bytes.
5. Mientras se procesa, el documento pasa por los estados `pendiente` → `procesando` → `completado` (o `error` si algo falla), visibles en la lista de documentos del repositorio.

### Paso 4: Ejecución del Análisis con Inteligencia Artificial

1. Desde la lista de documentos, seleccionar el documento a analizar.
2. Hacer clic en **"Analizar con IA"**.
3. El sistema envía el texto extraído del documento al modelo `llama-3.3-70b-versatile` a través de Groq Cloud API.
4. El proceso clasifica el documento y retorna información estructurada, almacenada en la tabla `analisis_ia`:
   - **Categoría** (`categoria`): Factura, Cotización, Cuenta de Cobro u Otro.
   - **Resumen** (`resumen`): descripción general del contenido del documento.
   - **Datos extraídos** (`datos_extraidos_json`): estructura JSON con los campos específicos identificados en el documento (por ejemplo, proveedor, fecha, valores).
5. Los resultados se muestran en pantalla, organizados por categoría, y quedan almacenados para consultas futuras.

> **Tiempo estimado de análisis:** entre 5 y 15 segundos, dependiendo del tamaño del documento y la disponibilidad del servicio de IA.

### Paso 5: Búsqueda Semántica / Preguntas al Documento (RAG)

1. Dentro de un documento ya analizado (`estado_procesamiento = completado`), acceder a la pestaña **"Preguntar al documento"**.
2. Escribir una pregunta en lenguaje natural relacionada con el contenido (por ejemplo: *"¿Cuál es la categoría y el valor total de este documento?"*).
3. El sistema utiliza la técnica de **Recuperación Aumentada por Generación (RAG)** para identificar los fragmentos más relevantes del texto extraído y generar una respuesta contextualizada.
4. La respuesta se muestra en pantalla junto con el fragmento de texto que la respalda.

---

## 4. Preguntas Frecuentes (FAQ)

**¿Qué hago si olvidé mi contraseña?**
Actualmente el sistema no cuenta con recuperación automática de contraseña en esta versión académica; se recomienda contactar al administrador del sistema para restablecer el campo `password_hash` manualmente en la base de datos.

**¿Por qué no puedo subir un archivo?**
Verifica que el archivo esté en uno de los formatos soportados (PDF, DOCX o TXT) y que su tamaño no exceda el límite configurado en el servidor. Si el problema persiste, revisa tu conexión a internet.

**¿Qué significa que un documento quede en estado "error"?**
El campo `estado_procesamiento` cambia a `error` cuando la extracción de texto o el análisis con IA no pudieron completarse. El detalle técnico queda registrado en la tabla `logs_errores`; contacta al administrador para su revisión.

**¿Qué categorías puede asignar la IA a mis documentos?**
El sistema clasifica automáticamente cada documento en una de las siguientes categorías: **Factura**, **Cotización**, **Cuenta de Cobro** u **Otro**, según el contenido detectado.

**¿Puedo subir el mismo documento a varios repositorios?**
Sí, siempre y cuando se cargue de manera independiente en cada repositorio; el sistema no vincula un mismo archivo físico entre repositorios distintos.

**¿Es seguro cargar documentos con información financiera?**
Los documentos se almacenan en el servidor local del proyecto y el acceso a las rutas protegidas requiere autenticación mediante JWT. No obstante, al ser un entorno académico de desarrollo local, no se recomienda cargar información financiera real o sensible de producción.

**¿Qué pasa si el análisis de IA tarda demasiado o falla?**
Espera unos segundos y vuelve a intentarlo. Si el error persiste, contacta al administrador del sistema, quien podrá revisar el estado del documento (`estado_procesamiento`) y los registros correspondientes en `logs_errores`.

---

*Documento generado como parte del entregable de la Fase V — Implementación, Despliegue, Manuales y Mantenimiento.*

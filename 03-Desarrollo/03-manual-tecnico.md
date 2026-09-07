# 03 - Manual Técnico

**Proyecto:** Gestión de Facturas y Cotizaciones con IA
**Fase:** III - Desarrollo e Implementación
**Audiencia:** Docente evaluador / equipo de desarrollo

---

## 1. Prerrequisitos

Antes de desplegar el proyecto localmente, es necesario contar con el siguiente software instalado:

| Software | Versión requerida | Propósito |
|---|---|---|
| **Node.js** | v18 LTS o superior | Entorno de ejecución del backend (incluye npm) |
| **XAMPP** | Última versión estable | Provee el servidor MySQL y phpMyAdmin |
| **Visual Studio Code** | Última versión estable | Editor de código recomendado para revisión |
| **Navegador Web** | Chrome / Firefox / Edge actualizado | Consumo de la interfaz frontend |
| **Cuenta en Groq Cloud** | — | Obtención gratuita de la `GROQ_API_KEY` en [console.groq.com](https://console.groq.com) |

> **Verificación de Node.js:** ejecutar `node -v` y `npm -v` en la terminal para confirmar la instalación correcta antes de continuar.

---

## 2. Configuración de la Base de Datos en phpMyAdmin

### Paso 1 — Iniciar los servicios de XAMPP

Abrir el **Panel de Control de XAMPP** e iniciar los módulos **Apache** y **MySQL**.

### Paso 2 — Acceder a phpMyAdmin

Ingresar desde el navegador a `http://localhost/phpmyadmin`.

### Paso 3 — Crear la base de datos

Crear una nueva base de datos llamada exactamente:

```
gestion_documental_uts
```

Se recomienda usar el cotejamiento (*collation*) `utf8mb4_general_ci` para soportar correctamente tildes y caracteres especiales del español.

### Paso 4 — Ejecutar el script `schema.sql`

1. Con la base de datos `gestion_documental_uts` seleccionada, ir a la pestaña **SQL** de phpMyAdmin.
2. Abrir el archivo `03-desarrollo/codigo-fuente/database/schema.sql` con un editor de texto, copiar su contenido completo y pegarlo en el cuadro de la pestaña SQL.
3. Presionar **Continuar / Ejecutar**.
4. Verificar en el panel izquierdo que se hayan creado las cinco tablas: `usuarios`, `repositorios`, `documentos`, `analisis_ia` y `logs_errores`.

> **Alternativa:** también se puede usar la opción **Importar** de phpMyAdmin, seleccionando directamente el archivo `schema.sql` sin necesidad de copiar y pegar el contenido.

---

## 3. Configuración del Archivo `.env`

### Paso 1 — Duplicar la plantilla

Dentro de `03-desarrollo/codigo-fuente/`, copiar el archivo `.env.example` y renombrar la copia a `.env`.

### Paso 2 — Completar las variables de entorno

Editar el archivo `.env` con los siguientes valores:

```
# Configuración del servidor
PORT=3000

# Configuración de MySQL (XAMPP)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=gestion_documental_uts

# Seguridad
JWT_SECRET=coloque_aqui_una_clave_secreta_larga_y_unica
JWT_EXPIRES_IN=1h

# Groq API
GROQ_API_KEY=coloque_aqui_su_api_key_de_groq
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
GROQ_MODEL=llama-3.3-70b-versatile
```

**Notas importantes:**
- `DB_PASSWORD` normalmente queda **vacío** en instalaciones por defecto de XAMPP (usuario `root` sin contraseña).
- `JWT_SECRET` debe ser una cadena larga y aleatoria; nunca debe compartirse ni subirse al repositorio.
- La `GROQ_API_KEY` se obtiene gratuitamente creando una cuenta en [console.groq.com](https://console.groq.com), en la sección **API Keys**.
- El archivo `.env` **no debe subirse a GitHub**; debe estar listado en `.gitignore`. Solo `.env.example` (sin valores reales) forma parte del repositorio.

---

## 4. Instalación de Dependencias y Arranque del Servidor

### Paso 1 — Instalar dependencias

Abrir una terminal dentro de `03-desarrollo/codigo-fuente/` y ejecutar:

```bash
npm install
```

Esto instalará todas las dependencias declaradas en `package.json`, incluyendo `express`, `mysql2`, `multer`, `pdf-parse`, `mammoth`, `jsonwebtoken`, `bcryptjs` y `dotenv`.

### Paso 2 — Iniciar el servidor

Para un entorno de **producción/evaluación simple**:

```bash
npm start
```

Para un entorno de **desarrollo con recarga automática** (usando `nodemon`, si está configurado en `package.json`):

```bash
npm run dev
```

### Paso 3 — Verificar el arranque

En la terminal debe observarse un mensaje similar a:

```
Servidor corriendo en http://localhost:3000
Conexión a MySQL establecida correctamente
```

Abrir el navegador en `http://localhost:3000` para acceder a la vista de login (`index.html`).

---

## 5. Guía de Pruebas Rápidas

### 5.1 Creación de Usuario

1. Ir a la vista de registro (o usar directamente el endpoint `POST /api/auth/register` desde Postman/Insomnia).
2. Completar `nombre_completo`, `correo`, `contrasena` y `rol` (`administrador` o `colaborador`).
3. Verificar en phpMyAdmin, tabla `usuarios`, que el registro exista y que `contrasena_hash` **no** sea texto plano.

### 5.2 Inicio de Sesión

1. Ingresar el correo y contraseña registrados en la vista de login.
2. Confirmar que el sistema redirige al `dashboard.html` y que el token JWT se almacena correctamente en el navegador (verificable desde las herramientas de desarrollador → Application → Local/Session Storage).

### 5.3 Creación de Repositorio y Carga de Documentos

1. Desde `repositorio.html`, crear un nuevo repositorio (por ejemplo, "Pruebas Fase III").
2. Cargar un archivo de prueba en formato **PDF**, verificar respuesta `201 Created`.
3. Repetir la prueba con un archivo **DOCX** y un archivo **TXT**, confirmando que los tres formatos se procesan sin error.
4. Verificar en la carpeta `uploads/` que los archivos se almacenaron físicamente, y en la tabla `documentos` que los metadatos coincidan.

### 5.4 Procesamiento con Groq (IA)

1. Sobre uno de los documentos cargados, ejecutar la opción **Procesar con IA**.
2. Verificar que la respuesta incluya un objeto `datos_extraidos` en formato JSON coherente con el contenido del documento (número de factura, proveedor, total, etc.).
3. Confirmar en la tabla `analisis_ia` que el registro fue persistido correctamente junto con el `modelo_utilizado`.

### 5.5 Prueba del Chat Semántico

1. Ingresar a `chat.html`.
2. Formular una pregunta relacionada con un documento ya procesado (por ejemplo: *"¿Cuál es el total de la factura más reciente?"*).
3. Verificar que la respuesta generada por Groq sea coherente con los datos previamente extraídos y almacenados.

---

## 6. Solución de Problemas Comunes (Troubleshooting)

### 6.1 Error de Conexión a MySQL en XAMPP

**Síntoma:** el servidor Node.js falla al iniciar con un error del tipo `ECONNREFUSED` o `Access denied for user`.

**Posibles causas y solución:**
- Verificar que el servicio **MySQL** esté iniciado (en verde) dentro del Panel de Control de XAMPP.
- Confirmar que `DB_HOST`, `DB_USER`, `DB_PASSWORD` y `DB_NAME` en el archivo `.env` coincidan exactamente con la configuración de XAMPP (por defecto, usuario `root` sin contraseña).
- Verificar que el **puerto 3306** no esté siendo utilizado por otro servicio (por ejemplo, otra instalación de MySQL/MariaDB en el sistema); en caso de conflicto, cambiar el puerto en la configuración de XAMPP y reflejarlo en `db.js` o en el `.env`.
- Confirmar que la base de datos `gestion_documental_uts` exista y que el script `schema.sql` se haya ejecutado sin errores.

### 6.2 Errores en la Extracción de Texto de PDF

**Síntoma:** el procesamiento con IA falla o retorna texto vacío para ciertos archivos PDF.

**Posibles causas y solución:**
- Los PDF **escaneados como imagen** (sin capa de texto) no pueden ser procesados por `pdf-parse`, ya que esta librería extrae texto embebido, no realiza OCR. Solución: utilizar PDFs generados digitalmente (no escaneados) para las pruebas, o documentar esta limitación como alcance futuro (integración de OCR).
- Archivos PDF corruptos o protegidos con contraseña generarán una excepción; el `textExtractor.js` debe capturar este error con `try/catch` y registrar el fallo en `logs_errores` en lugar de detener el servidor.
- Verificar que el archivo efectivamente llegó completo a `/uploads` (comparar tamaño en bytes con el archivo original) antes de intentar la extracción.

### 6.3 Manejo de Fallos en Llamadas a la API de Groq

**Síntoma:** el endpoint de procesamiento con IA retorna `500 Internal Server Error` o tarda excesivamente en responder.

**Posibles causas y solución:**
- **`GROQ_API_KEY` inválida o no configurada:** verificar que la variable en `.env` sea correcta y que el servidor haya sido reiniciado después de modificar el archivo (las variables de entorno solo se cargan al iniciar el proceso).
- **Límite de la capa gratuita excedido (rate limit):** Groq puede retornar un código `429 Too Many Requests` si se superan los límites de peticiones por minuto; se recomienda implementar un pequeño retardo entre pruebas consecutivas o manejar reintentos con *backoff* exponencial en `aiService.js`.
- **Respuesta no parseable como JSON:** si el modelo devuelve texto adicional junto al JSON (por ejemplo, explicaciones), reforzar el *prompt* de sistema recordando que la salida debe ser **exclusivamente** el objeto JSON, y validar el uso del parámetro `response_format: json_object` si el modelo lo soporta.
- **Timeout de red:** configurar un tiempo máximo de espera (por ejemplo, 15-20 segundos) en la petición HTTP hacia Groq, capturando la excepción correspondiente y registrando el incidente en `logs_errores` en lugar de dejar la petición del cliente indefinidamente pendiente.

### 6.4 Errores Generales de Autenticación (JWT)

**Síntoma:** rutas protegidas retornan `401 Unauthorized` incluso tras iniciar sesión correctamente.

**Posibles causas y solución:**
- Verificar que el cliente esté enviando el header `Authorization: Bearer <token>` en cada petición protegida.
- Confirmar que `JWT_SECRET` no haya cambiado entre la generación del token (login) y su verificación (middleware), ya que esto invalidaría todos los tokens emitidos previamente.
- Verificar la vigencia del token (`JWT_EXPIRES_IN`); si ha expirado, el usuario debe iniciar sesión nuevamente.

---

## 7. Checklist Final de Verificación para el Docente

- [ ] MySQL y Apache activos en XAMPP.
- [ ] Base de datos `gestion_documental_uts` creada y `schema.sql` ejecutado sin errores.
- [ ] Archivo `.env` configurado con credenciales locales y `GROQ_API_KEY` válida.
- [ ] `npm install` ejecutado sin errores dentro de `codigo-fuente/`.
- [ ] Servidor accesible en `http://localhost:3000`.
- [ ] Registro e inicio de sesión de usuario funcionando correctamente.
- [ ] Carga de archivos PDF, DOCX y TXT exitosa.
- [ ] Procesamiento con IA (Groq) retornando JSON estructurado válido.
- [ ] Chat semántico respondiendo coherentemente sobre documentos procesados.
- [ ] Registros de error visibles en la tabla `logs_errores` ante fallos simulados (por ejemplo, apagando temporalmente MySQL).

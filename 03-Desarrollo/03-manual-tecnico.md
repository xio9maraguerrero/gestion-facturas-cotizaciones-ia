# 03. Manual Técnico

## Proyecto: Gestión de Facturas y Cotizaciones con IA

---

## 1. Requisitos Previos

Antes de comenzar la instalación, asegúrese de contar con lo siguiente:

- **XAMPP** instalado (incluye Apache y MySQL/MariaDB), o un servidor MySQL equivalente en ejecución local.
- **Node.js** (versión LTS recomendada, v18 o superior) y **npm** instalados.
- Una **cuenta en Groq Cloud** con una API Key activa para el modelo `llama-3.3-70b-versatile`.
- Un cliente de administración de MySQL, como **phpMyAdmin** (incluido en XAMPP).
- Git (opcional, para clonar el repositorio).

---

## 2. Configuración de la Base de Datos

### Paso 1: Iniciar XAMPP

1. Abra el **Panel de Control de XAMPP**.
2. Inicie los módulos **Apache** y **MySQL**.
3. Verifique que ambos servicios se muestren en estado *Running* (fondo verde).

### Paso 2: Crear la base de datos

1. Acceda a **phpMyAdmin** desde `http://localhost/phpmyadmin`.
2. Cree una nueva base de datos con el nombre exacto:
   ```
   gestion_documental_uts
   ```
3. Seleccione la codificación de cotejamiento recomendada: `utf8mb4_general_ci` (o equivalente), para garantizar el correcto manejo de caracteres especiales del español.

### Paso 3: Importar el esquema

1. Con la base de datos `gestion_documental_uts` seleccionada, vaya a la pestaña **Importar**.
2. Seleccione el archivo `database/schema.sql` desde el repositorio del proyecto.
3. Ejecute la importación. Esto creará automáticamente todas las tablas necesarias (usuarios, documentos, análisis, etc.) junto con sus relaciones y restricciones.

> **Verificación:** al finalizar, debe visualizar en el panel izquierdo de phpMyAdmin la base de datos `gestion_documental_uts` con todas sus tablas correspondientes.

---

## 3. Configuración del Entorno (`.env`)

El proyecto utiliza `dotenv` para la gestión de variables de entorno sensibles. El repositorio incluye un archivo **`.env.example`** como plantilla pública.

### Paso 1: Duplicar la plantilla

En la raíz del proyecto, copie el archivo `.env.example` y renómbrelo como `.env`:

```bash
cp .env.example .env
```

*(En Windows, puede hacerlo manualmente copiando y renombrando el archivo desde el explorador de archivos, o usando `copy .env.example .env` desde CMD).*

### Paso 2: Completar las variables de entorno

Edite el archivo `.env` recién creado y complete los siguientes valores:

```env
# Configuración del servidor
PORT=3000

# Configuración de la Base de Datos MySQL (XAMPP)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=gestion_documental_uts

# Configuración de Groq API
GROQ_API_KEY=tu_api_key_de_groq_aqui
GROQ_MODEL=llama-3.3-70b-versatile

# Configuración de autenticación JWT
JWT_SECRET=una_clave_secreta_larga_y_segura
JWT_EXPIRES_IN=1d
```

| Variable | Descripción |
|---|---|
| `PORT` | Puerto en el que se ejecutará el servidor Express |
| `DB_HOST` | Host de la base de datos MySQL (por defecto `localhost` en XAMPP) |
| `DB_USER` | Usuario de MySQL (por defecto `root` en XAMPP) |
| `DB_PASSWORD` | Contraseña de MySQL (por defecto vacía en instalaciones estándar de XAMPP) |
| `DB_NAME` | Nombre de la base de datos creada en el paso anterior |
| `GROQ_API_KEY` | Clave de API personal obtenida desde la consola de Groq Cloud |
| `GROQ_MODEL` | Identificador del modelo de IA utilizado (`llama-3.3-70b-versatile`) |
| `JWT_SECRET` | Cadena secreta utilizada para firmar los tokens JWT |
| `JWT_EXPIRES_IN` | Tiempo de expiración de los tokens de sesión |

> **Importante:** el archivo `.env` **nunca** debe subirse al repositorio (debe estar incluido en `.gitignore`), ya que contiene credenciales sensibles. Solo `.env.example` debe versionarse, sin valores reales.

### Paso 3: Obtener la API Key de Groq

1. Ingrese a la consola web de Groq Cloud e inicie sesión (o cree una cuenta).
2. Genere una nueva **API Key** desde la sección correspondiente.
3. Copie la clave generada y péguela en la variable `GROQ_API_KEY` del archivo `.env`.

---

## 4. Instalación de Dependencias

### Paso 1: Ubicarse en el directorio raíz del proyecto

```bash
cd gestion-facturas-cotizaciones-ia
```

### Paso 2: Instalar dependencias con npm

```bash
npm install
```

Este comando leerá el archivo `package.json` (junto con `package-lock.json` para garantizar versiones exactas) e instalará todas las dependencias necesarias dentro de la carpeta `node_modules/`, incluyendo:

- `express`
- `mysql2`
- `multer`
- `pdf-parse`
- `mammoth`
- `jsonwebtoken`
- `bcryptjs`
- `dotenv`

> **Nota:** la carpeta `node_modules/` no forma parte del repositorio; se genera localmente tras ejecutar este comando.

---

## 5. Arranque del Servidor

### Paso 1: Iniciar la aplicación

```bash
npm start
```

Este comando ejecuta el archivo `server.js`, el cual:

1. Carga las variables de entorno desde `.env`.
2. Establece el *pool* de conexiones a MySQL (`src/config/db.js`).
3. Registra las rutas de la API (`src/routes/`).
4. Inicia el servidor Express en el puerto definido por `PORT` (por defecto, `3000`).

### Paso 2: Acceder a la aplicación

Abra su navegador y acceda a:

```
http://localhost:3000
```

Debería visualizar la interfaz principal del sistema (`public/index.html`).

---

## 6. Guía de Pruebas Funcionales

Para validar que la instalación fue exitosa, se recomienda seguir la siguiente secuencia de pruebas:

1. **Registro de usuario:** cree una cuenta nueva desde la interfaz de registro. Verifique en phpMyAdmin que el registro se haya insertado en la tabla de usuarios con la contraseña almacenada como hash (`bcryptjs`), no en texto plano.
2. **Inicio de sesión:** inicie sesión con las credenciales creadas. Verifique que se genere y almacene correctamente un token JWT en el cliente.
3. **Carga de documento:** suba un archivo de prueba en formato PDF, DOCX o TXT (una factura o cotización de ejemplo). Verifique que el archivo se almacene físicamente en la carpeta `uploads/`.
4. **Extracción de texto:** confirme que el sistema extraiga correctamente el contenido del documento (sin errores en consola del servidor), según el tipo de archivo procesado por `textExtractor.js`.
5. **Análisis con IA:** solicite el análisis del documento cargado. Verifique que la solicitud llegue correctamente a la API de Groq y que la respuesta del modelo `llama-3.3-70b-versatile` se reciba y renderice en formato enriquecido mediante `marked.min.js`.
6. **Visualización de métricas:** acceda al panel de análisis/histórico y confirme que los gráficos generados por `chart.umd.min.js` reflejen correctamente los datos almacenados en MySQL.
7. **Persistencia:** revise en phpMyAdmin que el resultado del análisis haya quedado correctamente registrado en la tabla correspondiente de la base de datos `gestion_documental_uts`.

---

## 7. Resolución de Problemas (Troubleshooting)

| Problema | Posible Causa | Solución |
|---|---|---|
| Error `ECONNREFUSED` al iniciar el servidor | MySQL no está corriendo en XAMPP | Verifique que el módulo MySQL esté iniciado (en verde) en el Panel de Control de XAMPP |
| Error `ER_BAD_DB_ERROR: Unknown database` | La base de datos `gestion_documental_uts` no fue creada | Repita el Paso 2 de la sección "Configuración de la Base de Datos" |
| Error al importar `schema.sql` | Base de datos seleccionada incorrecta, o el archivo está corrupto/incompleto | Verifique que la base de datos correcta esté seleccionada en phpMyAdmin antes de importar; vuelva a descargar el archivo del repositorio |
| Error 401 (`Unauthorized`) en rutas protegidas | Token JWT ausente, expirado o inválido | Vuelva a iniciar sesión para generar un nuevo token; verifique que `JWT_SECRET` no haya cambiado entre sesiones |
| Error al llamar a la API de Groq (401/403) | `GROQ_API_KEY` inválida, vacía o mal copiada en `.env` | Verifique la clave en la consola de Groq Cloud y actualice el archivo `.env`; reinicie el servidor tras el cambio |
| Error al llamar a la API de Groq (429) | Límite de solicitudes (*rate limit*) excedido | Espere unos minutos antes de reintentar, o reduzca la frecuencia de solicitudes de prueba |
| El archivo se sube pero no se extrae texto | Tipo de archivo no soportado o corrupto | Verifique que el archivo sea PDF, DOCX o TXT válido; revise los logs del servidor para el error específico de `pdf-parse` o `mammoth` |
| Los gráficos no se muestran en el panel de análisis | Error de carga de `chart.umd.min.js` o datos vacíos desde la API | Verifique en la consola del navegador que el archivo se cargue correctamente desde `public/vendor/`; confirme que existan registros de análisis en la base de datos |
| Las respuestas de la IA se muestran como texto plano sin formato | `marked.min.js` no se cargó correctamente | Verifique la ruta de importación del script en `index.html` y que el archivo exista en `public/vendor/` |
| Puerto en uso (`EADDRINUSE`) | Otro proceso está utilizando el puerto definido en `PORT` | Cambie el valor de `PORT` en `.env` o finalice el proceso que esté ocupando dicho puerto |
| Cambios en `.env` no se reflejan | El servidor no fue reiniciado tras modificar el archivo | Detenga el servidor (`Ctrl + C`) y vuelva a ejecutar `npm start` |

---

## 8. Resumen de Comandos Principales

```bash
# Clonar o ubicarse en el proyecto
cd gestion-facturas-cotizaciones-ia

# Copiar plantilla de variables de entorno
cp .env.example .env

# Instalar dependencias
npm install

# Iniciar el servidor
npm start
```

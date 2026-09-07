# 04 - Diseño de API REST

**Proyecto:** Gestión de Facturas y Cotizaciones con IA
**Fase:** II - Diseño del Sistema
**Formato de intercambio:** JSON
**Base URL:** `http://localhost:3000/api`

---

## 1. Convenciones Generales

- Todas las respuestas se retornan en formato `application/json`.
- Las rutas protegidas requieren el header: `Authorization: Bearer <token_jwt>`.
- Los códigos de error siguen la convención: `400` (solicitud inválida), `401` (no autenticado), `403` (sin permisos - RBAC), `404` (recurso no encontrado), `500` (error interno del servidor).
- Todas las respuestas incluyen un campo `success` (booleano) y, en caso de error, un campo `message`.

---

## 2. Módulo de Autenticación — `/api/auth`

### 2.1 `POST /api/auth/register`

Registra un nuevo usuario en el sistema.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "nombre_completo": "Ana Torres",
  "correo": "ana.torres@empresa.com",
  "contrasena": "ClaveSegura123!",
  "rol": "colaborador"
}
```

**Respuesta 201 (Éxito):**
```json
{
  "success": true,
  "message": "Usuario registrado correctamente",
  "data": {
    "id_usuario": 15,
    "nombre_completo": "Ana Torres",
    "correo": "ana.torres@empresa.com",
    "rol": "colaborador"
  }
}
```

**Respuesta 400 (Error - correo duplicado):**
```json
{
  "success": false,
  "message": "El correo electrónico ya se encuentra registrado"
}
```

---

### 2.2 `POST /api/auth/login`

Autentica un usuario y retorna un token JWT.

**Body:**
```json
{
  "correo": "ana.torres@empresa.com",
  "contrasena": "ClaveSegura123!"
}
```

**Respuesta 200 (Éxito):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "usuario": {
      "id_usuario": 15,
      "nombre_completo": "Ana Torres",
      "rol": "colaborador"
    }
  }
}
```

**Respuesta 401 (Error - credenciales inválidas):**
```json
{
  "success": false,
  "message": "Correo o contraseña incorrectos"
}
```

---

### 2.3 `GET /api/auth/perfil`

Retorna la información del usuario autenticado. **Requiere JWT.**

**Headers:**
```
Authorization: Bearer <token_jwt>
```

**Respuesta 200 (Éxito):**
```json
{
  "success": true,
  "data": {
    "id_usuario": 15,
    "nombre_completo": "Ana Torres",
    "correo": "ana.torres@empresa.com",
    "rol": "colaborador",
    "fecha_creacion": "2026-02-10T14:32:00Z"
  }
}
```

**Respuesta 401 (Error - token expirado/inválido):**
```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```

---

## 3. Módulo de Repositorios y Documentos — `/api/docs`

### 3.1 `POST /api/docs/repositorios`

Crea un nuevo repositorio. **Requiere JWT.**

**Body:**
```json
{
  "nombre": "Facturas Proveedores 2026",
  "descripcion": "Repositorio de facturas del primer trimestre"
}
```

**Respuesta 201 (Éxito):**
```json
{
  "success": true,
  "message": "Repositorio creado correctamente",
  "data": {
    "id_repositorio": 8,
    "nombre": "Facturas Proveedores 2026"
  }
}
```

---

### 3.2 `GET /api/docs/repositorios`

Lista los repositorios del usuario autenticado. **Requiere JWT.**

**Respuesta 200 (Éxito):**
```json
{
  "success": true,
  "data": [
    {
      "id_repositorio": 8,
      "nombre": "Facturas Proveedores 2026",
      "total_documentos": 12,
      "fecha_creacion": "2026-03-01T09:00:00Z"
    }
  ]
}
```

---

### 3.3 `POST /api/docs/upload`

Sube un archivo (PDF, DOCX o TXT) a un repositorio. **Requiere JWT.**

**Headers:**
```
Authorization: Bearer <token_jwt>
Content-Type: multipart/form-data
```

**Parámetros (form-data):**

| Campo | Tipo | Descripción |
|---|---|---|
| archivo | file | Archivo PDF, DOCX o TXT (máx. 10MB) |
| id_repositorio | int | Repositorio destino |

**Respuesta 201 (Éxito):**
```json
{
  "success": true,
  "message": "Archivo cargado correctamente",
  "data": {
    "id_documento": 45,
    "nombre_original": "factura_enero.pdf",
    "estado_procesamiento": "pendiente"
  }
}
```

**Respuesta 400 (Error - tipo de archivo no soportado):**
```json
{
  "success": false,
  "message": "Formato de archivo no soportado. Use PDF, DOCX o TXT"
}
```

---

### 3.4 `GET /api/docs/:id_documento`

Consulta el detalle y estado de un documento. **Requiere JWT.**

**Respuesta 200 (Éxito):**
```json
{
  "success": true,
  "data": {
    "id_documento": 45,
    "nombre_original": "factura_enero.pdf",
    "tipo_mime": "application/pdf",
    "estado_procesamiento": "completado",
    "fecha_carga": "2026-03-05T11:20:00Z"
  }
}
```

**Respuesta 404 (Error - documento no encontrado):**
```json
{
  "success": false,
  "message": "Documento no encontrado"
}
```

---

## 4. Módulo de IA y Chat — `/api/ai`

### 4.1 `POST /api/ai/procesar/:id_documento`

Dispara el análisis con IA sobre un documento ya cargado. **Requiere JWT.**

**Respuesta 200 (Éxito):**
```json
{
  "success": true,
  "message": "Documento procesado correctamente",
  "data": {
    "id_analisis": 30,
    "datos_extraidos": {
      "tipo_documento": "factura",
      "numero_factura": "F-2026-0456",
      "proveedor": "Distribuidora XYZ S.A.S.",
      "total": 1250000,
      "fecha_emision": "2026-01-15"
    },
    "modelo_utilizado": "llama-3.3-70b-versatile"
  }
}
```

**Respuesta 500 (Error - fallo en la API de Groq)**
```json
{
  "success": false,
  "message": "No fue posible procesar el documento con el servicio de IA. Intente nuevamente"
}
```

---

### 4.2 `PUT /api/ai/analisis/:id_analisis`

Permite la edición manual de los datos extraídos por la IA (caso de uso `<<extend>>`). **Requiere JWT.**

**Body:**
```json
{
  "datos_extraidos": {
    "numero_factura": "F-2026-0456-CORREGIDA",
    "total": 1300000
  }
}
```

**Respuesta 200 (Éxito):**
```json
{
  "success": true,
  "message": "Análisis actualizado correctamente",
  "data": {
    "id_analisis": 30,
    "editado_manualmente": true
  }
}
```

---

### 4.3 `POST /api/ai/chat`

Realiza una consulta semántica en lenguaje natural sobre los documentos del usuario. **Requiere JWT.**

**Body:**
```json
{
  "pregunta": "¿Cuál fue el total facturado por el proveedor Distribuidora XYZ en enero?",
  "id_repositorio": 8
}
```

**Respuesta 200 (Éxito):**
```json
{
  "success": true,
  "data": {
    "respuesta": "El total facturado por Distribuidora XYZ S.A.S. en enero de 2026 fue de $1.250.000 COP, correspondiente a la factura F-2026-0456.",
    "documentos_referenciados": [45]
  }
}
```

**Respuesta 403 (Error - sin permisos sobre el repositorio):**
```json
{
  "success": false,
  "message": "No tiene permisos para consultar este repositorio"
}
```

**Respuesta 500 (Error - servicio de IA no disponible):**
```json
{
  "success": false,
  "message": "El servicio de chat semántico no está disponible en este momento"
}
```

---

## 5. Resumen de Endpoints

| Método | Endpoint | Protegido | Descripción |
|---|---|---|---|
| POST | /api/auth/register | No | Registro de usuario |
| POST | /api/auth/login | No | Inicio de sesión |
| GET | /api/auth/perfil | Sí (JWT) | Perfil del usuario autenticado |
| POST | /api/docs/repositorios | Sí (JWT) | Crear repositorio |
| GET | /api/docs/repositorios | Sí (JWT) | Listar repositorios |
| POST | /api/docs/upload | Sí (JWT) | Subir documento |
| GET | /api/docs/:id_documento | Sí (JWT) | Detalle de documento |
| POST | /api/ai/procesar/:id_documento | Sí (JWT) | Procesar documento con IA |
| PUT | /api/ai/analisis/:id_analisis | Sí (JWT) | Editar análisis manualmente |
| POST | /api/ai/chat | Sí (JWT) | Chat semántico |

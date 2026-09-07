# 02 - Diagramas UML

**Proyecto:** Gestión de Facturas y Cotizaciones con IA
**Fase:** II - Diseño del Sistema

---

## 1. Diagrama de Casos de Uso

### 1.1 Actores

- **Usuario Administrador:** gestiona usuarios, repositorios globales y accede a auditoría completa del sistema.
- **Usuario Estándar / Colaborador:** gestiona sus propios repositorios, carga documentos y consulta el chat semántico.
- **Groq Cloud API (sistema externo):** actor no humano que recibe el texto extraído y retorna el análisis estructurado en JSON.

### 1.2 Casos de Uso Identificados

1. **Login** — autenticación de credenciales y emisión de JWT.
2. **Gestión de Repositorios** — crear, editar, listar y eliminar repositorios documentales.
3. **Carga de Archivos (PDF/DOCX/TXT)** — subir documentos a un repositorio.
4. **Procesamiento con IA** — enviar el texto extraído a Groq y persistir el resultado.
5. **Chat Semántico** — realizar consultas en lenguaje natural sobre el contenido analizado.
6. **Dashboard** — visualizar métricas e indicadores de uso del sistema.
7. **Auditoría** — consultar registros de actividad y errores del sistema.

### 1.3 Código Mermaid.js

```mermaid
graph TB
    Admin((Usuario<br/>Administrador))
    Colaborador((Usuario Estándar<br/>/ Colaborador))
    Groq([Groq Cloud API<br/>Sistema Externo])

    subgraph "Sistema de Gestión de Facturas y Cotizaciones IA"
        UC1[Login]
        UC2[Gestión de<br/>Repositorios]
        UC3[Carga de Archivos<br/>PDF / DOCX / TXT]
        UC4[Procesamiento<br/>con IA]
        UC5[Chat Semántico]
        UC6[Dashboard]
        UC7[Auditoría]
        UC8[[Validar JWT]]
        UC9[[Extraer Texto<br/>del Documento]]
        UC10[Edición Manual<br/>de Datos Extraídos]
    end

    Admin --> UC1
    Admin --> UC2
    Admin --> UC6
    Admin --> UC7
    Colaborador --> UC1
    Colaborador --> UC2
    Colaborador --> UC3
    Colaborador --> UC4
    Colaborador --> UC5
    Colaborador --> UC6

    UC2 -.include.-> UC8
    UC3 -.include.-> UC8
    UC4 -.include.-> UC8
    UC4 -.include.-> UC9
    UC5 -.include.-> UC8
    UC7 -.include.-> UC8

    UC10 -.extend.-> UC4
    UC4 --> Groq
    Groq --> UC4
    UC5 --> Groq
```

### 1.4 Explicación Narrativa

El diagrama refleja que casi todos los casos de uso protegidos (gestión de repositorios, carga de archivos, procesamiento con IA, chat semántico y auditoría) dependen obligatoriamente de la validación de JWT mediante la relación **`<<include>>`**, dado que sin un token válido ninguna operación sensible puede ejecutarse. De igual forma, **Procesamiento con IA** incluye obligatoriamente la extracción previa de texto del documento. La **edición manual de datos extraídos** se modela como una relación **`<<extend>>`** sobre "Procesamiento con IA", ya que es un comportamiento opcional que solo ocurre si el usuario decide corregir el JSON generado por la IA. El actor externo **Groq Cloud API** participa activamente en los casos de uso de procesamiento con IA y chat semántico, recibiendo solicitudes y devolviendo respuestas estructuradas.

---

## 2. Diagrama de Componentes

```mermaid
graph TB
    subgraph PRES["Capa de Presentación"]
        P1[HTML5 - Vistas]
        P2[Tailwind CSS - Estilos]
        P3[JS Fetch API - Cliente HTTP]
    end

    subgraph BACK["Capa Backend - Node.js / Express"]
        B1[Express Server<br/>app.js]
        B2[authMiddleware<br/>JWT]
        B3[roleMiddleware<br/>RBAC]
        B4[uploadMiddleware<br/>Multer]
        B5[Rutas API<br/>/auth /docs /ai]
        B6[Controladores]
        B7[textExtractor.js]
        B8[aiService.js]
    end

    subgraph DATOS["Capa de Datos y Almacenamiento"]
        D1[(mysql2/promise<br/>Conector BD)]
        D2[(MySQL - XAMPP)]
        D3[/Carpeta /uploads/]
    end

    subgraph EXT["Sistema Externo"]
        E1[[Groq Cloud API]]
    end

    P3 -- HTTP/JSON --> B1
    B1 --> B2
    B2 --> B3
    B3 --> B4
    B4 --> B5
    B5 --> B6
    B6 --> B7
    B6 --> B8
    B6 --> D1
    B7 --> D3
    B8 -- HTTPS --> E1
    D1 --> D2
```

### 2.1 Explicación Narrativa

El componente **Express Server** centraliza el enrutamiento y aplica de forma secuencial los middlewares de seguridad: primero `authMiddleware` (validación de token), luego `roleMiddleware` (verificación de permisos) y, en las rutas de carga, `uploadMiddleware` (Multer). Los **controladores** orquestan la lógica delegando la extracción de texto a `textExtractor.js` y la comunicación con el modelo de lenguaje a `aiService.js`. La capa de datos se abstrae mediante el conector `mysql2/promise`, que expone una interfaz basada en promesas hacia MySQL, mientras que los archivos físicos se mantienen desacoplados en el sistema de archivos del servidor.

---

## 3. Diagrama de Despliegue

```mermaid
graph LR
    subgraph CLIENTE["Nodo: Cliente"]
        Browser[Navegador Web<br/>Chrome / Firefox / Edge]
    end

    subgraph APP["Nodo: Servidor de Aplicación"]
        Node[Node.js + Express<br/>Puerto 3000]
        Uploads[/Carpeta local /uploads/]
    end

    subgraph BD["Nodo: Servidor de Base de Datos"]
        XAMPP[MySQL - XAMPP<br/>Puerto 3306]
    end

    subgraph CLOUD["Nodo: Servicio en la Nube"]
        Groq[Groq Cloud API<br/>Puerto 443 - HTTPS]
    end

    Browser -- HTTP/HTTPS --> Node
    Node -- TCP/IP 3306 --> XAMPP
    Node -- Almacenamiento local --> Uploads
    Node -- HTTPS/REST --> Groq
```

### 3.1 Explicación Narrativa

El despliegue contempla cuatro nodos físicos/lógicos: el **navegador del cliente**, que consume la aplicación vía HTTP/HTTPS; el **servidor de aplicación Node.js** escuchando en el puerto **3000**, responsable de la lógica de negocio y el almacenamiento temporal/local de archivos subidos; el **servidor de base de datos MySQL** gestionado por XAMPP en el puerto **3306**, accesible únicamente desde el servidor de aplicación; y el nodo externo **Groq Cloud API**, consumido exclusivamente vía HTTPS en el puerto **443**. En un entorno académico, los tres primeros nodos suelen coexistir en la misma máquina física (localhost), mientras que Groq permanece siempre externo.

---

## 4. Diagrama de Secuencia — Flujo de Carga y Procesamiento con IA

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend (JS)
    participant M as authMiddleware
    participant UP as Multer
    participant C as Controlador Docs
    participant TE as textExtractor.js
    participant AI as aiService.js
    participant G as Groq Cloud API
    participant DB as MySQL

    U->>F: Selecciona archivo PDF/DOCX
    F->>M: POST /api/docs/upload (JWT + multipart/form-data)
    M->>M: Verificar y decodificar JWT
    alt Token inválido o expirado
        M-->>F: 401 Unauthorized
    else Token válido
        M->>UP: Continuar con la petición
        UP->>UP: Guardar archivo en /uploads
        UP->>C: Archivo almacenado + metadatos
        C->>TE: extraerTexto(rutaArchivo)
        TE-->>C: Texto plano extraído
        C->>AI: analizarDocumento(textoPlano)
        AI->>AI: Construir prompt de sistema (JSON estricto)
        AI->>G: POST /openai/v1/chat/completions
        alt Respuesta exitosa de Groq
            G-->>AI: JSON estructurado (datos extraídos)
            AI-->>C: JSON validado
            C->>DB: INSERT INTO analisis_ia
            DB-->>C: Confirmación de guardado
            C-->>F: 201 Created + resultado JSON
            F-->>U: Mostrar datos extraídos en interfaz
        else Error en Groq o timeout
            G-->>AI: Error / timeout
            AI-->>C: Excepción controlada
            C->>DB: INSERT INTO logs_errores
            C-->>F: 500 Error de procesamiento IA
            F-->>U: Mostrar mensaje de error
        end
    end
```

### 4.1 Explicación Narrativa

El flujo comienza con la selección del archivo por parte del usuario y su envío mediante una petición `multipart/form-data` que incluye el token JWT en el encabezado `Authorization`. El `authMiddleware` valida el token antes de permitir que la petición continúe; si el token es inválido, la cadena se corta inmediatamente con un `401`. Superada la autenticación, **Multer** persiste físicamente el archivo en `/uploads` y pasa el control al controlador, quien delega la extracción de texto a `textExtractor.js`. El texto resultante se envía a `aiService.js`, que construye un *prompt* de sistema exigiendo una respuesta en **JSON estricto** y realiza la llamada HTTPS a Groq. Dependiendo del resultado, el sistema persiste el análisis en `analisis_ia` o registra la falla en `logs_errores`, garantizando trazabilidad completa del proceso en ambos escenarios.

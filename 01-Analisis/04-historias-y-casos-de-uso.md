# 04. Historias de Usuario y Casos de Uso

## Sistema Inteligente de Gestión y Análisis de Facturas y Cotizaciones Empresariales

**Repositorio GitHub:** `gestion-facturas-cotizaciones-ia`
**Sección del documento de Análisis de Requisitos:** 4 de 6

---

## Tabla de Contenido

9. Historias de Usuario (HU-01 a HU-05)
10. Especificación detallada de Casos de Uso (CU-01, CU-02)

---

## 9. Historias de Usuario

### HU-01 — Carga de documentos

**Como** usuario colaborador
**Quiero** cargar un archivo de factura o cotización en formato PDF, DOCX o TXT
**Para** que el sistema lo almacene y procese automáticamente sin necesidad de digitarlo manualmente.

**Criterios de aceptación:**
- **Dado** que el usuario ha iniciado sesión y se encuentra en un repositorio válido, **cuando** selecciona un archivo PDF de máximo 10 MB y confirma la carga, **entonces** el sistema almacena el archivo y muestra un estado "En procesamiento".
- **Dado** que el usuario intenta cargar un archivo con formato no soportado (p. ej. .jpg), **cuando** confirma la carga, **entonces** el sistema rechaza el archivo y muestra un mensaje de error indicando los formatos permitidos.

### HU-02 — Clasificación y extracción automática

**Como** usuario colaborador
**Quiero** que el sistema clasifique automáticamente el documento cargado y extraiga sus datos clave
**Para** evitar la digitación manual de la información financiera.

**Criterios de aceptación:**
- **Dado** que un documento fue cargado exitosamente, **cuando** el motor de IA procesa el archivo, **entonces** el sistema actualiza el estado del documento a "Factura" o "Cotización" y guarda los campos extraídos (NIT, fecha, valor, proveedor, ítems).
- **Dado** que el motor de IA no logra determinar la categoría con suficiente confianza, **cuando** finaliza el procesamiento, **entonces** el documento queda marcado como "No clasificado" para revisión manual.

### HU-03 — Consulta mediante chat en lenguaje natural

**Como** gerente financiero
**Quiero** realizar preguntas en lenguaje natural sobre los documentos de mi repositorio
**Para** obtener información específica sin tener que revisar manualmente cada archivo.

**Criterios de aceptación:**
- **Dado** que existen documentos clasificados en el repositorio, **cuando** el usuario escribe una pregunta como "¿cuánto facturó el proveedor ABC en el último mes?", **entonces** el sistema responde con el valor correspondiente y referencia los documentos utilizados como fuente.
- **Dado** que la pregunta no tiene relación con la información disponible en el repositorio, **cuando** se envía la consulta, **entonces** el sistema responde indicando que no encontró información relevante, sin inventar datos.

### HU-04 — Visualización de indicadores en el dashboard

**Como** gerente financiero
**Quiero** visualizar un dashboard con los principales indicadores de facturación y cotización
**Para** tomar decisiones estratégicas basadas en datos actualizados.

**Criterios de aceptación:**
- **Dado** que el repositorio contiene documentos clasificados, **cuando** el usuario accede al dashboard, **entonces** el sistema muestra el total facturado por periodo, el top 5 de proveedores y la tendencia mensual.
- **Dado** que se carga y clasifica un nuevo documento, **cuando** el usuario recarga el dashboard, **entonces** los indicadores reflejan la información actualizada, incluyendo el nuevo documento.

### HU-05 — Gestión de acceso a repositorios

**Como** administrador de un repositorio
**Quiero** asignar y revocar el acceso de usuarios a mi repositorio
**Para** garantizar que solo el personal autorizado pueda ver la información financiera de la organización.

**Criterios de aceptación:**
- **Dado** que el administrador se encuentra en la configuración del repositorio, **cuando** invita a un nuevo usuario mediante su correo electrónico, **entonces** el usuario invitado obtiene acceso al repositorio con el rol asignado (administrador o colaborador).
- **Dado** que el administrador revoca el acceso de un usuario, **cuando** dicho usuario intenta ingresar al repositorio, **entonces** el sistema deniega el acceso y muestra un mensaje de permisos insuficientes.

---

## 10. Especificación detallada de Casos de Uso

### CU-01: Cargar y procesar documento

| Campo | Descripción |
|-------|-------------|
| **ID** | CU-01 |
| **Nombre** | Cargar y procesar documento (factura/cotización) |
| **Actor principal** | Usuario colaborador / Usuario administrador |
| **Actores secundarios** | Servicio de IA |
| **Precondiciones** | El usuario ha iniciado sesión y tiene acceso a al menos un repositorio activo. |
| **Postcondiciones** | El documento queda almacenado, clasificado y con datos estructurados extraídos, o marcado como "No clasificado" para revisión. |

**Flujo principal:**
1. El usuario accede al repositorio y selecciona la opción "Cargar documento".
2. El sistema solicita la selección del archivo (PDF, DOCX o TXT).
3. El usuario selecciona el archivo y confirma la carga.
4. El sistema valida el formato y tamaño del archivo.
5. El sistema almacena el archivo y lo marca con estado "En procesamiento".
6. El sistema extrae el texto del documento y lo envía al servicio de IA.
7. El servicio de IA retorna la categoría del documento, un resumen y los datos estructurados.
8. El sistema almacena los resultados y actualiza el estado del documento a "Procesado".
9. El sistema notifica al usuario que el documento fue procesado exitosamente.

**Flujos alternativos:**
- **FA-1 (Formato/tamaño inválido):** En el paso 4, si el archivo no cumple con el formato o tamaño permitido, el sistema muestra un mensaje de error y cancela la carga, retornando al paso 2.
- **FA-2 (Fallo del servicio de IA):** En el paso 6, si el servicio de IA no responde o falla, el sistema marca el documento como "Error de procesamiento" y permite al usuario reintentar el procesamiento manualmente.
- **FA-3 (Clasificación de baja confianza):** En el paso 7, si el nivel de confianza de la clasificación es inferior al umbral definido (RN-07), el sistema marca el documento como "No clasificado" y lo envía a una cola de revisión manual, omitiendo el paso 8 estándar.

---

### CU-02: Consultar información mediante chat en lenguaje natural

| Campo | Descripción |
|-------|-------------|
| **ID** | CU-02 |
| **Nombre** | Consultar información de documentos vía chat en lenguaje natural |
| **Actor principal** | Usuario colaborador / Usuario administrador |
| **Actores secundarios** | Servicio de IA |
| **Precondiciones** | El repositorio cuenta con al menos un documento clasificado y procesado. |
| **Postcondiciones** | El usuario recibe una respuesta basada en los documentos del repositorio, con referencia a las fuentes utilizadas. |

**Flujo principal:**
1. El usuario accede al módulo de chat dentro de un repositorio.
2. El usuario redacta una pregunta en lenguaje natural sobre los documentos del repositorio.
3. El sistema envía la pregunta junto con el contexto relevante (documentos indexados) al servicio de IA.
4. El servicio de IA procesa la consulta y genera una respuesta basada en la información disponible.
5. El sistema presenta la respuesta al usuario, incluyendo referencias a los documentos fuente utilizados.
6. El usuario puede acceder directamente al documento fuente referenciado desde la respuesta.

**Flujos alternativos:**
- **FA-1 (Sin información relevante):** En el paso 4, si no existe información relacionada con la consulta dentro del repositorio, el sistema responde indicando que no se encontró información relevante, evitando generar datos no verificados.
- **FA-2 (Repositorio sin documentos procesados):** Si en el paso 1 el repositorio no cuenta con documentos clasificados, el sistema informa al usuario que debe cargar y procesar documentos antes de utilizar el chat.
- **FA-3 (Fallo del servicio de IA):** En el paso 3, si el servicio de IA no responde dentro del tiempo límite configurado, el sistema muestra un mensaje de error y sugiere reintentar la consulta.

---

*Documento parte de la fase de Análisis de Requisitos — Proyecto Integrador, Tecnología en Desarrollo de Software, UTS. Ver también: `01-contexto-y-objetivos.md`, `02-actores-y-perfiles-de-usuario.md`, `03-especificacion-de-requerimientos.md`, `05-priorizacion-y-trazabilidad.md`, `06-analisis-de-riesgos.md`.*

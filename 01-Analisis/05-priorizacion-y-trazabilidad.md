# 05. Priorización y Trazabilidad

## Sistema Inteligente de Gestión y Análisis de Facturas y Cotizaciones Empresariales

**Repositorio GitHub:** `gestion-facturas-cotizaciones-ia`
**Sección del documento de Análisis de Requisitos:** 5 de 6

---

## Tabla de Contenido

11. Priorización de requisitos — Matriz MoSCoW
12. Matriz de trazabilidad (Requisito vs. Necesidad de Negocio vs. Objetivo específico)

---

## 11. Priorización de requisitos — Matriz MoSCoW

| Requisito | Descripción breve | Must Have | Should Have | Could Have | Won't Have |
|-----------|--------------------|:---------:|:------------:|:-----------:|:-----------:|
| RF-01 | Registro de usuario | ✔ | | | |
| RF-02 | Autenticación | ✔ | | | |
| RF-03 | Gestión de repositorios | ✔ | | | |
| RF-04 | Asignación de usuarios a repositorio | ✔ | | | |
| RF-05 | Carga de documentos (PDF/DOCX/TXT) | ✔ | | | |
| RF-06 | Validación de integridad del archivo | ✔ | | | |
| RF-07 | Clasificación automática mediante IA | ✔ | | | |
| RF-08 | Extracción de datos estructurados | ✔ | | | |
| RF-09 | Resumen automático | | ✔ | | |
| RF-10 | Chat / búsqueda en lenguaje natural | | ✔ | | |
| RF-11 | Dashboard de indicadores | ✔ | | | |
| RF-12 | Filtro y búsqueda estructurada | | ✔ | | |
| RF-13 | Edición manual de datos extraídos | | ✔ | | |
| RF-14 | Historial de auditoría | | | ✔ | |
| RF-15 | Eliminación lógica de documentos | | | ✔ | |
| RNF-01 | Cifrado de contraseñas | ✔ | | | |
| RNF-02 | Control de acceso por roles (RBAC) | ✔ | | | |
| RNF-03 | Comunicación HTTPS/TLS | ✔ | | | |
| RNF-08 | Escalabilidad arquitectónica | | ✔ | | |
| RNF-11 | Despliegue con contenedores Docker | | | ✔ | |
| — | Integración con sistemas ERP externos | | | | ✔ |
| — | Facturación electrónica DIAN (UBL 2.1) | | | | ✔ |
| — | Aplicación móvil nativa | | | | ✔ |

---

## 12. Matriz de trazabilidad (Requisito vs. Necesidad de Negocio)

| Necesidad de negocio | Requisitos relacionados | Objetivo específico asociado |
|------------------------|---------------------------|-------------------------------|
| Centralizar la información documental en un repositorio único | RF-03, RF-04, RF-05, RN-01 | OE-02, OE-03 |
| Reducir el tiempo de procesamiento manual de documentos | RF-06, RF-07, RF-08, RN-02, RN-04, RN-07 | OE-04 |
| Facilitar la consulta de información sin conocimientos técnicos | RF-10, RF-12 | OE-05 |
| Disponer de indicadores para la toma de decisiones gerenciales | RF-11, RN-02 | OE-06 |
| Garantizar la seguridad y segmentación de la información por organización | RF-02, RF-04, RNF-01, RNF-02, RNF-03, RN-03, RN-06, RN-08 | OE-02 |
| Asegurar trazabilidad y control de cambios sobre los documentos | RF-14, RF-15, RN-05 | OE-07 |
| Garantizar corrección de errores de la IA mediante intervención humana | RF-13, RN-04, RN-07 | OE-04 |
| Soportar crecimiento futuro del sistema (escalabilidad) | RNF-05, RNF-08, RNF-11 | OE-01 |

---

*Documento parte de la fase de Análisis de Requisitos — Proyecto Integrador, Tecnología en Desarrollo de Software, UTS. Ver también: `01-contexto-y-objetivos.md`, `02-actores-y-perfiles-de-usuario.md`, `03-especificacion-de-requerimientos.md`, `04-historias-y-casos-de-uso.md`, `06-analisis-de-riesgos.md`.*

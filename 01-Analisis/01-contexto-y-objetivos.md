# 01. Contexto y Objetivos

## Sistema Inteligente de Gestión y Análisis de Facturas y Cotizaciones Empresariales

**Repositorio GitHub:** `gestion-facturas-cotizaciones-ia`
**Institución:** Unidades Tecnológicas de Santander (UTS)
**Programa académico:** Tecnología en Desarrollo de Software – 6° Semestre
**Asignatura:** Desarrollo de Aplicaciones Empresariales
**Sección del documento de Análisis de Requisitos:** 1 de 6

---

## Tabla de Contenido

1. Descripción del problema y contexto empresarial
2. Identificación de la necesidad y oportunidad de negocio
3. Objetivo general y objetivos específicos
4. Alcance del proyecto y exclusiones explícitas

---

## 1. Descripción del problema y contexto empresarial

En el entorno empresarial actual, particularmente en pequeñas y medianas empresas (PYMES) de la región de Santander, la gestión documental de facturas y cotizaciones se realiza en su mayoría de forma manual o mediante herramientas ofimáticas dispersas (hojas de cálculo, carpetas físicas, correos electrónicos). Este modelo de trabajo genera problemas recurrentes:

- **Pérdida y extravío de documentos** por ausencia de un repositorio centralizado.
- **Tiempos elevados de búsqueda y clasificación**, ya que el personal administrativo debe revisar manualmente cada archivo para extraer datos clave (NIT, valor total, fecha, proveedor, ítems).
- **Errores humanos en la digitación** de datos financieros al trasladarlos a sistemas contables o de control de gastos.
- **Ausencia de indicadores gerenciales en tiempo real** sobre el volumen de facturación, gastos por proveedor o tendencias de cotización.
- **Dificultad para realizar consultas ágiles** sobre el contenido histórico de los documentos (p. ej. "¿cuánto se cotizó con el proveedor X en el último trimestre?").

Estas problemáticas afectan directamente la eficiencia operativa, la trazabilidad financiera y la capacidad de toma de decisiones basada en datos, generando sobrecostos administrativos y riesgo de incumplimiento en procesos de auditoría.

El proyecto surge como respuesta a esta problemática, proponiendo el diseño y desarrollo de una **plataforma web inteligente** que permita centralizar, clasificar y analizar automáticamente facturas y cotizaciones mediante el uso de Inteligencia Artificial (IA), ofreciendo capacidades de extracción de datos estructurados, resumen automático, búsqueda en lenguaje natural y visualización de indicadores mediante un dashboard.

---

## 2. Identificación de la necesidad y oportunidad de negocio

### 2.1 Necesidad identificada

Las organizaciones requieren un mecanismo automatizado, seguro y escalable que reduzca la carga operativa asociada a la gestión manual de documentos financieros (facturas y cotizaciones), permitiendo:

- Centralizar la información documental en un repositorio digital único por organización.
- Reducir el tiempo de procesamiento manual mediante clasificación y extracción automática de datos.
- Facilitar la consulta de información histórica mediante lenguaje natural, sin requerir conocimientos técnicos de bases de datos o SQL.
- Disponer de indicadores visuales (dashboard) que apoyen la toma de decisiones gerenciales.

### 2.2 Oportunidad de negocio

- **Reducción de costos operativos:** al automatizar tareas repetitivas de digitación y clasificación, se libera tiempo del personal administrativo para labores de mayor valor agregado.
- **Escalabilidad como producto SaaS (Software as a Service):** el sistema puede ofrecerse como servicio a múltiples empresas (modelo multi-tenant), generando un modelo de negocio recurrente por suscripción.
- **Diferenciación tecnológica:** la incorporación de IA para clasificación, resumen y búsqueda semántica constituye un valor diferencial frente a soluciones tradicionales de gestión documental basadas únicamente en almacenamiento.
- **Cumplimiento y auditoría:** contar con trazabilidad digital de documentos financieros facilita procesos de auditoría interna y externa.

---

## 3. Objetivo general y objetivos específicos

Los objetivos se formulan aplicando la **Taxonomía de Bloom** (niveles cognitivos: recordar, comprender, aplicar, analizar, evaluar, crear), utilizando verbos en infinitivo que reflejan el nivel cognitivo esperado.

### 3.1 Objetivo general

**Desarrollar** un sistema web inteligente que permita gestionar, clasificar y analizar facturas y cotizaciones empresariales mediante técnicas de Inteligencia Artificial, con el fin de optimizar los procesos administrativos de captura, búsqueda y análisis de información financiera documental.

### 3.2 Objetivos específicos

| N° | Objetivo específico | Nivel Bloom |
|----|----------------------|--------------|
| OE-01 | **Diseñar** la arquitectura del sistema (frontend, backend, base de datos y servicios de IA) que soporte el procesamiento de documentos financieros de forma escalable. | Crear |
| OE-02 | **Implementar** un módulo de autenticación y gestión de repositorios organizacionales que garantice el aislamiento de la información entre distintas empresas (multi-tenant). | Aplicar |
| OE-03 | **Construir** un módulo de carga e ingesta de documentos en formatos PDF, DOCX y TXT, validando su integridad y formato previo al procesamiento. | Aplicar |
| OE-04 | **Integrar** servicios de Inteligencia Artificial para la clasificación automática de documentos (factura, cotización, otro) y la extracción de datos estructurados (NIT, fecha, valor, ítems, proveedor). | Analizar |
| OE-05 | **Desarrollar** una funcionalidad de resumen automático y búsqueda conversacional (chat en lenguaje natural) sobre el contenido de los documentos cargados. | Crear |
| OE-06 | **Diseñar** un dashboard de indicadores que permita visualizar métricas de gasto, facturación y tendencias por proveedor y periodo. | Evaluar |
| OE-07 | **Evaluar** el desempeño, usabilidad y seguridad del sistema mediante pruebas funcionales y no funcionales antes de su entrega final. | Evaluar |

---

## 4. Alcance del proyecto y exclusiones explícitas

### 4.1 Alcance

El sistema **`gestion-facturas-cotizaciones-ia`** cubrirá las siguientes capacidades dentro del ciclo de vida del Proyecto Integrador:

- Registro y autenticación de usuarios mediante correo electrónico y contraseña (con posibilidad de roles: administrador y usuario estándar).
- Creación y administración de repositorios (espacios de trabajo) por organización o proyecto.
- Carga de documentos en formato PDF, DOCX y TXT, con límite de tamaño configurable.
- Clasificación automática del documento cargado (factura, cotización, documento no reconocido) mediante modelos de IA (LLM vía API).
- Extracción de datos estructurados clave del documento (NIT/identificación, fecha de emisión, valor total, proveedor/cliente, ítems facturados) y su persistencia en base de datos relacional.
- Generación de resumen automático en lenguaje natural del contenido del documento.
- Módulo de chat / búsqueda en lenguaje natural que permita consultar el contenido de los documentos cargados dentro de un repositorio.
- Dashboard con indicadores visuales: total facturado por periodo, top proveedores, cantidad de documentos por tipo, tendencias mensuales.
- Panel de administración básico de usuarios y repositorios.

### 4.2 Exclusiones explícitas

Quedan **fuera del alcance** del presente proyecto:

- Integración con sistemas contables o ERP externos (SAP, SIIGO, World Office, etc.).
- Firma electrónica o validación legal/fiscal de las facturas (validación ante DIAN u otra entidad tributaria).
- Procesamiento de facturación electrónica bajo el estándar UBL 2.1 exigido por la DIAN en Colombia.
- Reconocimiento óptico de caracteres (OCR) sobre documentos escaneados de baja calidad o manuscritos (se asume que los documentos son digitales/nativos o cuentan con texto extraíble).
- Aplicaciones móviles nativas (iOS/Android); el proyecto se limita a una aplicación web responsiva.
- Pasarelas de pago o procesamiento de transacciones financieras reales.
- Soporte multi-idioma (el sistema se desarrollará únicamente en español).
- Facturación y cobro por uso del propio sistema (modelo de negocio SaaS), dado que corresponde a una fase posterior de comercialización, no al alcance académico del proyecto integrador.

---

*Documento parte de la fase de Análisis de Requisitos — Proyecto Integrador, Tecnología en Desarrollo de Software, UTS. Ver también: `02-actores-y-perfiles-de-usuario.md`, `03-especificacion-de-requerimientos.md`, `04-historias-y-casos-de-uso.md`, `05-priorizacion-y-trazabilidad.md`, `06-analisis-de-riesgos.md`.*

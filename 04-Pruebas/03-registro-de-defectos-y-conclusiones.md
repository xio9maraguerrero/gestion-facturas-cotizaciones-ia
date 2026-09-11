# 03. Registro de Defectos y Conclusiones

## Proyecto: Gestión de Facturas y Cotizaciones con IA
## Fase IV: Pruebas y Aseguramiento de Calidad

---

## 1. Resumen de Ejecución de Pruebas

De un total de **11 casos de prueba** ejecutados, cubriendo los módulos de autenticación, gestión de repositorios, validación de archivos, procesamiento de inteligencia artificial, extracción estructurada, búsqueda semántica (RAG), seguridad básica y manejo de errores/casos límite, se obtuvieron los siguientes resultados:

| Métrica | Valor |
|---|---|
| Total de casos de prueba ejecutados | 11 |
| Casos que pasaron (estado final) | 11 |
| Casos que fallaron inicialmente (con corrección posterior) | 1 (CP-05) |
| Casos fallidos sin resolver | 0 |
| **Porcentaje de éxito final** | **100 %** |
| **Porcentaje de éxito en primera ejecución** | **90.9 %** (10/11) |

### 1.1 Distribución de Resultados por Categoría

| Categoría | Total CP | Pasaron (final) | Fallaron (inicial) |
|---|---|---|---|
| Funcional | 2 | 2 | 0 |
| Validación de Archivos | 2 | 2 | 0 |
| Procesamiento de IA | 1 | 1 | 1 (CP-05) |
| Clasificación y Extracción | 1 | 1 | 0 |
| Búsqueda / RAG | 1 | 1 | 0 |
| Seguridad Básica | 2 | 2 | 0 |
| Errores y Casos Límite | 2 | 2 | 0 |

El único defecto crítico identificado durante la ejecución de pruebas correspondió al caso **CP-05 (Procesamiento de IA)**, documentado formalmente en la siguiente sección.

---

## 2. Registro de Defectos y Correcciones (Bug Tracking Log)

### DEFECTO-001

| Campo | Detalle |
|---|---|
| **ID del Defecto** | DEFECTO-001 |
| **Caso de Prueba Relacionado** | CP-05 — Normalización y envío de texto extraído a Groq API |
| **Módulo Afectado** | `aiService.js`, `aiController.js`, variable de entorno `GROQ_MODEL` |
| **Severidad** | Crítica |
| **Prioridad** | Alta |
| **Fecha de Detección** | Fase de pruebas iniciales de integración con Groq API |
| **Herramienta de Detección** | Postman / Thunder Client |

#### Síntoma

Durante las pruebas iniciales con Postman/Thunder Client, los endpoints de **autenticación**, **creación de repositorios** y **subida de archivos** funcionaban correctamente al 100 % (respuestas HTTP 200/201 esperadas). Sin embargo, las consultas realizadas al **endpoint de inteligencia artificial** (`POST /api/ai/analizar`) fallaban consistentemente, retornando **errores de tipo 500** o, en algunos casos, **respuestas vacías** sin contenido de análisis.

##### Evidencia del Defecto Detectado:
![Fallo en Endpoint IA por modelo deprecado](./img/consulta_ia_error.png)

#### Causa Raíz

Tras un proceso de diagnóstico y depuración (*debugging*) revisando los logs del servidor Node.js y las respuestas crudas devueltas por la API de Groq en Postman/Thunder Client, se determinó que la causa raíz correspondía a la configuración de la variable de entorno `GROQ_MODEL`, la cual apuntaba inicialmente a una **versión de modelo deprecada** dentro del catálogo de Groq Cloud. Dicho modelo ya no se encontraba disponible/soportado por el proveedor, provocando el rechazo de las solicitudes por parte de la API externa.

#### Corrección Aplicada

1. Se actualizó la variable de entorno `GROQ_MODEL` en el archivo `.env` (y su plantilla `.env.example`), reemplazando el valor deprecado por el modelo vigente:
   ```env
   GROQ_MODEL=llama-3.3-70b-versatile
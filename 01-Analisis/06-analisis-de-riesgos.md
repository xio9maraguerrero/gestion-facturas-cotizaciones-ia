# 06. Análisis de Riesgos

## Sistema Inteligente de Gestión y Análisis de Facturas y Cotizaciones Empresariales

**Repositorio GitHub:** `gestion-facturas-cotizaciones-ia`
**Sección del documento de Análisis de Requisitos:** 6 de 6

---

## Tabla de Contenido

13. Matriz de análisis de riesgos del proyecto
14. Control de versiones del documento

---

## 13. Matriz de análisis de riesgos del proyecto

| ID | Riesgo | Probabilidad | Impacto | Nivel de riesgo | Estrategia de mitigación |
|----|--------|:--------------:|:---------:|:------------------:|----------------------------|
| R-01 | El servicio de IA (API externa) presenta latencia alta o indisponibilidad, afectando la clasificación y el chat. | Media | Alto | Alto | Implementar mecanismos de reintento (retry) con backoff exponencial y definir un estado de "error de procesamiento" que no bloquee el resto del sistema; evaluar un proveedor de IA alterno como respaldo. |
| R-02 | La precisión de la clasificación/extracción de la IA es menor a la esperada en documentos con formatos no estándar. | Alta | Medio | Alto | Establecer un flujo de revisión y corrección manual (RF-13) y ajustar iterativamente los prompts/modelo con un conjunto de documentos de prueba representativo. |
| R-03 | Filtración o acceso no autorizado a información financiera sensible de una organización. | Baja | Muy alto | Alto | Implementar RBAC estricto (RNF-02), cifrado en tránsito (RNF-03) y pruebas de control de acceso entre repositorios antes de cada entrega. |
| R-04 | Retrasos en el cronograma académico debido a la curva de aprendizaje en integración de servicios de IA. | Media | Medio | Medio | Planificar sprints con entregables incrementales, priorizando los requisitos "Must Have" de la matriz MoSCoW en las primeras iteraciones. |
| R-05 | Costos asociados al consumo de la API de IA superan el presupuesto disponible para el proyecto académico. | Media | Medio | Medio | Definir límites de uso (rate limiting), utilizar planes gratuitos/de prueba y realizar pruebas con conjuntos de datos reducidos durante el desarrollo. |
| R-06 | Pérdida de información por fallos en el almacenamiento o en la base de datos. | Baja | Alto | Medio | Implementar respaldos (backups) periódicos y control de versiones del código y esquema de base de datos mediante el repositorio Git. |
| R-07 | Los datos extraídos automáticamente inducen decisiones erróneas si el usuario no valida la información. | Media | Alto | Alto | Mostrar de forma visible el nivel de confianza de la extracción y habilitar la edición manual obligatoria para documentos marcados como "No clasificado" (RN-07). |
| R-08 | Rotación o disponibilidad limitada de los integrantes del equipo de desarrollo durante el semestre académico. | Media | Medio | Medio | Documentar el proyecto de forma continua (README, wiki del repositorio) para facilitar la incorporación o reasignación de tareas entre integrantes. |

---

## 14. Control de versiones del documento

| Versión | Fecha | Autor(es) | Descripción del cambio |
|---------|-------|-----------|--------------------------|
| 1.0 | Fecha de entrega inicial | Equipo del proyecto | Versión inicial del Documento de Análisis de Requisitos (archivo único). |
| 1.1 | Fecha de reestructuración | Equipo del proyecto | División del documento en 6 archivos independientes dentro de `01-analisis/` para mejorar la legibilidad y organización del repositorio. |

---

*Documento parte de la fase de Análisis de Requisitos — Proyecto Integrador, Tecnología en Desarrollo de Software, UTS. Ver también: `01-contexto-y-objetivos.md`, `02-actores-y-perfiles-de-usuario.md`, `03-especificacion-de-requerimientos.md`, `04-historias-y-casos-de-uso.md`, `05-priorizacion-y-trazabilidad.md`.*

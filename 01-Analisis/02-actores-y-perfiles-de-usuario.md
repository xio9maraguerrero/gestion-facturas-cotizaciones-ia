# 02. Actores y Perfiles de Usuario

## Sistema Inteligente de Gestión y Análisis de Facturas y Cotizaciones Empresariales

**Repositorio GitHub:** `gestion-facturas-cotizaciones-ia`
**Sección del documento de Análisis de Requisitos:** 2 de 6

---

## Tabla de Contenido

5. Actores del sistema y Perfiles de Usuario (User Personas)

---

## 5. Actores del sistema y perfiles de usuario

### 5.1 Actores del sistema

| Actor | Descripción |
|-------|-------------|
| **Usuario Administrador** | Usuario con privilegios de gestión total sobre un repositorio: administra usuarios, configura parámetros y visualiza todos los documentos e indicadores. |
| **Usuario Estándar (Colaborador)** | Usuario con permisos para cargar documentos, consultar el chat/búsqueda y visualizar el dashboard, sin privilegios administrativos. |
| **Servicio de IA (Actor externo/sistema)** | Servicio externo (API de modelo de lenguaje) que recibe el contenido del documento y retorna clasificación, resumen y datos estructurados. |
| **Sistema de Autenticación** | Componente/servicio responsable de validar credenciales y gestionar sesiones (tokens JWT). |

### 5.2 Perfiles de usuario (User Personas)

#### Persona 1 — "Marcela, Auxiliar Administrativa"

- **Edad:** 29 años.
- **Rol:** Auxiliar contable/administrativa en una PYME de servicios.
- **Objetivo:** Cargar rápidamente las facturas recibidas por correo y encontrar información histórica sin tener que abrir cada archivo manualmente.
- **Frustraciones:** Pierde entre 2 y 3 horas semanales buscando facturas antiguas en carpetas desorganizadas.
- **Nivel técnico:** Básico-medio; usa Excel y Outlook diariamente, sin conocimientos de bases de datos.

#### Persona 2 — "Andrés, Gerente Financiero"

- **Edad:** 41 años.
- **Rol:** Gerente financiero de una empresa mediana.
- **Objetivo:** Contar con indicadores visuales actualizados sobre gasto por proveedor y volumen de cotizaciones para la toma de decisiones estratégicas.
- **Frustraciones:** No dispone de reportes consolidados en tiempo real; depende de reportes manuales elaborados en Excel por su equipo.
- **Nivel técnico:** Medio; cómodo con dashboards y reportes, pero no con configuración técnica.

#### Persona 3 — "Camila, Administradora del Sistema (TI)"

- **Edad:** 34 años.
- **Rol:** Encargada de TI que configura el repositorio institucional y gestiona los usuarios que tienen acceso.
- **Objetivo:** Garantizar que la información esté correctamente segmentada por repositorio y que el acceso esté controlado por roles.
- **Frustraciones:** Preocupación por la seguridad y el control de acceso a información financiera sensible.
- **Nivel técnico:** Alto; familiarizada con sistemas de gestión de usuarios y permisos.

---

*Documento parte de la fase de Análisis de Requisitos — Proyecto Integrador, Tecnología en Desarrollo de Software, UTS. Ver también: `01-contexto-y-objetivos.md`, `03-especificacion-de-requerimientos.md`, `04-historias-y-casos-de-uso.md`, `05-priorizacion-y-trazabilidad.md`, `06-analisis-de-riesgos.md`.*

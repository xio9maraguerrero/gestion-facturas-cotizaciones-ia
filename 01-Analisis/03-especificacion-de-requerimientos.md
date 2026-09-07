# 03. Especificación de Requerimientos

## Sistema Inteligente de Gestión y Análisis de Facturas y Cotizaciones Empresariales

**Repositorio GitHub:** `gestion-facturas-cotizaciones-ia`
**Sección del documento de Análisis de Requisitos:** 3 de 6

---

## Tabla de Contenido

6. Requerimientos Funcionales (RF)
7. Requerimientos No Funcionales (RNF)
8. Reglas de Negocio (RN)

---

## 6. Requerimientos Funcionales (RF)

| ID | Requerimiento | Descripción detallada | Criterio de verificación |
|----|----------------|------------------------|----------------------------|
| **RF-01** | Registro de usuario | El sistema debe permitir el registro de un nuevo usuario mediante nombre, correo electrónico y contraseña, validando formato de correo y política de contraseña segura (mínimo 8 caracteres, mayúscula, número). | Un registro con datos válidos crea la cuenta y retorna confirmación; un registro con datos inválidos es rechazado con mensaje de error específico. |
| **RF-02** | Autenticación de usuario | El sistema debe permitir el inicio de sesión mediante correo y contraseña, generando un token de sesión (JWT) con expiración configurable. | Credenciales correctas generan un token válido; credenciales incorrectas retornan error 401 sin revelar cuál campo es incorrecto. |
| **RF-03** | Gestión de repositorios | El sistema debe permitir a un usuario administrador crear, editar y eliminar repositorios (espacios de trabajo) asociados a su organización. | Un repositorio creado aparece en el listado del usuario administrador y es accesible solo por los usuarios asignados a él. |
| **RF-04** | Asignación de usuarios a repositorio | El sistema debe permitir invitar o asociar usuarios estándar a un repositorio específico, definiendo su rol (administrador o colaborador). | Un usuario invitado puede acceder únicamente a los repositorios a los que fue asignado. |
| **RF-05** | Carga de documentos | El sistema debe permitir subir archivos en formato PDF, DOCX o TXT con un tamaño máximo de 10 MB por archivo. | Un archivo con formato/tamaño válido se carga y queda visible en el repositorio; un archivo no soportado es rechazado con mensaje explicativo. |
| **RF-06** | Validación de integridad del archivo | El sistema debe verificar que el archivo cargado no esté corrupto y contenga texto extraíble antes de enviarlo al motor de IA. | Un archivo corrupto o vacío genera un estado de error visible para el usuario, sin bloquear la carga de otros archivos. |
| **RF-07** | Clasificación automática mediante IA | El sistema debe enviar el contenido extraído del documento a un servicio de IA que determine si corresponde a una "Factura", "Cotización" u "Otro", almacenando la categoría resultante. | Al menos el 85% de los documentos de prueba (factura/cotización estándar) son clasificados correctamente en el entorno de pruebas. |
| **RF-08** | Extracción de datos estructurados | El sistema debe extraer automáticamente, mediante IA, los campos: número de documento, fecha de emisión, NIT/identificación del emisor, nombre del proveedor/cliente, valor total e ítems (descripción, cantidad, valor unitario). | Los campos extraídos se almacenan en la base de datos y son editables manualmente por el usuario en caso de error de extracción. |
| **RF-09** | Generación de resumen automático | El sistema debe generar un resumen en lenguaje natural (máximo 5 líneas) del contenido de cada documento procesado. | Cada documento clasificado exitosamente cuenta con un resumen visible en su vista de detalle. |
| **RF-10** | Chat / búsqueda en lenguaje natural | El sistema debe ofrecer una interfaz de chat donde el usuario pueda realizar preguntas en lenguaje natural sobre los documentos de un repositorio (p. ej. "¿cuál fue el total facturado por el proveedor X en marzo?"). | El sistema responde con información basada en los documentos indexados del repositorio, referenciando el/los documento(s) fuente. |
| **RF-11** | Dashboard de indicadores | El sistema debe presentar un dashboard con al menos los siguientes indicadores: total facturado por periodo, cantidad de documentos por tipo, top 5 proveedores por valor acumulado y tendencia mensual. | Los indicadores se actualizan automáticamente al cargarse un nuevo documento clasificado. |
| **RF-12** | Filtro y búsqueda estructurada de documentos | El sistema debe permitir filtrar documentos por tipo, rango de fechas, proveedor y rango de valor. | Al aplicar un filtro, el listado de documentos mostrado corresponde exactamente a los criterios seleccionados. |
| **RF-13** | Edición manual de datos extraídos | El sistema debe permitir a un usuario corregir manualmente los campos extraídos automáticamente por la IA en caso de error. | Los cambios manuales se guardan y quedan reflejados en el dashboard y en futuras búsquedas del chat. |
| **RF-14** | Historial de auditoría | El sistema debe registrar quién cargó, editó o eliminó un documento, junto con la fecha y hora del evento. | Cada documento cuenta con un registro de auditoría consultable por el usuario administrador. |
| **RF-15** | Eliminación lógica de documentos | El sistema debe permitir eliminar documentos mediante borrado lógico (soft delete), manteniendo el registro para fines de auditoría. | Un documento eliminado deja de listarse para el usuario estándar, pero permanece disponible para el administrador mediante consulta de auditoría. |

---

## 7. Requerimientos No Funcionales (RNF)

| ID | Categoría | Requerimiento |
|----|-----------|----------------|
| **RNF-01** | Seguridad | El sistema debe cifrar las contraseñas de los usuarios mediante un algoritmo de hashing seguro (p. ej. bcrypt) y nunca almacenarlas en texto plano. |
| **RNF-02** | Seguridad | El sistema debe implementar control de acceso basado en roles (RBAC), garantizando que un usuario no pueda acceder a documentos de un repositorio al que no pertenece. |
| **RNF-03** | Seguridad | Toda comunicación entre cliente y servidor debe realizarse mediante el protocolo HTTPS/TLS. |
| **RNF-04** | Rendimiento | El sistema debe procesar la clasificación y extracción de datos de un documento en un tiempo máximo de 15 segundos bajo condiciones normales de operación. |
| **RNF-05** | Rendimiento | El dashboard debe cargar los indicadores principales en un tiempo máximo de 3 segundos con hasta 5,000 documentos por repositorio. |
| **RNF-06** | Usabilidad | La interfaz debe ser responsiva, adaptándose correctamente a resoluciones de escritorio (≥1280px) y tabletas (≥768px). |
| **RNF-07** | Usabilidad | El sistema debe presentar mensajes de error claros y comprensibles para usuarios sin conocimientos técnicos. |
| **RNF-08** | Escalabilidad | La arquitectura debe soportar el crecimiento en el número de repositorios y documentos sin degradar el rendimiento, mediante diseño modular y separación de servicios (backend, IA, base de datos). |
| **RNF-09** | Mantenibilidad | El código fuente debe seguir una arquitectura en capas (presentación, lógica de negocio, acceso a datos) y estándares de documentación (comentarios, README, convenciones de nomenclatura). |
| **RNF-10** | Disponibilidad | El sistema debe garantizar una disponibilidad objetivo del 99% en el entorno de despliegue durante el periodo de evaluación del proyecto. |
| **RNF-11** | Portabilidad | El backend debe poder desplegarse mediante contenedores (Docker) para facilitar su ejecución en distintos entornos. |
| **RNF-12** | Compatibilidad | El sistema debe ser compatible con los navegadores Google Chrome, Mozilla Firefox y Microsoft Edge en sus versiones vigentes. |

---

## 8. Reglas de Negocio (RN)

| ID | Regla de negocio |
|----|-------------------|
| **RN-01** | Un documento solo puede pertenecer a un único repositorio; no se permite la duplicación cruzada entre repositorios. |
| **RN-02** | Un documento debe ser clasificado obligatoriamente como "Factura", "Cotización" u "Otro" antes de ser incluido en los cálculos del dashboard. |
| **RN-03** | Solo un usuario con rol "Administrador" puede eliminar definitivamente un repositorio y sus documentos asociados. |
| **RN-04** | El valor total de una factura o cotización no puede ser negativo; si el sistema de IA extrae un valor negativo o inválido, el documento debe marcarse como "pendiente de revisión manual". |
| **RN-05** | Todo documento cargado debe quedar asociado a la fecha y al usuario que realizó la carga, dato que no puede ser modificado posteriormente (integridad de auditoría). |
| **RN-06** | Un usuario estándar (colaborador) no puede eliminar repositorios ni modificar la asignación de roles de otros usuarios. |
| **RN-07** | Si el servicio de IA no logra clasificar un documento con un nivel de confianza mínimo (definido en configuración), el documento debe quedar en estado "No clasificado" y no debe considerarse en los indicadores del dashboard hasta su revisión manual. |
| **RN-08** | Las contraseñas deben cumplir la política mínima de seguridad (8 caracteres, al menos una mayúscula y un número) para permitir el registro del usuario. |

---

*Documento parte de la fase de Análisis de Requisitos — Proyecto Integrador, Tecnología en Desarrollo de Software, UTS. Ver también: `01-contexto-y-objetivos.md`, `02-actores-y-perfiles-de-usuario.md`, `04-historias-y-casos-de-uso.md`, `05-priorizacion-y-trazabilidad.md`, `06-analisis-de-riesgos.md`.*

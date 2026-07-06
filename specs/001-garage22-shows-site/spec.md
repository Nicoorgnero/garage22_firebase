# Especificación General — Sitio Web Oficial de Garage22

**Feature Branch**: `001-garage22-shows-site`
**Created**: 2026-07-06
**Status**: Draft

> Este archivo es el **índice del proyecto**. Cada funcionalidad tiene su propia spec detallada.
> Leé este documento primero para entender el alcance general; luego navegá a la spec correspondiente.

---

## Sub-especificaciones

| # | Funcionalidad | Archivo | User Stories | FRs |
|---|---|---|---|---|
| 01 | Página informativa pública | [`spec-01-pagina-informativa.md`](./spec-01-pagina-informativa.md) | US1 | FR-001–004 |
| 02 | Calendario de shows (vista pública) | [`spec-02-calendario-publico.md`](./spec-02-calendario-publico.md) | US2 | FR-005–009 |
| 03 | Login de administradores | [`spec-03-autenticacion.md`](./spec-03-autenticacion.md) | US3 | FR-010–015 |
| 04 | ABM de Shows (administración) | [`spec-04-abm-shows.md`](./spec-04-abm-shows.md) | US4–7 | FR-016–025 |
| 05 | Seguridad, Firebase y schema de datos | [`spec-05-seguridad-firebase.md`](./spec-05-seguridad-firebase.md) | — | FR-026–028 |

---

## Descripción General del Proyecto

Sitio web oficial de **Garage22**, una banda de rock under. El sistema tiene tres grandes bloques funcionales:

1. **Página informativa pública** — información de la banda (biografía, integrantes, estilo musical) y enlaces a Instagram y Spotify. Sin login requerido. Ruta: `/`.
2. **Calendario de fechas** — listado de próximos shows (venue, fecha, hora, link a entradas). Visible para cualquier visitante; gestionado por administradores autenticados (ABM: alta, baja, modificación, listado). Ruta pública: `/shows`.
3. **Login de administradores** — pantalla de autenticación con Firebase Auth (email/contraseña) para acceder a la gestión del calendario. Ruta: `/admin`.
**Rutas del sistema:**
- `/` — Página informativa de la banda (biografía, integrantes, estilo musical, redes sociales)
- `/shows` — Calendario público de shows (accesible sin login)
- `/admin` — Muestra formulario de login si no hay sesión activa; muestra la vista de administración del ABM si hay sesión activa

### Usuarios del sistema

| Rol | Capacidades |
|---|---|
| **Visitante** (no autenticado) | Ver página informativa, acceder a redes sociales, ver calendario de shows públicos |
| **Administrador** (autenticado) | Todo lo anterior + agregar, editar y eliminar fechas del calendario |

### Stack técnico

- **Frontend**: React (componentes funcionales, hooks, Context API)
- **Build tool**: Vite (`npm create vite@latest`); variables de entorno con prefijo `VITE_*`
- **Base de datos**: Firestore (colección `shows`)
- **Autenticación**: Firebase Authentication (email/contraseña)
- **Integración**: Firebase SDK exclusivamente a través de React (hooks/servicios), conforme al Principio V de la constitución

### Entidad principal del ABM: `Show`

Ver schema completo en [`spec-05-seguridad-firebase.md`](./spec-05-seguridad-firebase.md).

Campos clave: `venue`, `dateTime`, `city`, `description`, `ticketUrl`, `createdAt`, `updatedAt`, `createdBy`.

---

## Clarifications

### Session 2026-07-06

- Q: ¿Qué herramienta de build/bundler se usa para la app React? → A: Vite (`npm create vite@latest`); las variables de entorno de Firebase usan el prefijo `VITE_*`.
- Q: ¿Cuál es la estructura de navegación del sitio? → A: Multi-ruta mínima: `/` (página pública + calendario), `/admin` (muestra login form si no hay sesión, vista de ABM si hay sesión). Sin ruta `/login` separada.
- Q: ¿Cómo se estructura la página pública? → A: Dos sub-rutas públicas: `/` (información de la banda) y `/shows` (calendario de shows). Requiere React Router DOM y navegación entre ellas.
- Q: ¿Cómo se muestra el feedback de éxito en operaciones ABM? → A: Mensaje inline transitorio: texto de éxito debajo del botón de acción durante ~3 segundos, luego desaparece. Sin toast/notificación global.
- Q: ¿Cómo se implementa la confirmación de eliminación? → A: Inline en el listado: el botón "Eliminar" se reemplaza por "¿Confirmar?" y "Cancelar" en la misma fila. Sin `window.confirm()` ni modal externo.

### Session 2026-07-06 (segunda ronda)

- Q: ¿Cómo se implementa la edición de shows (US5)? → A: Inline en la fila del listado: al hacer clic en "Editar", los valores se convierten en inputs editables con botones "Guardar" y "Cancelar" en la misma fila. Sin formulario ni modal separado.
- Q: ¿Dónde y cómo aparece el formulario de alta de shows? → A: Oculto por defecto. Un botón "+ Agregar show" lo despliega encima del listado; al guardar exitosamente o cancelar, el formulario se oculta y el botón reaparece.
- Q: ¿En qué orden se muestra el listado de administración? → A: Cronológico descendente (`dateTime` desc): shows futuros/próximos primero, históricos al fondo.
- Q: ¿Cómo se captura la fecha y hora del show en el formulario? → A: Un único `<input type="datetime-local">`; su valor se convierte a Firestore `Timestamp` con `Timestamp.fromDate(new Date(value))` al guardar.
- Q: ¿En qué formato se muestra la fecha/hora de los shows en la vista pública? → A: Español largo con API nativa: ej. "sábado 12 de julio de 2026 · 21:00 hs" usando `toLocaleDateString('es-AR', ...)` + `toLocaleTimeString('es-AR', ...)`. Sin librerías externas.

### Session 2026-07-06 (tercera ronda)

- Q: ¿Qué muestra `/admin` mientras Firebase resuelve el estado de sesión? → A: Spinner/indicador de carga neutral. `AuthContext` expone `loading`, `user` y `null`; mientras `loading === true` se muestra el spinner, sin parpadeo (no se muestra el formulario de login antes de tiempo).
- Q: ¿Existe navbar? ¿En qué rutas? → A: Navbar compartida solo en rutas públicas (`/` y `/shows`) con enlaces "Inicio" y "Shows". La ruta `/admin` tiene layout independiente sin navbar pública; solo muestra un botón "Cerrar sesión" cuando hay sesión activa.
- Q: ¿Qué campos muestra cada fila del listado de administración en modo lectura? → A: Compacto: venue + fecha/hora formateada (español largo). Los campos opcionales con valor se indican con badge/ícono. El contenido completo de opcionales solo se ve al entrar en modo edición inline.
- Q: ¿Qué formato de fecha/hora se usa en el listado de administración? → A: Mismo formato que la vista pública: español largo (`"sábado 12 de julio de 2026 · 21:00 hs"`). Consistencia visual entre rutas.
- Q: ¿Cómo se pre-popula el `datetime-local` al editar un show? → A: Hora local del browser — `timestamp.toDate()` formateado como `YYYY-MM-DDTHH:mm` en zona local (no UTC). El admin ve y edita la hora argentina tal como fue ingresada.

### Session 2026-07-06 (cuarta ronda)

- Q: ¿Pueden estar abiertos el formulario de alta y una edición inline simultáneamente? → A: No; modos mutuamente excluyentes. Estado único: `'listado' | 'alta' | { editando: showId }`. Activar un modo cancela silenciosamente el anterior.
- Q: ¿Cuál es el label visible del campo `venue` en el formulario? → A: "Venue". Labels completas: "Venue", "Fecha y hora", "Ciudad", "Descripción", "Link a entradas".
- Q: ¿Las modificaciones de shows registran quién modificó (`updatedBy`)? → A: Sí. `updateDoc` escribe `updatedAt: serverTimestamp()` + `updatedBy: user.uid`. El campo `updatedBy` se agrega al schema; ausente en documentos nunca editados.

### Session 2026-07-06 (quinta ronda)

- Q: ¿Cómo se muestra el éxito al eliminar un show? → A: La desaparición de la fila (via `onSnapshot`) ES el feedback. Sin mensaje de texto adicional. FR-024 exime a la baja del mensaje de éxito textual; solo aplica a alta y modificación.

---

## Prioridades de Implementación

| Prioridad | User Story | Funcionalidad |
|---|---|---|
| P1 | US1 | Visitante ve la página informativa y accede a redes sociales |
| P2 | US2 | Visitante consulta el calendario de shows |
| P3 | US3 | Administrador se autentica |
| P4 | US4 + US7 | Administrador agrega shows y ve el listado completo |
| P5 | US5 | Administrador edita un show |
| P6 | US6 | Administrador elimina un show |

---

## Fuera de Alcance (v1)

- Registro de nuevos administradores desde la web (se gestionan manualmente en Firebase Console).
- Venta de entradas o pagos integrados.
- Blog, noticias o sección de contacto.
- Roles diferenciados de administración (editor vs. super-admin).
- SEO avanzado o Server-Side Rendering.
- Soporte para visitantes con JavaScript desactivado.

---

## Assumptions Generales

- Los administradores ya existen como usuarios en Firebase Authentication.
- El sitio es en español.
- Las URLs de Instagram y Spotify se configuran como constantes en el código (no editables desde la UI en v1).
- El diseño visual es responsabilidad del desarrollador; la spec prioriza funcionalidad sobre estética en v1.
- Las variables de entorno se configuran en `.env` local y en el entorno de deploy; el repositorio incluye `.env.example` con todas las claves listadas sin valores.
- Firebase SDK se integra exclusivamente a través de React, conforme a la constitución del proyecto (Principio V).

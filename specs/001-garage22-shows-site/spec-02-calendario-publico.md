# Spec 02 — Calendario de Shows (Vista Pública)

**Proyecto**: Sitio Web Oficial de Garage22
**Feature Branch**: `001-garage22-shows-site`
**Created**: 2026-07-06
**Status**: Draft

> **Índice del proyecto**: [`spec.md`](./spec.md)
> **Specs relacionadas**: [`spec-04-abm-shows.md`](./spec-04-abm-shows.md) — el ABM es quien carga los shows que este calendario muestra. [`spec-05-seguridad-firebase.md`](./spec-05-seguridad-firebase.md) — schema de la colección `shows` y reglas de lectura pública.

---

## Descripción

Vista pública que muestra el listado de próximas fechas de shows de la banda. Se sirve en la ruta `/shows`. Cualquier visitante puede consultarla sin necesidad de autenticarse. Los datos provienen de la colección `shows` en Firestore en tiempo real (`onSnapshot`). Debe manejar explícitamente los estados de carga, error y sin datos.

---

## User Scenarios & Testing

### User Story 2 — Visitante consulta el calendario de shows (Priority: P2)

Un visitante puede ver el listado de próximas fechas de shows publicadas por los administradores (lugar, fecha, hora y, si aplica, link al evento o a entradas), sin necesidad de iniciar sesión.

**Why this priority**: El calendario es el contenido dinámico principal del sitio y el segundo motivo por el que un visitante lo consultaría. Depende de que existan shows cargados, pero su visualización pública es independiente del ABM de administración.

**Independent Test**: Con al menos un show cargado en Firestore, abrir el sitio sin sesión iniciada y verificar que el show aparece en el calendario con sus datos completos.

**Acceptance Scenarios**:

1. **Given** que hay shows publicados en Firestore, **When** un visitante no autenticado navega a `/shows`, **Then** ve el listado de shows futuros ordenados cronológicamente; cada show muestra venue, fecha y hora en formato español largo (ej.: "sábado 12 de julio de 2026 · 21:00 hs") y ciudad si existe.
2. **Given** que un show tiene link a entradas, **When** el visitante lo ve en el calendario, **Then** hay un enlace clicable que abre el link en una pestaña nueva.
3. **Given** que no hay shows cargados, **When** el visitante consulta el calendario, **Then** ve un mensaje claro del tipo "No hay fechas próximas por el momento" (estado vacío explícito).
4. **Given** que el calendario está cargando datos de Firestore, **When** la respuesta no ha llegado, **Then** se muestra un indicador de carga visible (estado loading explícito).
5. **Given** que Firestore devuelve un error, **When** el visitante intenta ver el calendario, **Then** se muestra un mensaje de error comprensible para el usuario (estado error explícito).

### Edge Cases

- ¿Qué ocurre si Firestore está temporalmente inaccesible? → Se muestra el estado de error con mensaje comprensible; no se muestra una pantalla en blanco ni un error técnico.
- ¿Se muestran shows pasados en la vista pública? → No; la vista pública filtra y muestra solo los shows con `dateTime` mayor o igual a la fecha actual, ordenados cronológicamente (próximos primeros).

---

## Requirements

### Functional Requirements

- **FR-005**: El sistema DEBE mostrar en la ruta `/shows` el listado de shows publicados en Firestore a cualquier visitante no autenticado.
- **FR-006**: Cada show en el listado público DEBE mostrar: nombre del venue, fecha y hora del evento formateados en español largo (ej.: `"sábado 12 de julio de 2026 · 21:00 hs"`) usando `Date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })` y `toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })` — sin librerías externas —, ciudad (si existe) y descripción (si existe).
- **FR-007**: Si un show tiene link a entradas/evento, el listado DEBE mostrarlo como enlace clicable que abra en pestaña nueva.
- **FR-008**: El calendario público DEBE mostrar los shows con `dateTime` ≥ fecha/hora actual, ordenados cronológicamente (próximos primeros).
- **FR-009**: El listado público DEBE manejar explícitamente los estados: cargando, sin datos y error, con mensajes comprensibles para el usuario final.

---

## Success Criteria

- **SC-002**: Un visitante puede ver el listado de próximas fechas de shows sin iniciar sesión, con indicadores visuales de carga mientras se obtienen los datos.
- **SC-004**: Un show agregado por un administrador es visible en la vista pública sin necesidad de recargar la página manualmente (propagación en tiempo real vía Firestore `onSnapshot`).

---

## Assumptions

- La suscripción a Firestore (`onSnapshot`) se gestiona dentro de un hook de React (`useShows` o similar) con limpieza correcta del listener al desmontar el componente (`unsubscribe`), conforme al Principio V de la constitución.
- El calendario público solo muestra shows futuros; el historial de shows pasados es visible únicamente para administradores autenticados (ver [`spec-04-abm-shows.md`](./spec-04-abm-shows.md)).

# Spec 04 — ABM de Shows (Vista de Administración)

**Proyecto**: Sitio Web Oficial de Garage22
**Feature Branch**: `001-garage22-shows-site`
**Created**: 2026-07-06
**Status**: Draft

> **Índice del proyecto**: [`spec.md`](./spec.md)
> **Specs relacionadas**: [`spec-03-autenticacion.md`](./spec-03-autenticacion.md) — el login es prerequisito para acceder a esta vista. [`spec-05-seguridad-firebase.md`](./spec-05-seguridad-firebase.md) — schema de la colección `shows` y reglas de escritura.

---

## Descripción

Vista exclusiva para administradores autenticados. Provee las cuatro operaciones del módulo ABM sobre la entidad **Show**: Alta, Baja, Modificación y Listado. La vista en `/admin` tiene un único modo activo a la vez, modelado como un estado `modo: 'listado' | 'alta' | { editando: showId }`:

- **`'listado'`** (por defecto): se ve el listado completo y el botón "+ Agregar show".
- **`'alta'`**: al pulsar "+ Agregar show", el formulario de alta aparece encima del listado y el botón desaparece. Al guardar o cancelar vuelve a `'listado'`.
- **`{ editando: showId }`**: al pulsar "Editar" en una fila, esa fila entra en modo edición inline. Al guardar, cancelar o hacer clic en "Editar" de otra fila, el modo anterior se cancela sin guardar.

Abrir el formulario de alta cierra cualquier fila en edición. Hacer clic en "Editar" cierra el formulario de alta si estaba abierto. Solo puede haber un modo activo simultáneamente. Toda operación refleja explícitamente los estados de carga, éxito y error en la UI. Los cambios se propagan en tiempo real a la vista pública (`/shows`) a través de la suscripción `onSnapshot` de Firestore.

---

## User Scenarios & Testing

### User Story 4 — Administrador agrega una nueva fecha (Priority: P4)

Un administrador autenticado puede cargar un nuevo show al calendario completando un formulario con los datos del evento. El show aparece inmediatamente visible para cualquier visitante.

**Why this priority**: Es la operación de Alta del ABM. Sin ella no hay contenido que mostrar ni administrar.

**Independent Test**: Autenticarse como administrador. Verificar que la vista muestra el listado y el botón "+ Agregar show" (sin formulario visible). Hacer clic en el botón, completar el formulario con datos válidos, guardar, y verificar que el formulario se oculta, el nuevo show aparece en el listado y es visible en `/shows` sin recargar la página.

**Acceptance Scenarios**:

1. **Given** que el administrador está en `/admin`, **When** se carga la vista, **Then** ve el listado de shows y un botón "+ Agregar show" visible; el formulario de alta **no** está visible por defecto.
2. **Given** que el administrador hace clic en "+ Agregar show", **When** el botón es pulsado, **Then** el formulario de alta aparece encima del listado y el botón "+ Agregar show" desaparece.
3. **Given** que el formulario de alta está visible, **When** el administrador completa venue, fecha y hora (campos obligatorios) y guarda, **Then** el show se crea en Firestore, el formulario se oculta, el botón "+ Agregar show" reaparece y el nuevo show figura en el listado.
4. **Given** que el formulario de alta está visible, **When** el administrador hace clic en "Cancelar", **Then** el formulario se oculta sin crear nada y el botón "+ Agregar show" reaparece.
5. **Given** que el administrador intenta guardar sin completar campos obligatorios (venue, fecha/hora), **When** hace clic en guardar, **Then** ve mensajes de validación por campo antes de que se realice cualquier llamada a Firestore.
6. **Given** que el formulario está siendo enviado a Firestore, **When** la operación está en curso, **Then** el botón guardar muestra estado de carga y no puede presionarse dos veces.
7. **Given** que Firestore devuelve un error al guardar, **When** la operación falla, **Then** el administrador ve un mensaje de error comprensible y el formulario mantiene los datos ingresados.
8. **Given** que el show fue creado exitosamente, **When** Firestore confirma la escritura, **Then** el administrador ve un mensaje inline de éxito (ej.: "Show guardado correctamente") durante ~3 segundos antes de que el formulario se oculte.

---

### User Story 5 — Administrador edita una fecha existente (Priority: P5)

Un administrador autenticado puede seleccionar un show ya cargado, modificar sus datos (por ejemplo: cambio de horario o de venue) y guardar los cambios. La actualización se refleja inmediatamente en el calendario público.

**Why this priority**: Es la operación de Modificación del ABM. Frecuente en la realidad de una banda (cambios de horario, lugar, etc.).

**Independent Test**: Con un show existente, autenticarse, editar al menos un campo, guardar, y verificar que el cambio aparece en la vista pública.

**Acceptance Scenarios**:

1. **Given** que el administrador está en el listado de administración, **When** hace clic en "Editar" en la fila de un show, **Then** los valores de esa fila (venue, fecha/hora, ciudad, descripción, link) se convierten en inputs editables directamente en la misma fila; el botón "Editar" se reemplaza por "Guardar" y "Cancelar".
2. **Given** que la fila está en modo edición, **When** el administrador modifica los campos con valores válidos y hace clic en "Guardar", **Then** el show se actualiza en Firestore y la fila vuelve al modo de solo lectura mostrando los nuevos valores.
3. **Given** que la fila está en modo edición, **When** el administrador hace clic en "Cancelar", **Then** los inputs vuelven a los valores originales y la fila vuelve al modo de solo lectura sin llamar a Firestore.
4. **Given** que la fila está en modo edición, **When** el administrador intenta guardar con venue o fecha/hora vacíos, **Then** se muestran mensajes de validación inline en la fila sin realizar la llamada a Firestore.
5. **Given** que la actualización está en curso, **When** Firestore aún no respondió, **Then** el botón "Guardar" muestra un indicador de carga y queda deshabilitado.
6. **Given** que Firestore devuelve un error al actualizar, **When** la operación falla, **Then** se muestra un mensaje de error inline en la fila y los inputs conservan los valores que el administrador había ingresado.

---

### User Story 6 — Administrador elimina una fecha (Priority: P6)

Un administrador autenticado puede eliminar un show del calendario (por ejemplo, si el evento se cancela). El show desaparece inmediatamente de la vista pública.

**Why this priority**: Es la operación de Baja del ABM. Esencial para mantener el calendario limpio y actualizado.

**Independent Test**: Con un show existente, autenticarse, eliminar el show, y verificar que ya no aparece en el calendario público.

**Acceptance Scenarios**:

1. **Given** que el administrador está en el listado de administración, **When** hace clic en "Eliminar" en la fila de un show, **Then** el botón "Eliminar" es reemplazado inline por dos botones: "¿Confirmar?" y "Cancelar", sin abrir ningún modal ni diálogo externo.
2. **Given** que se muestran los botones de confirmación inline, **When** el administrador hace clic en "¿Confirmar?", **Then** el botón muestra un spinner breve y el show se elimina físicamente de Firestore; `onSnapshot` dispara y la fila desaparece del listado y del calendario público. No aparece ningún mensaje de texto adicional: la desaparición de la fila es el feedback de éxito.
3. **Given** que se muestran los botones de confirmación inline, **When** el administrador hace clic en "Cancelar", **Then** los botones vuelven al estado original ("Editar" / "Eliminar") y el show no se modifica.

4. **Given** que la eliminación está en curso tras confirmar, **When** Firestore aún no respondió, **Then** el botón "¿Confirmar?" muestra un indicador de carga y queda deshabilitado.
5. **Given** que Firestore devuelve un error al eliminar, **When** la operación falla, **Then** se muestra un mensaje de error inline en la fila y los botones vuelven al estado original ("Editar" / "Eliminar").

---

### User Story 7 — Administrador ve el listado completo de fechas (Priority: P4)

Un administrador autenticado puede ver todos los shows cargados en el sistema, incluidos los ya pasados, para tener visibilidad completa del historial y tomar decisiones de gestión.

**Why this priority**: P4 compartido con Alta — sin listado el ABM no es operable. Se combina con US4 para el MVP.

**Independent Test**: Autenticarse como administrador y verificar que la vista de administración muestra todos los shows (pasados y futuros) con controles de edición y eliminación.

**Acceptance Scenarios**:

1. **Given** que el administrador está autenticado, **When** accede a la vista de administración, **Then** ve el listado completo de shows ordenado cronológicamente descendente; cada fila muestra venue y fecha/hora formateada en español largo, con indicadores visuales (badges/íconos) para los campos opcionales que tienen valor, y botones "Editar" y "Eliminar".
2. **Given** que no hay shows cargados, **When** el administrador accede al listado, **Then** ve un mensaje del tipo "No hay fechas cargadas aún" y el botón "+ Agregar show" disponible.
3. **Given** que el listado está cargando, **When** Firestore aún no respondió, **Then** se muestra un indicador de carga.

---

### Edge Cases

- ¿Qué ocurre si el administrador intenta cargar un show con una fecha en el pasado? → El sistema lo permite (puede haber razones válidas para registrar shows históricos), pero puede mostrar una advertencia no bloqueante.
- ¿Qué pasa si el link a entradas no es una URL válida? → Validación en cliente: el campo acepta solo URLs bien formadas o estar vacío; se muestra error de validación antes de enviar a Firestore.
- ¿Qué sucede si dos administradores editan el mismo show simultáneamente? → Fuera de alcance v1; el último en guardar gana (comportamiento por defecto de Firestore).
- ¿Qué pasa si el campo `descripción` tiene contenido muy largo? → Límite de 500 caracteres validado en cliente; el campo muestra contador de caracteres restantes.
- ¿Puede el formulario de alta y una edición inline estar abiertos al mismo tiempo? → No; los modos son mutuamente excluyentes. Abrir el formulario de alta cancela (sin guardar) cualquier fila en edición. Hacer clic en "Editar" de una fila cierra el formulario de alta y cancela cualquier otra edición en curso.

---

## Requirements

### Functional Requirements

**Listado de administración:**

- **FR-016**: El sistema DEBE mostrar al administrador autenticado el listado completo de shows (pasados y futuros) ordenado **cronológicamente descendente** (`dateTime` descendente): los shows futuros y más próximos aparecen primero; los históricos al final. En modo lectura, cada fila muestra **venue** y **fecha/hora en formato español largo** (ej.: `"sábado 12 de julio de 2026 · 21:00 hs"`, mismo formato que la vista pública). Los campos opcionales (ciudad, descripción, link) se indican con un indicador visual (badge o ícono) solo cuando tienen valor; su contenido completo se expone únicamente al entrar en modo edición inline. Cada fila incluye botones "Editar" y "Eliminar".
- **FR-016b**: Los modos de la vista `/admin` son **mutuamente excluyentes**. Solo puede estar activo uno a la vez: `'listado'` (por defecto), `'alta'` (formulario visible) o `{ editando: showId }` (fila en edición). Activar un modo cancela silenciosamente el modo anterior sin guardar cambios parciales.

**Alta:**

- **FR-017**: El formulario de alta de show está **oculto por defecto**. La vista `/admin` muestra un botón "+ Agregar show"; al pulsarlo, el formulario aparece encima del listado y el botón desaparece. Al guardar exitosamente o cancelar, el formulario se oculta y el botón reaparece. Campos del formulario con sus labels visibles: **"Venue"** (obligatorio, `text`), **"Fecha y hora"** (obligatorio, `<input type="datetime-local">`), **"Ciudad"** (opcional, `text`), **"Descripción"** (opcional, `textarea`, máx. 500 caracteres), **"Link a entradas"** (opcional, `url`).
- **FR-018**: El sistema DEBE validar en cliente que venue y el campo `datetime-local` no estén vacíos antes de enviar a Firestore.
- **FR-019**: El sistema DEBE validar en cliente que el campo link, si se completa, sea una URL válida.

**Modificación:**

- **FR-020**: La edición de un show se realiza de forma **inline en la fila del listado**: al hacer clic en "Editar", los valores de la fila se convierten en inputs editables (venue `text`, fecha/hora `datetime-local` pre-poblado con la hora local del browser, ciudad `text`, descripción `textarea`, link `url`). El `Timestamp` de Firestore se convierte a string `YYYY-MM-DDTHH:mm` en zona horaria local con `timestamp.toDate()` formateado sin conversión UTC explícita. El botón "Editar" se reemplaza por "Guardar" y "Cancelar". No existe un formulario de edición separado ni un modal. Las validaciones son las mismas que el alta (FR-018, FR-019).

**Baja:**

- **FR-021**: El sistema DEBE implementar la confirmación de eliminación de forma inline en el listado: al hacer clic en "Eliminar", el botón se reemplaza por dos botones ("¿Confirmar?" y "Cancelar") en la misma fila del show. No se usa `window.confirm()` ni un componente modal externo.
- **FR-022**: La eliminación de un show DEBE ser física (borrado del documento en Firestore); no existe borrado lógico en v1.

**Transversal a todas las operaciones:**

- **FR-023**: Toda operación ABM DEBE guardar campos de auditoría:
  - **Alta** (`addDoc`): `createdAt: serverTimestamp()`, `createdBy: user.uid`.
  - **Modificación** (`updateDoc`): `updatedAt: serverTimestamp()`, `updatedBy: user.uid`.
  - `updatedAt` y `updatedBy` no se escriben al crear (solo existen tras la primera modificación).
- **FR-024**: Toda operación ABM DEBE reflejar en la UI los estados de carga y error de forma explícita mediante mensajes inline. El feedback de éxito difiere por operación:
  - **Carga** (todas las operaciones): el botón de acción muestra un indicador de carga y queda deshabilitado hasta recibir respuesta de Firestore.
  - **Éxito — Alta y Modificación**: un mensaje de texto (ej.: "Show guardado correctamente", "Show actualizado") aparece debajo del botón durante ~3 segundos, luego desaparece. No se usa toast/notificación global.
  - **Éxito — Baja**: no hay mensaje de texto adicional. El spinner en "¿Confirmar?" indica que la operación está en curso; la **desaparición de la fila** (disparada por `onSnapshot`) es el feedback visual inequívoco de éxito. No se intenta mostrar un mensaje en un elemento que ya no existe.
  - **Error** (todas las operaciones): un mensaje de error comprensible aparece inline y persiste hasta que el usuario interactúa nuevamente.
  - Ninguna operación puede ejecutarse en silencio sin feedback de carga o resultado.
- **FR-025**: Los cambios en el calendario (alta, modificación, baja) DEBEN reflejarse en tiempo real en la vista pública (`/shows`), sin necesidad de recargar la página manualmente.

---

## Success Criteria

- **SC-003**: Un administrador puede completar el flujo login → alta de show → verificación en vista pública en menos de 2 minutos.
- **SC-006**: Ninguna operación ABM (alta, baja, modificación) puede ejecutarse sin feedback visual explícito de carga, resultado de éxito o mensaje de error.

---

## Assumptions

- El servicio de shows (`showsService.js` o equivalente) encapsula todas las llamadas a Firestore; los componentes de UI consumen funciones (`crearShow()`, `actualizarShow()`, `eliminarShow()`) y no llaman al SDK de Firestore directamente, conforme al Principio V de la constitución.
- La suscripción al listado de administración se gestiona con un hook de React (`useAdminShows` o similar) que incluye limpieza del listener al desmontar.
- No existe paginación en v1; se asume que el volumen de shows no supera los cientos de registros.

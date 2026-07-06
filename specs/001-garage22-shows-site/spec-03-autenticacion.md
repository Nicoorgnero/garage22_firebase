# Spec 03 — Login de Administradores (Autenticación)

**Proyecto**: Sitio Web Oficial de Garage22
**Feature Branch**: `001-garage22-shows-site`
**Created**: 2026-07-06
**Status**: Draft

> **Índice del proyecto**: [`spec.md`](./spec.md)
> **Specs relacionadas**: [`spec-04-abm-shows.md`](./spec-04-abm-shows.md) — el login es el prerequisito para acceder al ABM. [`spec-05-seguridad-firebase.md`](./spec-05-seguridad-firebase.md) — las Firestore Rules usan `request.auth` para restringir escrituras.

---

## Descripción

La ruta `/admin` es la única ruta protegida del sistema. Cuando un usuario no autenticado la visita, se muestra el formulario de login directamente en esa misma ruta (no existe una ruta `/login` separada). Una vez que Firebase Authentication confirma las credenciales, el formulario desaparece y se renderiza la vista de administración del ABM — sin cambio de URL. El estado de sesión se gestiona globalmente mediante un hook/contexto de React que encapsula `onAuthStateChanged`. La vista `/admin` tiene un layout completamente independiente del sitio público: **no incluye la navbar pública** (`/` / `/shows`); solo muestra un botón de "Cerrar sesión" cuando hay sesión activa.

**Rutas del sistema:**
- `/` — Página informativa de la banda (biografía, integrantes, estilo musical, redes sociales)
- `/shows` — Calendario público de shows (accesible sin login)
- `/admin` — Muestra el formulario de login si no hay sesión activa; muestra la vista de administración si hay sesión activa

---

## User Scenarios & Testing

### User Story 3 — Administrador se autentica (Priority: P3)

Un administrador de la banda puede acceder a una pantalla de login, ingresar sus credenciales y autenticarse para acceder a las funciones de gestión del calendario.

**Why this priority**: Es el prerequisito obligatorio para todas las funciones de administración. Sin autenticación no existe ABM.

**Independent Test**: Navegar a `/admin` sin sesión, verificar que se muestra el formulario de login (no la vista de ABM). Ingresar credenciales válidas y verificar que el formulario es reemplazado por la vista de administración en la misma URL `/admin`.

**Acceptance Scenarios**:

1. **Given** que el administrador navega a `/admin` sin sesión activa, **When** se carga la ruta, **Then** ve el formulario de login con campos de email y contraseña (no la vista de ABM).
2. **Given** que el administrador completa el formulario con credenciales válidas y hace clic en "Ingresar", **When** Firebase Auth confirma la sesión, **Then** el formulario de login es reemplazado por la vista de administración del calendario en la misma URL `/admin`.
3. **Given** que el administrador ingresa credenciales inválidas, **When** hace clic en "Ingresar", **Then** ve un mensaje de error claro (ej.: "Credenciales incorrectas") y el formulario permanece visible.
4. **Given** que el formulario de login está enviando credenciales, **When** la respuesta aún no llegó, **Then** el botón de ingresar muestra un estado de carga y no puede presionarse dos veces.
5. **Given** que el administrador está autenticado y cierra sesión desde la vista de administración, **When** la sesión termina, **Then** la URL permanece en `/admin` pero la vista de ABM es reemplazada por el formulario de login.
6. **Given** que cualquier usuario navega a `/admin`, **When** `AuthContext` aún está resolviendo el estado de sesión (`loading === true`), **Then** se muestra un indicador de carga neutral (spinner) en lugar del formulario de login o la vista de ABM, hasta que Firebase confirme el estado.

### Edge Cases

- ¿Qué ocurre si la sesión del administrador expira mientras está editando un show? → Firebase Auth notifica el cambio vía `onAuthStateChanged`; el contexto de auth pasa a `user: null`, la ruta `/admin` reemplaza la vista de ABM por el formulario de login y el formulario en curso se pierde (comportamiento aceptable para v1).
- ¿Qué pasa si Firebase Authentication no está disponible temporalmente? → El formulario de login muestra un mensaje de error comprensible; no se expone ningún detalle técnico al usuario.
- ¿Puede un visitante "adivinar" la ruta `/admin`? → Sí puede acceder a la URL, pero el componente que decide qué renderizar en `/admin` lee el estado de sesión del contexto: si `loading`, muestra spinner; si `user === null`, muestra formulario de login; si `user` existe, muestra el ABM.
- ¿Qué pasa si `onAuthStateChanged` tarda más de lo esperado? → El spinner permanece hasta que Firebase responde. No hay timeout definido en v1; si Firebase nunca responde (sin conectividad), el spinner persiste indefinidamente (comportamiento aceptable para v1).

---

## Requirements

### Functional Requirements

- **FR-010**: El sistema DEBE proveer un formulario de login (campos email y contraseña) que use Firebase Authentication como único mecanismo de autenticación. El formulario se muestra en la ruta `/admin` cuando no hay sesión activa; no existe una ruta `/login` separada.
- **FR-011**: Un login exitoso DEBE hacer que el formulario de login sea reemplazado por la vista de administración del ABM en la misma URL `/admin`, sin cambio de ruta.
- **FR-012**: Un login fallido DEBE mostrar un mensaje de error comprensible en el formulario sin exponer detalles técnicos (no mostrar mensajes de error crudos de Firebase).
- **FR-013**: La ruta `/admin` DEBE renderizar el formulario de login cuando no hay sesión activa, y la vista de administración cuando sí la hay. El componente raíz de `/admin` decide qué mostrar según el estado de autenticación.
- **FR-014**: El administrador autenticado DEBE poder cerrar sesión desde la vista de administración mediante un botón de "Cerrar sesión" visible en el layout de `/admin`. La navbar pública NO aparece en `/admin`.
- **FR-015**: El sistema DEBE gestionar el estado de sesión con `onAuthStateChanged` encapsulado en un hook o contexto de React (`useAuth` / `AuthContext`), respetando el ciclo de vida de los componentes (suscripción en `useEffect` con limpieza/`unsubscribe`). El contexto DEBE exponer tres estados: `loading` (Firebase aún no resolvió la sesión), `user` (sesión activa) y `null` (sin sesión). Mientras `loading === true`, la ruta `/admin` muestra un indicador de carga neutral (spinner o similar) en lugar del formulario de login o la vista de ABM, evitando parpadeo (FOUC).

---

## Success Criteria

- **SC-005**: Un usuario no autenticado que navega a `/admin` ve el formulario de login (no la vista de ABM) y no tiene forma de activar ni ver controles de administración.

---

## Assumptions

- No existe registro de nuevos administradores desde la web; los administradores se crean manualmente en la consola de Firebase Authentication.
- Solo existe un rol de usuario: administrador. No hay roles diferenciados (ej.: editor vs. super-admin) en v1.
- El proveedor de autenticación es exclusivamente email/contraseña de Firebase Authentication; no se implementan proveedores OAuth (Google, GitHub, etc.) en v1.

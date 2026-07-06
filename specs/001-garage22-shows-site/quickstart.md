# Quickstart: Garage22 Shows Site

**Branch**: `001-garage22-shows-site` | **Date**: 2026-07-06 | **Plan**: [plan.md](./plan.md)

> Guía de validación end-to-end. Referencia al schema completo en [data-model.md](./data-model.md).

---

## Prerrequisitos

- Node.js ≥ 18, npm ≥ 9
- Proyecto Firebase creado en [console.firebase.google.com](https://console.firebase.google.com)
- Firestore habilitado (modo producción)
- Firebase Authentication con proveedor **Email/Password** activado
- Al menos 1 usuario administrador creado manualmente en Firebase Console (Authentication → Users → Add user)
- [Firebase CLI](https://firebase.google.com/docs/cli) instalado: `npm install -g firebase-tools`

---

## Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# → Editar .env con los valores del proyecto Firebase (ver Proyecto → Configuración → General)

# 3. Desplegar Firestore Rules
firebase login
firebase deploy --only firestore:rules

# 4. Iniciar servidor de desarrollo
npm run dev
# → http://localhost:5173
```

---

## Escenario 1 — Página informativa pública

**URL**: `http://localhost:5173/`

| Validación | Resultado esperado |
|---|---|
| Carga sin sesión | Hero visible con "GARAGE22" en tipografía display (Anton, uppercase) |
| Contenido | Biografía de la banda, integrantes y estilo musical visibles |
| Enlace Instagram | Abre cuenta de Garage22 en pestaña nueva |
| Enlace Spotify | Abre perfil de Garage22 en pestaña nueva |
| Sin controles de admin | No hay botones ni formularios de administración en la página |
| Navbar | Links "Inicio" y "Fechas" visibles; "Inicio" activo en `/` |
| Tape detail | Elemento visual "cinta adhesiva" visible en hero (CSS puro, sin imagen) |
| Responsive 375px | Hero y texto ajustados sin overflow horizontal; tipografía display escalada con `clamp()` |
| Foco de teclado | Tab navega entre Navbar links e Instagram/Spotify con outline visible |

---

## Escenario 2 — Calendario público

**URL**: `http://localhost:5173/fechas`

| Validación | Resultado esperado |
|---|---|
| Con fechas en Firestore | Se muestran solo fechas con `fechaHora ≥ now`, orden cronológico ascendente |
| Formato de fecha | "sábado 12 de julio de 2026 · 21:00 hs" — español largo, API nativa |
| Show con link a entradas | Enlace clicable ("Conseguir entradas" o similar) que abre en pestaña nueva |
| Show sin link a entradas | No aparece ningún enlace; la tarjeta no tiene elemento vacío |
| Estado vacío (sin fechas) | Mensaje con voz de banda, ej.: "Todavía no hay fechas confirmadas. Volvé pronto." |
| Estado cargando | Indicador de carga visible mientras llega el primer snapshot de Firestore |
| Estado error | Mensaje de error comprensible para el usuario; sin stack trace visible |
| Real-time alta | Alta de fecha en admin → aparece en `/fechas` sin recargar la página |
| Real-time baja | Baja de fecha en admin → desaparece de `/fechas` sin recargar la página |
| Navbar presente | Links "Inicio" y "Fechas" visibles; "Fechas" activo en `/fechas` |
| Tape detail en tarjeta | Elemento "cinta adhesiva" visible en las `TarjetaFecha` (con moderación) |
| Responsive 375px | Tarjetas en layout de columna única; día/mes grande legible en pantalla angosta |

---

## Escenario 3 — Login de administrador

**URL**: `http://localhost:5173/login`

| Validación | Resultado esperado |
|---|---|
| Sin sesión | Formulario de login visible: campo email, campo contraseña, botón "Ingresar" |
| Sin navbar pública | No se muestra la Navbar de `/` y `/fechas` en esta ruta |
| Credenciales válidas | Autenticación exitosa → redirige a `/admin` |
| Credenciales inválidas | Mensaje de error comprensible (ej.: "Credenciales incorrectas"); sin error crudo de Firebase |
| Submit en curso | Botón "Ingresar" deshabilitado + indicador de carga mientras Firebase responde |
| Ya autenticado | Navegar a `/login` con sesión activa redirige automáticamente a `/admin` |
| Foco de teclado | Tab navega entre email, contraseña y botón; Enter en el formulario lo envía |

---

## Escenario 4 — Panel de administración (ABM)

**URL**: `http://localhost:5173/admin` (requiere sesión activa)

### Acceso y estado inicial

| Validación | Resultado esperado |
|---|---|
| Sin sesión → intento directo | Navegar a `/admin` sin sesión redirige a `/login` |
| AuthContext cargando (`loading`) | Spinner visible mientras `onAuthStateChanged` resuelve el estado inicial |
| Con sesión activa | Vista de administración: listado de fechas + botón "+ Agregar fecha" |
| Sin navbar pública | No se muestra la Navbar de `/` y `/fechas` |
| Botón "Cerrar sesión" | Visible en el layout de `/admin` |

### Listado

| Validación | Resultado esperado |
|---|---|
| Orden | Cronológico descendente — fechas futuras/más próximas primero |
| Contenido de fila | Venue + fecha/hora en español largo; badges/íconos para campos opcionales con valor |
| Contenido completo | Ciudad, descripción y link solo visibles al entrar en modo edición inline |
| Sin fechas cargadas | Mensaje tipo "No hay fechas cargadas aún" + botón "+ Agregar fecha" disponible |
| Estado cargando | Indicador de carga mientras llega el primer snapshot |

### Alta de fecha

| Validación | Resultado esperado |
|---|---|
| Estado inicial | Formulario de alta **no** visible; solo el botón "+ Agregar fecha" |
| Clic en "+ Agregar fecha" | Formulario aparece encima del listado; botón desaparece |
| Labels del formulario | "Venue" (req.), "Fecha y hora" (req.), "Ciudad", "Descripción", "Link a entradas" |
| Guardar con campos válidos | Fecha en Firestore; formulario se oculta; nueva fecha en listado y en `/fechas` sin recargar |
| Guardar sin venue o fecha/hora | Mensajes de validación inline por campo; sin llamada a Firestore |
| Link con URL inválida | Mensaje de validación de URL; sin llamada a Firestore |
| Cancelar | Formulario se oculta; nada se crea en Firestore |
| Loading al guardar | Botón "Guardar" deshabilitado + indicador de carga mientras Firestore responde |
| Éxito | Mensaje inline (~3s): "Fecha guardada correctamente" antes de cerrar el formulario |
| Error Firestore | Mensaje de error inline; formulario conserva los datos ingresados |

### Modificación inline

| Validación | Resultado esperado |
|---|---|
| Clic en "Editar" | Fila convierte sus valores a inputs editables; botón reemplazado por "Guardar" y "Cancelar" |
| `datetime-local` pre-poblado | Hora local del browser (no UTC); el admin ve la hora argentina tal como fue ingresada |
| Guardar cambio válido | Firestore actualizado; fila vuelve a modo lectura con los nuevos valores |
| Guardar con venue vacío | Validación inline en la fila; sin llamada a Firestore |
| Cancelar | Fila vuelve a valores originales sin llamada a Firestore |
| Clic en "Editar" de otra fila | Fila anterior cancela silenciosamente (sin guardar); nueva fila entra en edición |
| Pulsar "+ Agregar fecha" durante edición | Edición cancela silenciosamente; formulario de alta aparece |
| Loading al guardar | Botón "Guardar" deshabilitado + indicador de carga |
| Éxito | Mensaje inline (~3s): "Show actualizado" en la fila |
| Error Firestore | Mensaje de error inline en la fila; inputs conservan los valores editados |

### Baja de fecha

| Validación | Resultado esperado |
|---|---|
| Clic en "Eliminar" | Botón reemplazado inline por "¿Confirmar?" y "Cancelar" (sin modal, sin `window.confirm()`) |
| Clic en "¿Confirmar?" | Spinner breve → fila desaparece del listado vía `onSnapshot`; sin mensaje de texto adicional |
| Fila desaparece en `/fechas` | La baja se propaga en tiempo real al calendario público |
| Clic en "Cancelar" | Botones vuelven a "Editar"/"Eliminar"; la fecha no se modifica en Firestore |
| Loading al confirmar | Botón "¿Confirmar?" deshabilitado + spinner mientras Firestore responde |
| Error Firestore al eliminar | Mensaje de error inline en la fila; fila permanece con botones "Editar"/"Eliminar" |

### Cierre de sesión

| Validación | Resultado esperado |
|---|---|
| Clic en "Cerrar sesión" | `signOut()` exitoso → `AuthContext` pasa a `user: null` → `ProtectedRoute` redirige a `/login` |

---

## Escenario 5 — Calidad base

| Validación | Herramienta / método |
|---|---|
| Responsive móvil (375px) | DevTools → viewport 375px; verificar `/`, `/fechas`, `/login`, `/admin` sin overflow |
| Foco de teclado visible | Tab por todos los elementos interactivos en las 4 rutas; outline claramente visible |
| Contraste WCAG AA | `#F2EDE4` sobre `#121110`: ratio ≥ 4.5:1 ✅. `#D9A441` sobre `#121110`: verificar con [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) |
| `prefers-reduced-motion` | DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`; hero y tarjetas sin animación |
| Firestore rules | Firebase Console → Firestore → Rules → Rules Playground: intento de `write` sin auth → rechazado |
| `.env.example` versionado | `git status`: `.env.example` tracked, `.env` untracked (en `.gitignore`) |
| Sin hardcode de keys | `grep -r "AIza\|apiKey" src/` → sin resultados |

# Research: Garage22 Shows Site

**Branch**: `001-garage22-shows-site` | **Date**: 2026-07-06 | **Plan**: [plan.md](./plan.md)

> Registro de decisiones técnicas y de diseño. Sin unknowns pendientes — todo el stack fue especificado explícitamente por el usuario en el input del plan.

---

## CSS Architecture

**Decisión**: CSS plain con custom properties centralizadas en `tokens.css` + `globals.css`. Sin CSS Modules, sin PostCSS adicional, sin Tailwind.

**Rationale**: El proyecto no usa librerías de UI externas y el equipo es un solo desarrollador. CSS Modules agrega fricción de tooling sin beneficio real a esta escala. Un único archivo de tokens (`tokens.css`) centraliza paleta, tipografía, sombras y espaciado; `globals.css` lo importa y define reset y estilos base. Scoping por nombre de componente (`FilaFechaAdmin`, `.tarjeta-fecha`, etc.) es suficiente para evitar colisiones.

**Alternativa descartada**: CSS Modules — más complejidad de importación, sin beneficio a esta escala.

---

## Tipografía

**Decisión**: `Anton` (display/títulos) + `Inter` (cuerpo/formularios), ambas cargadas via Google Fonts CDN con `<link rel="preconnect">` en `index.html`.

**Rationale**: Anton es la referencia canónica de tipografía condensada tipo afiche punk; disponible en Google Fonts, sin costo, amplio soporte de caracteres latinos. Inter es la sans-serif más legible y neutral para interfaces; ideal para texto de formularios y descripciones. El contraste entre el título "gritado" (Anton, uppercase) y el cuerpo "tranquilo" (Inter, regular) es parte de la identidad visual.

**Metadata / etiquetas** (fechas, ciudades, metadata de shows): Inter con `letter-spacing: 0.08em` y `font-variant-numeric: tabular-nums` — simula el look de sello/entrada sin necesitar una tercera familia tipográfica.

**Carga en `index.html`**:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

**Alternativa descartada**: Bebas Neue (también válida); self-hosting (más complejidad de setup para v1).

---

## tokens.css — Valores completos

```css
:root {
  /* ── Paleta ─────────────────────────────────────── */
  --color-bg:               #121110;  /* negro carbón — fondo base */
  --color-surface:          #221F1D;  /* gris oscuro cálido — cards, secciones */
  --color-accent:           #C6402F;  /* rojo garage — títulos, CTAs, links activos */
  --color-accent-secondary: #D9A441;  /* amarillo mostaza — hover, fechas destacadas */
  --color-text:             #F2EDE4;  /* blanco hueso — texto principal */
  --color-text-muted:       #8A8378;  /* gris piedra — metadata, texto secundario */

  /* ── Tipografía ──────────────────────────────────── */
  --font-display: 'Anton', sans-serif;
  --font-body:    'Inter', sans-serif;

  --text-xs:   0.75rem;   /* 12px — etiquetas muy pequeñas */
  --text-sm:   0.875rem;  /* 14px — metadata, badges */
  --text-base: 1rem;      /* 16px — cuerpo de texto */
  --text-lg:   1.125rem;  /* 18px — títulos de sección pequeños */
  --text-xl:   1.25rem;   /* 20px */
  --text-2xl:  1.5rem;    /* 24px — títulos de tarjeta */
  --text-4xl:  2.25rem;   /* 36px — títulos de sección */
  --text-hero: clamp(4rem, 12vw, 8rem);  /* "GARAGE22" — responsive */

  /* ── Sombras duras (sin blur, estética impresa) ──── */
  --shadow-hard:     4px 4px 0 var(--color-accent);
  --shadow-hard-alt: 4px 4px 0 var(--color-accent-secondary);
  --shadow-hard-sm:  2px 2px 0 var(--color-accent);
  --shadow-hard-dark:3px 3px 0 rgba(0,0,0,0.6);

  /* ── Bordes ──────────────────────────────────────── */
  --radius:          0;                               /* sin border-radius */
  --border:          2px solid var(--color-text);
  --border-accent:   2px solid var(--color-accent);
  --border-muted:    1px solid var(--color-text-muted);

  /* ── Espaciado ───────────────────────────────────── */
  --space-1:   0.25rem;
  --space-2:   0.5rem;
  --space-3:   0.75rem;
  --space-4:   1rem;
  --space-6:   1.5rem;
  --space-8:   2rem;
  --space-12:  3rem;
  --space-16:  4rem;
  --space-24:  6rem;

  /* ── Motion ──────────────────────────────────────── */
  --transition-base:  150ms ease;
  --transition-slow:  300ms ease;
}
```

---

## Elemento "Cinta Adhesiva" (tape detail)

**Decisión**: Pseudo-elemento CSS (`::before`) con `transform: rotate(-2deg)` y color `--color-accent-secondary` semi-transparente. Clase utilitaria `.tape-detail` aplicada con moderación en `TarjetaFecha` y `Hero` (máximo 2–3 puntos en todo el sitio).

```css
.tape-detail {
  position: relative;
}
.tape-detail::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%) rotate(-2deg);
  width: 64px;
  height: 20px;
  background: rgba(217, 164, 65, 0.4); /* --color-accent-secondary semi-transparente */
  z-index: 1;
  pointer-events: none;
}
```

**Rationale**: Cero assets externos, cero JS, puro CSS. El efecto "pegado" es el signature visual pedido.

---

## Animaciones / Motion

**Decisión**: CSS transitions + `@keyframes` para efectos de hover y reveal. `IntersectionObserver` (Web API nativa) para el scroll reveal de `TarjetaFecha`. Sin librería de animación.

**`prefers-reduced-motion`** (global en `globals.css`):
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Fade-in + slide-up del hero** (se ejecuta al montar `Hero.jsx`):
```css
@keyframes heroEntrance {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.hero { animation: heroEntrance 0.5s ease forwards; }
```

**Scroll reveal de tarjetas** (`Fechas.jsx` o hook `useIntersectionObserver`):
```css
.tarjeta-fecha { opacity: 0; transform: translateY(16px); transition: opacity 0.4s ease, transform 0.4s ease; }
.tarjeta-fecha.visible { opacity: 1; transform: translateY(0); }
```

**Hover en botones y links**:
```css
.btn { transition: background-color var(--transition-base), transform var(--transition-base); }
.btn:hover { transform: translate(-2px, -2px); box-shadow: var(--shadow-hard); }
```

---

## Protección de Rutas

**Decisión**: Componente `<ProtectedRoute>` que lee `{ loading, user }` de `AuthContext`. Si `loading`, muestra spinner. Si `!user`, redirige a `/login` con `<Navigate to="/login" replace />`. Si `user`, renderiza `children`.

```jsx
// src/components/ProtectedRoute.jsx
export function ProtectedRoute({ children }) {
  const { loading, user } = useAuthContext();
  if (loading) return <Spinner />;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
}
```

**Login page auto-redirect**: `Login.jsx` verifica al montar — si `user` existe, redirige a `/admin` inmediatamente (evita mostrar el formulario a alguien ya autenticado).

**Rationale**: Patrón estándar React Router v6; centraliza la lógica de auth guard en un único componente reutilizable.

---

## Conversión de Timestamps (Firestore ↔ `datetime-local`)

```js
// Alta: valor del input → Timestamp de Firestore
import { Timestamp } from 'firebase/firestore';
const timestamp = Timestamp.fromDate(new Date(inputValue)); // inputValue = "YYYY-MM-DDTHH:mm"

// Edición: Timestamp de Firestore → valor del input (hora LOCAL del browser, no UTC)
const pad = n => String(n).padStart(2, '0');
const d = timestamp.toDate();
const localValue = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
// inputValue = localValue  →  el admin ve la hora argentina tal como fue ingresada
```

**Rationale**: `toISOString()` devuelve UTC, lo que desplazaría la hora para admins en zona ART (UTC-3). Usar `getHours()` / `getMinutes()` asegura que el input muestra la hora local.

---

## Formateo de Fechas (vista pública y admin)

```js
// "sábado 12 de julio de 2026 · 21:00 hs"
const fecha = timestamp.toDate();
const dia  = fecha.toLocaleDateString('es-AR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
});
const hora = fecha.toLocaleTimeString('es-AR', {
  hour: '2-digit', minute: '2-digit'
});
const formatted = `${dia} · ${hora} hs`;
```

Sin librerías externas. Capitalizar el primer carácter si `toLocaleDateString` devuelve minúscula: `dia.charAt(0).toUpperCase() + dia.slice(1)`.

---

## Estado Admin: modelo de modo

```js
// src/pages/Admin.jsx (o hook useAdminMode)
const [modo, setModo] = useState('listado');
// Valores:
//   'listado'          — estado por defecto
//   'alta'             — formulario de alta visible
//   { editando: id }   — fila `id` en edición inline

// Transición a modo alta (cancela edición en curso):
const abrirAlta    = () => setModo('alta');
// Transición a edición de fila (cancela alta o edición previa):
const editarFecha  = (id) => setModo({ editando: id });
// Volver a listado (guardar exitoso, cancelar, baja):
const volverLista  = () => setModo('listado');
```

Los modos son mutuamente excluyentes. Activar uno cancela el anterior sin guardar cambios parciales (FR-016b).

---

## Firebase SDK versión

**Decisión**: Firebase SDK ^10 (API modular — tree-shakeable).

```js
// src/services/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getFirestore }  from 'firebase/firestore';
import { getAuth }       from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app  = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);
```

**Alternativa descartada**: API compat (v8-compatible) — en modo mantenimiento; no tree-shakeable.

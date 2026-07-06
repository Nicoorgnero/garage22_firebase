# Implementation Plan: Garage22 Shows Site

**Branch**: `001-garage22-shows-site` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Especificación funcional de 5 sub-specs + directrices visuales y arquitectónicas explícitas provistas al invocar `/speckit.plan`.

---

## Summary

SPA React+Vite para el sitio oficial de Garage22. Tres bloques funcionales: página informativa estática con identidad de banda under, calendario de fechas en tiempo real via Firestore `onSnapshot`, y panel de administración protegido con Firebase Authentication (email/password). Estética de garage rock: paleta oscura, tipografía condensada tipo afiche punk (Anton + Inter), sombras CSS duras, detalle de "cinta adhesiva" en CSS puro. Sin librerías de UI externas; CSS propio con design tokens. Firebase como único BaaS; sin backend propio.

---

## Technical Context

| Campo | Valor |
|---|---|
| **Lenguaje** | JavaScript (ES2022+), React 18 (componentes funcionales, hooks, Context API) |
| **Build tool** | Vite 5 (`npm create vite@latest`); env vars prefijo `VITE_*`, acceso via `import.meta.env` |
| **Dependencias** | `react` ^18, `react-dom` ^18, `react-router-dom` ^6, `firebase` ^10 (SDK modular) |
| **Storage** | Cloud Firestore — colección `fechas` |
| **Auth** | Firebase Authentication — email/password; sin registro público |
| **Testing** | N/A en v1 (fuera de alcance declarado) |
| **Plataforma** | Navegadores modernos (Chrome, Firefox, Safari, Edge); responsive ≥ 375px |
| **Tipo** | SPA — despliegue estático (build de Vite + Firebase BaaS) |
| **Performance** | FCP < 2s en conexión típica; propagación Firestore → UI < 1s via `onSnapshot` |
| **Constraints** | `prefers-reduced-motion` respetado; contraste WCAG AA en toda la paleta; sin JS vanilla directo al SDK de Firebase |
| **Escala** | 1–3 administradores, decenas a centenares de fechas |

---

## Divergencias respecto a specs previas

Las decisiones del usuario en este plan difieren de resoluciones previas en las clarificaciones. **Las specs afectadas deben actualizarse para alinearse — puede hacerse como tarea en `/speckit.tasks` o manualmente antes de implementar.**

| Spec previa dice | Este plan adopta | Specs afectadas |
|---|---|---|
| Ruta pública del calendario: `/shows` | `/fechas` | spec-02, spec.md (tabla de rutas), Navbar |
| Colección Firestore: `shows` | `fechas` | spec-04, spec-05 |
| Sin ruta `/login` separada (login inline en `/admin`) | Ruta `/login` independiente; `/admin` redirige si sin sesión | spec-03, AuthContext, ProtectedRoute |
| Nombres de campos en inglés: `venue`, `dateTime`, `city`, `ticketUrl` | Nombres en español: `lugar`, `fechaHora`, `ciudad`, `linkEntradas` | spec-04, spec-05, data-model.md |

---

## Constitution Check

*GATE pre-diseño. Principios derivados de las specs del proyecto Garage22 (el `Principio V` referenciado en las specs corresponde a la constitución del proyecto, no a la constitución Spec Kit CLI actualmente en `.specify/memory/`).*

| Principio | Verificación | Estado |
|---|---|---|
| **Firebase exclusivamente via React** (Principio V del proyecto) | `initializeApp` una única vez en `src/services/firebase/config.js`; toda interacción con Firebase via hooks (`useAuth`, `useFechas`) y servicio (`fechasService.js`); cero llamadas al SDK directamente en componentes de UI | ✅ Requerido |
| **Sin dependencias de UI externas** | Sin MUI, Chakra, shadcn, Bootstrap ni date-picker externo; tipografías via Google Fonts CDN (`<link>` en `index.html`); sin librería de animaciones | ✅ Requerido |
| **Limpieza de listeners** | `onAuthStateChanged` con `unsubscribe` en cleanup de `useEffect` en `useAuth`; `onSnapshot` con unsubscribe en `useFechas` | ✅ Requerido (FR-015, spec-02 Assumptions) |
| **Variables de entorno** | Sin hardcode de claves Firebase; todo via `import.meta.env.VITE_FIREBASE_*`; `.env.example` versionado en repo | ✅ Requerido (FR-028) |
| **Firestore Rules como barrera real** | `allow read: if true`; `allow create,update,delete: if request.auth != null`; `firestore.rules` versionado en repo | ✅ Requerido (FR-026, FR-027) |
| **Responsive y accesibilidad** | Responsive hasta 375px; foco de teclado visible en todos los interactivos (incluyendo panel admin); contraste WCAG AA en paleta definida | ✅ Requerido (input del plan) |
| **`prefers-reduced-motion`** | Todas las animaciones CSS y reveals via IntersectionObserver desactivados cuando el sistema operativo del usuario lo tiene configurado | ✅ Requerido (input del plan) |

*Sin violaciones detectadas. No hay sección de Complexity Tracking requerida.*

---

## Project Structure

### Documentación (esta feature)

```text
specs/001-garage22-shows-site/
├── spec.md
├── spec-01-pagina-informativa.md
├── spec-02-calendario-publico.md
├── spec-03-autenticacion.md
├── spec-04-abm-shows.md
├── spec-05-seguridad-firebase.md
├── plan.md               ← este archivo
├── research.md           ← Phase 0: decisiones técnicas y visuales
├── data-model.md         ← Phase 1: schema Firestore + contratos de UI
├── quickstart.md         ← Phase 1: guía de validación end-to-end
├── checklists/
│   ├── requirements.md
│   └── abm.md
└── tasks.md              ← generado por /speckit.tasks (pendiente)
```

### Código fuente

```text
[project-root]/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Barra de navegación pública (/, /fechas)
│   │   ├── Footer.jsx           # Footer con iconos Instagram + Spotify
│   │   ├── PublicLayout.jsx     # Wrapper layout público: <Navbar> + <Outlet> + <Footer>
│   │   ├── Hero.jsx             # Hero de Home: "GARAGE22" en display font + tape detail
│   │   ├── TarjetaFecha.jsx     # Tarjeta de fecha en el calendario público (estilo flyer)
│   │   ├── BotonSello.jsx       # Botón reutilizable estilo "sello/stamp"
│   │   ├── FormularioFecha.jsx  # Formulario de alta en admin (togglable, encima del listado)
│   │   ├── FilaFechaAdmin.jsx   # Fila del listado admin (lectura / edición inline / baja)
│   │   └── ProtectedRoute.jsx   # HOC: spinner si loading; redirect a /login si !user
│   ├── pages/
│   │   ├── Home.jsx             # "/" — página informativa (hero, bio, integrantes, redes)
│   │   ├── Fechas.jsx           # "/fechas" — calendario público
│   │   ├── Login.jsx            # "/login" — formulario de autenticación
│   │   └── Admin.jsx            # "/admin" — panel ABM (protegido vía ProtectedRoute)
│   ├── hooks/
│   │   ├── useAuth.js           # onAuthStateChanged → expone { loading, user }
│   │   └── useFechas.js         # onSnapshot colección fechas (modo público y admin)
│   ├── services/firebase/
│   │   ├── config.js            # initializeApp (una vez); exports: db, auth
│   │   └── fechasService.js     # crearFecha(), actualizarFecha(), eliminarFecha()
│   ├── context/
│   │   └── AuthContext.jsx      # AuthProvider + useAuthContext()
│   ├── styles/
│   │   ├── tokens.css           # CSS custom properties: paleta, tipografía, sombras, spacing
│   │   └── globals.css          # Reset, @import de tokens, fuentes, estilos base
│   └── main.jsx                 # Entrada: monta <AuthProvider> + <BrowserRouter> + <Routes>
├── firestore.rules
├── .env.example
├── .env                         # gitignored
├── index.html
├── vite.config.js
└── package.json
```

**Decisión de estructura**: SPA con public layout (React Router v6 nested routes con `<Outlet>`) para `/` y `/fechas`, y layout admin independiente para `/login` y `/admin`. `<ProtectedRoute>` gestiona la redirección a `/login` cuando no hay sesión activa.

**Árbol de rutas (`main.jsx` o `App.jsx`):**

```jsx
<BrowserRouter>
  <Routes>
    <Route element={<PublicLayout />}>
      <Route path="/"       element={<Home />} />
      <Route path="/fechas" element={<Fechas />} />
    </Route>
    <Route path="/login" element={<Login />} />
    <Route path="/admin" element={
      <ProtectedRoute>
        <Admin />
      </ProtectedRoute>
    } />
  </Routes>
</BrowserRouter>
```

---

## Design Tokens — Resumen

Ver `research.md` para los valores CSS completos de `tokens.css`.

| Token | Valor |
|---|---|
| `--color-bg` | `#121110` — negro carbón (fondo base) |
| `--color-surface` | `#221F1D` — gris oscuro cálido (cards, secciones) |
| `--color-accent` | `#C6402F` — rojo garage (títulos, CTAs, links activos) |
| `--color-accent-secondary` | `#D9A441` — amarillo mostaza envejecido (hover, fechas destacadas) |
| `--color-text` | `#F2EDE4` — blanco hueso (texto principal) |
| `--color-text-muted` | `#8A8378` — gris piedra (texto secundario/metadata) |
| `--font-display` | `'Anton', sans-serif` (Google Fonts) — títulos, hero |
| `--font-body` | `'Inter', sans-serif` (Google Fonts) — cuerpo, formularios |
| `--shadow-hard` | `4px 4px 0 var(--color-accent)` — sombra dura, sin blur |
| `--radius` | `0` — sin border-radius, estética impresa |

---

## Artefactos Generados

| Archivo | Estado |
|---|---|
| `plan.md` | ✅ Este archivo |
| `research.md` | ✅ Generado (Phase 0) |
| `data-model.md` | ✅ Generado (Phase 1) |
| `quickstart.md` | ✅ Generado (Phase 1) |
| `tasks.md` | ⏳ Pendiente — ejecutar `/speckit.tasks` |

# Tasks: Garage22 Shows Site

**Branch**: `001-garage22-shows-site` | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Data Model**: [data-model.md](./data-model.md)

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · quickstart.md ✅

**Tests**: No test tasks — not requested in spec.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: User story label — US1–US6 (US4 and US7 share a phase at P4)
- Exact file paths included in all descriptions

---

## Phase 1: Setup

**Purpose**: Project initialization, dependencies, folder structure, environment config.

- [ ] T001 Create Vite + React project at project root: `npm create vite@latest garage22 -- --template react`; accept defaults
- [ ] T002 Install runtime dependencies: `npm install react-router-dom firebase` inside the project root
- [ ] T003 [P] Create full folder structure per plan.md: `src/components/`, `src/pages/`, `src/hooks/`, `src/services/firebase/`, `src/context/`, `src/styles/`, `src/config/`
- [ ] T004 [P] Add Google Fonts `<link rel="preconnect">` + stylesheet link for Anton and Inter (400/500/600) to `index.html` per research.md
- [ ] T005 [P] Create `.env.example` with all six `VITE_FIREBASE_*` keys (empty values) per data-model.md; add `.env` entry to `.gitignore`

**Checkpoint**: `npm run dev` serves the default Vite React page; folder structure matches plan.md.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Design system, Firebase wiring, auth context, router skeleton, and shared UI primitives. Nothing in Phases 3–8 can begin until this phase is complete.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T006 Create `src/styles/tokens.css` — complete CSS custom properties: 6-color palette, `--font-display`/`--font-body`, text scale (`--text-xs` → `--text-hero` with `clamp()`), hard-shadow variants, `--radius: 0`, border tokens, spacing scale, motion variables per research.md
- [ ] T007 Create `src/styles/globals.css` — `@import './tokens.css'`; CSS reset (`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`); `body` base styles using `var(--color-bg)`, `var(--color-text)`, `var(--font-body)`; `@media (prefers-reduced-motion: reduce)` global override (disables all animations/transitions) per research.md; import `globals.css` in `src/main.jsx`
- [ ] T008 [P] Create `src/services/firebase/config.js` — `initializeApp` with all six `import.meta.env.VITE_FIREBASE_*` config values; export `db = getFirestore(app)` and `auth = getAuth(app)`; single initialization (never called twice) per research.md
- [ ] T009 [P] Create `firestore.rules` at project root — `allow read: if true` and `allow create, update, delete: if request.auth != null` scoped to `match /fechas/{fechaId}` per data-model.md
- [ ] T010 Create `src/hooks/useAuth.js` — calls `onAuthStateChanged(auth, callback)` in a `useEffect` with `unsubscribe` cleanup; manages `loading` (true until first Firebase response) and `user` (User or null) in local state; returns `{ loading, user }`
- [ ] T011 Create `src/context/AuthContext.jsx` — creates React context; `AuthProvider` component uses `useAuth()` and provides `{ loading, user }` to the tree; exports `useAuthContext()` convenience hook that throws if used outside provider; wrap `<App>` or `<BrowserRouter>` with `<AuthProvider>` in `src/main.jsx`
- [ ] T012 [P] Create `src/components/ProtectedRoute.jsx` — reads `useAuthContext()`; if `loading` renders `<Spinner />`; if `!user` returns `<Navigate to="/login" replace />`; else renders `children`
- [ ] T013 [P] Create `src/components/Spinner.jsx` — neutral CSS loading indicator (single rotating ring or three pulsing dots); styled with `var(--color-text-muted)` and `var(--color-accent)`; respects `prefers-reduced-motion` via global override
- [ ] T014 [P] Create `src/components/Navbar.jsx` — `<NavLink>` to `/` ("Inicio") and `/fechas` ("Fechas"); active link gets `var(--color-accent)` color via `.active` class; background `var(--color-surface)`; full-width; keyboard-accessible
- [ ] T015 [P] Create `src/components/Footer.jsx` — Instagram and Spotify `<a>` links (`target="_blank" rel="noopener noreferrer"`); styled with band character; uses `var(--color-surface)` background and `var(--color-text-muted)` text; NOT a generic 5-column footer
- [ ] T016 [P] Create `src/components/PublicLayout.jsx` — renders `<Navbar />` + `<Outlet />` + `<Footer />`; no extra wrapper styles beyond flex-column layout
- [ ] T017 Create `src/main.jsx` — mounts `<AuthProvider>` wrapping `<BrowserRouter>` + `<Routes>`: `<Route element={<PublicLayout />}>` wrapping `path="/"` (`<Home />`) and `path="/fechas"` (`<Fechas />`); `path="/login"` standalone (`<Login />`); `path="/admin"` wrapped in `<ProtectedRoute>` (`<Admin />`) per plan.md route tree; imports `src/styles/globals.css`
- [ ] T018 [P] Create `src/components/BotonSello.jsx` — reusable `<button>` or `<a>` styled as a "sello/stamp": `var(--color-accent)` border, `var(--shadow-hard)` hard box-shadow, `var(--radius): 0`, uppercase `var(--font-body)` with tracking; hover → `translate(-2px, -2px)` + updated shadow; accepts `as` prop (`'button'`/`'a'`), `href`, `target`, `onClick`, `disabled`, `loading` (bool, shows inline spinner)

**Checkpoint**: `npm run dev` → React app loads; navigating to `/`, `/fechas`, `/login` shows placeholder pages with Navbar + Footer on public routes; `/admin` redirects to `/login`; `AuthContext` resolves without error.

---

## Phase 3: US1 — Visitante descubre la banda (Priority: P1) 🎯 MVP

**Goal**: Any visitor can read band info (bio, members, style) and open Instagram / Spotify without logging in.

**Independent Test**: Open `/` without session → GARAGE22 hero visible, biography/members/style text visible, two external links open in new tab, no admin controls anywhere on the page. (quickstart.md Escenario 1)

### Implementation for US1

- [ ] T019 [P] [US1] Create `src/config/bandConfig.js` — exports `INSTAGRAM_URL` and `SPOTIFY_URL` as hardcoded string constants; single source of truth for external links
- [ ] T020 [P] [US1] Create `src/components/Hero.jsx` — "GARAGE22" heading in `var(--font-display)`, uppercase, `var(--text-hero)` (`clamp(4rem, 12vw, 8rem)`), `var(--color-accent)`; `.tape-detail` applied (CSS `::before` pseudo-element with semi-transparent `var(--color-accent-secondary)`, rotated ~−2deg, no image); `heroEntrance` keyframe (opacity 0→1, translateY 20px→0, 0.5s) per research.md; separate `Hero.css` colocated in `src/components/`
- [ ] T021 [US1] Create `src/pages/Home.jsx` — renders `<Hero>`; biography section (band copy with own voice — ironic, informal, not corporate); integrantes section; estilo musical section; social links section with `<BotonSello as="a">` for Instagram and Spotify using `INSTAGRAM_URL`/`SPOTIFY_URL` from bandConfig.js; separate `Home.css` in `src/pages/` using paleta tokens, no admin elements

**Checkpoint**: Navigate to `/` → GARAGE22 hero with tape detail, bio/members/style text, Instagram and Spotify buttons open new tabs. No login/admin UI visible. Responsive at 375px.

---

## Phase 4: US2 — Visitante consulta el calendario (Priority: P2)

**Goal**: Any visitor can see upcoming shows as flyer cards without logging in. Updates propagate in real time via Firestore `onSnapshot`.

**Independent Test**: With ≥1 document in `fechas` collection, open `/fechas` → show card visible with Spanish long-format date. Add/delete a document in Firebase Console → change appears/disappears without page reload. With no documents → band-voice empty message. (quickstart.md Escenario 2)

### Implementation for US2

- [ ] T022 [P] [US2] Create `src/hooks/useFechas.js` — public mode: `onSnapshot` query on collection `fechas` with `where('fechaHora', '>=', Timestamp.now())` + `orderBy('fechaHora', 'asc')`; sets `fechas`, `loading`, `error` state; `unsubscribe` cleanup in `useEffect` return; exports default `useFechas()`
- [ ] T023 [P] [US2] Create `src/components/TarjetaFecha.jsx` — flyer-card layout: day/month number large on left in `var(--font-display)` + `var(--color-accent-secondary)`; venue name and city right; formatted date string ("sábado 12 de julio de 2026 · 21:00 hs" via `toLocaleDateString('es-AR', ...)` + `toLocaleTimeString('es-AR', ...)` per research.md); description if present; `<BotonSello as="a">` for `linkEntradas` if present; `.tape-detail` on card; `var(--color-surface)` background; `var(--shadow-hard)` shadow
- [ ] T024 [P] [US2] Create `src/components/TarjetaFecha.css` — card styles: `var(--color-surface)` bg, `var(--shadow-hard)` shadow, `var(--radius): 0`, day column vs content column flex layout, responsive single-column below 500px
- [ ] T025 [US2] Create `src/pages/Fechas.jsx` — calls `useFechas()`; renders: `<Spinner>` while `loading`; band-voice empty message ("Todavía no hay fechas confirmadas. Volvé pronto.") when `!loading && fechas.length === 0`; user-friendly error message (no stack trace) when `error`; `<TarjetaFecha>` list when data available; `IntersectionObserver` scroll reveal — each `<TarjetaFecha>` gets `.visible` class when entering viewport (ref callback pattern)
- [ ] T026 [P] [US2] Create `src/pages/Fechas.css` — grid/list container; `.tarjeta-fecha` initial state (`opacity: 0; transform: translateY(16px); transition: opacity 0.4s ease, transform 0.4s ease`); `.tarjeta-fecha.visible` state (`opacity: 1; transform: translateY(0)`)

**Checkpoint**: Navigate to `/fechas` → flyer cards with Spanish date format; empty-state message has band voice; Firestore change propagates without reload. Navbar present. Responsive at 375px.

---

## Phase 5: US3 — Administrador se autentica (Priority: P3)

**Goal**: Admin logs in at `/login` with email/password and lands on `/admin`. Unauthenticated access to `/admin` redirects to `/login`. Spinner while `AuthContext` resolves.

**Independent Test**: Navigate to `/admin` without session → redirect to `/login`. Submit valid credentials → redirect to `/admin`. Submit invalid credentials → inline user-friendly error, form stays. (quickstart.md Escenario 3)

### Implementation for US3

- [ ] T027 [P] [US3] Create `src/pages/Login.css` — independent admin layout (no Navbar styling); form centered vertically and horizontally; field + label styles using paleta tokens; error message style (`var(--color-accent)` text); submit button disabled + spinner-inline style
- [ ] T028 [US3] Create `src/pages/Login.jsx` — controlled form with email + password fields; calls `signInWithEmailAndPassword(auth, email, password)` on submit; `loading` state disables button and shows inline `<Spinner>` inside it; on success → `navigate('/admin', { replace: true })`; on Firebase error → map to user-friendly message ("Credenciales incorrectas" for `auth/wrong-password`/`auth/user-not-found`, "Error de conexión" for network errors, never raw Firebase message); if `useAuthContext().user` exists on mount → `<Navigate to="/admin" replace />`; no public `<Navbar>` in this page's layout

**Checkpoint**: Navigate to `/login` — no Navbar, form visible. Valid credentials → `/admin`. Invalid → friendly error. Already logged in → auto-redirect to `/admin`. Keyboard Tab works through form fields.

---

## Phase 6: US4 + US7 — Admin ve el listado y agrega fechas (Priority: P4)

**Goal**: Authenticated admin sees all shows in descending order with edit/delete buttons. Can add a new show via a toggleable form above the list; show appears in list and in `/fechas` in real time.

**Independent Test**: Log in → `/admin` shows all dates descending. Click "+ Agregar fecha", fill required fields, save → success message ~3s, form closes, new date in list. Navigate to `/fechas` → new date appears without reload. (quickstart.md Escenario 4 — Alta and Listado sections)

### Implementation for US4 + US7

- [ ] T029 [P] [US4] Create `src/hooks/useAdminFechas.js` — `onSnapshot` on collection `fechas` with `orderBy('fechaHora', 'desc')` (no date filter — shows past and future); returns `{ fechas, loading, error }`; `unsubscribe` cleanup in `useEffect` return
- [ ] T030 [P] [US4] Create `src/services/firebase/fechasService.js` — `crearFecha(data, userId)`: `addDoc(collection(db,'fechas'), { ...data, createdAt: serverTimestamp(), createdBy: userId })`; `actualizarFecha(id, data, userId)`: `updateDoc(doc(db,'fechas',id), { ...data, updatedAt: serverTimestamp(), updatedBy: userId })`; `eliminarFecha(id)`: `deleteDoc(doc(db,'fechas',id))`; all three are async, throw on error
- [ ] T031 [P] [US4] Create `src/components/FormularioFecha.jsx` — controlled fields: "Venue" (required, text), "Fecha y hora" (required, `datetime-local`), "Ciudad" (optional, text), "Descripción" (optional, textarea, `maxLength={500}` with remaining-char counter), "Link a entradas" (optional, url); client-side validation: venue + fechaHora non-empty before any Firestore call, linkEntradas is valid URL if filled (regex or `new URL()` check); on submit: calls `crearFecha(data, user.uid)` from fechasService; `loading` state disables button + shows inline spinner; on success: shows "Fecha guardada correctamente" inline ~3s then calls `onSuccess()` prop; on error: shows inline user-friendly error, keeps form data; "Cancelar" button calls `onCancel()` prop immediately
- [ ] T032 [P] [US4] Create `src/components/FormularioFecha.css` — form layout using paleta tokens; field labels in `var(--font-body)`; required field indicator; char counter style for descripcion; error/success inline message styles; Guardar + Cancelar button row
- [ ] T033 [P] [US7] Create `src/components/FilaFechaAdmin.jsx` — READ mode only (edit and delete modes added in Phases 7–8): displays `lugar` + `fechaHora` formatted in Spanish long format per research.md; visual badges/icons for optional fields (`ciudad`, `descripcion`, `linkEntradas`) that have a value (badge shows presence, not content); "Editar" button calls `onEditar(fecha.id)` prop; "Eliminar" button calls `onEliminar(fecha.id)` prop; accepts `fecha`, `modo`, `onEditar`, `onEliminar` props
- [ ] T034 [P] [US7] Create `src/components/FilaFechaAdmin.css` — row layout; venue + date column; optional fields badge strip; Editar/Eliminar button styles using paleta tokens; `var(--color-surface)` background; hard border bottom between rows
- [ ] T035 [US4] Create `src/pages/Admin.jsx` — `modo` state (`'listado' | 'alta' | { editando: string }`); `useAdminFechas()` for list data; `useAuthContext()` for `user`; renders: "Cerrar sesión" `<BotonSello>` calling `signOut(auth)` (top of layout); "+ Agregar fecha" `<BotonSello>` hidden when `modo === 'alta'`; `<FormularioFecha>` visible when `modo === 'alta'` with `onSuccess={() => setModo('listado')}` and `onCancel={() => setModo('listado')}`; `<Spinner>` when `loading`; empty-state message ("No hay fechas cargadas aún") when `!loading && fechas.length === 0`; list of `<FilaFechaAdmin>` with `onEditar={id => setModo({ editando: id })}` and `onEliminar` (wired in Phase 8); mode mutual exclusion: `abrirAlta` calls `setModo('alta')`, `editarFecha(id)` calls `setModo({ editando: id })` — each overwrites the previous mode
- [ ] T036 [P] [US7] Create `src/pages/Admin.css` — admin layout: "Cerrar sesión" top-right; "+ Agregar fecha" button above list; form/list stack; using paleta tokens; no public Navbar styling

**Checkpoint**: Log in → `/admin` shows all dates descending, each row with Editar/Eliminar buttons. Click "+ Agregar fecha" → form appears, button hides. Fill venue + date, save → success message, form closes, date in list and in `/fechas`. Click Cancelar → form closes, nothing created.

---

## Phase 7: US5 — Administrador edita una fecha (Priority: P5)

**Goal**: Admin edits any show inline in the list row. `fechaHora` pre-populated in local timezone. Changes persist to Firestore and propagate in real time.

**Independent Test**: Click "Editar" on row A → row A fields become inputs. Click "Editar" on row B → row A reverts silently, row B becomes editable. Modify venue in row B, save → row B shows new value; navigate to `/fechas` → update visible without reload. (quickstart.md Escenario 4 — Modificación section)

### Implementation for US5

- [ ] T037 [US5] Extend `src/components/FilaFechaAdmin.jsx` with EDIT inline mode — when `modo.editando === fecha.id`: render controlled inputs for all five fields; pre-populate `fechaHora` input as `YYYY-MM-DDTHH:mm` in local timezone using `timestamp.toDate()` + manual `getFullYear`/`getMonth`/`getDate`/`getHours`/`getMinutes` formatting (NOT `toISOString()`) per research.md; "Guardar" calls `actualizarFecha(fecha.id, data, user.uid)`; `loading` state disables Guardar + shows inline spinner; on success: shows "Show actualizado" inline ~3s then calls `onGuardado()` prop; "Cancelar" calls `onCancelar()` prop; client-side validation: same rules as FormularioFecha (required venue + fechaHora, valid URL if linkEntradas filled); inline error on Firestore failure (keeps edited values)
- [ ] T038 [US5] Wire edit mode in `src/pages/Admin.jsx` — pass `user` down to `<FilaFechaAdmin>` as prop; update `onEditar` to `id => setModo({ editando: id })`; add `onGuardado={() => setModo('listado')}` and `onCancelar={() => setModo('listado')}` props to `<FilaFechaAdmin>`; add `onEliminar` placeholder for Phase 8; verify that `abrirAlta()` while `{ editando: id }` is active silently cancels edit (already handled by `setModo('alta')` overwrite)

**Checkpoint**: Click Editar → row becomes editable with local-timezone date. Modify venue. Save → "Show actualizado" message, row returns to read mode with new values. `/fechas` updates in real time. Clicking Editar on another row while one is open silently closes the first.

---

## Phase 8: US6 — Administrador elimina una fecha (Priority: P6)

**Goal**: Admin deletes a show with inline confirmation (no modal, no `window.confirm()`). Row disappears via `onSnapshot` as the success feedback — no additional text message.

**Independent Test**: Click "Eliminar" → "¿Confirmar?" and "Cancelar" appear inline. Click "¿Confirmar?" → spinner, row disappears from admin list and from `/fechas`. Click "Cancelar" → original buttons restored, date unchanged. (quickstart.md Escenario 4 — Baja section)

### Implementation for US6

- [ ] T039 [US6] Extend `src/components/FilaFechaAdmin.jsx` with DELETE confirmation mode — local `isConfirming` boolean state (not in parent's `modo`); "Eliminar" button sets `isConfirming = true` (replaces Editar/Eliminar with "¿Confirmar?" + "Cancelar" inline — no modal, no `window.confirm()`); "¿Confirmar?" calls `eliminarFecha(fecha.id)` from fechasService, shows `loading` spinner on the button and disables it; on Firestore success: `onSnapshot` removes the row — no text message is shown (row disappearance IS the success feedback per FR-024); on Firestore error: inline error message in the row, `isConfirming = false`, buttons revert to Editar/Eliminar; "Cancelar" sets `isConfirming = false`; add `useEffect(() => { setIsConfirming(false); }, [modo])` — resets confirmation if parent mode changes (e.g., user opens alta or edits another row)
- [ ] T040 [US6] Wire delete in `src/pages/Admin.jsx` — implement `onEliminar` prop on `<FilaFechaAdmin>`: since delete confirmation is local to the row, `onEliminar` simply calls `setModo('listado')` (or can be a no-op that lets the row handle it internally — confirm during implementation which is cleaner); ensure `modo` prop is passed to every `<FilaFechaAdmin>` so the `useEffect` in T039 can reset `isConfirming`

**Checkpoint**: Click Eliminar → "¿Confirmar?"/"Cancelar" in row (no modal). Confirm → spinner → row disappears. Cancel → Editar/Eliminar restored. Error → inline error, buttons restored. No text success message on delete.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Quality baseline that affects all routes and components.

- [ ] T041 [P] Add responsive CSS for mobile (≥ 375px) — verify and fix: Hero title with `clamp()` doesn't overflow; TarjetaFecha collapses to single column; FormularioFecha fields fill full width; FilaFechaAdmin inline edit inputs wrap gracefully; Navbar stacks or collapses on narrow viewport — update `src/styles/globals.css` and relevant component CSS files
- [ ] T042 [P] Add visible `:focus-visible` styles for all interactive elements — `<a>`, `<button>`, `<input>`, `<textarea>`, `<select>` — using `outline: 2px solid var(--color-accent-secondary); outline-offset: 3px` in `src/styles/globals.css`; verify on all four routes including admin form inputs and FilaFechaAdmin edit inputs
- [ ] T043 [P] Verify WCAG AA contrast ratios for the full palette — especially `var(--color-accent-secondary)` `#D9A441` over `var(--color-bg)` `#121110` and over `var(--color-surface)` `#221F1D`; annotate pass/fail ratios in `src/styles/tokens.css` comments; adjust `--color-accent-secondary` value if contrast < 3:1 on any surface
- [ ] T044 [P] Deploy `firestore.rules` to Firebase project: `firebase deploy --only firestore:rules`; verify in Firebase Console Rules Playground that unauthenticated write to `fechas` is rejected and authenticated write is allowed
- [ ] T045 Run `quickstart.md` validation scenarios end-to-end — Escenarios 1 through 5; mark each row pass/fail; address any failing items before closing the branch

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion — **blocks all user story phases**
- **Phases 3–8 (User Stories)**: All depend on Phase 2 completion; can proceed sequentially P1→P2→P3→P4→P5→P6
- **Phase 9 (Polish)**: Depends on all desired user story phases being complete

### User Story Dependencies

| Story | Depends on | Notes |
|---|---|---|
| US1 (P1) | Phase 2 complete | Fully independent |
| US2 (P2) | Phase 2 complete | Independent; real-time propagation from US4 visible once US4 is done |
| US3 (P3) | Phase 2 complete | `ProtectedRoute` + `AuthContext` already foundational |
| US4 + US7 (P4) | Phase 2 + US3 complete | Login prerequisite for admin access |
| US5 (P5) | US4 complete | Extends `FilaFechaAdmin.jsx` and `Admin.jsx` from Phase 6 |
| US6 (P6) | US4 complete | Extends `FilaFechaAdmin.jsx` and `Admin.jsx` from Phase 6 |

### Within Each User Story

- Services / hooks before components that consume them
- Components before pages that compose them
- Core implementation before wire-up in parent page

### Parallel Opportunities

All tasks marked `[P]` within a phase can run in parallel. Key within-phase parallelism:

**Phase 2**: T008, T009, T012, T013, T014, T015, T018 can all start after T006+T007 — different files
**Phase 3**: T019 and T020 (bandConfig + Home.css) in parallel before T021 (Home.jsx needs both)
**Phase 6**: T029, T030, T031, T032, T033, T034 all in parallel — different files; T035+T036 (Admin.jsx + css) after T029+T033

---

## Parallel Example: Phase 6 (US4 + US7)

```
# Parallel batch 1 — all independent files:
Task T029: src/hooks/useAdminFechas.js
Task T030: src/services/firebase/fechasService.js
Task T031: src/components/FormularioFecha.jsx
Task T032: src/components/FormularioFecha.css
Task T033: src/components/FilaFechaAdmin.jsx (read mode)
Task T034: src/components/FilaFechaAdmin.css

# Sequential batch 2 — after batch 1:
Task T035: src/pages/Admin.jsx    (wires T029, T030, T031, T033)
Task T036: src/pages/Admin.css
```

---

## Implementation Strategy

### MVP First (US1 — Homepage)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 (Home page)
4. **STOP AND VALIDATE**: quickstart.md Escenario 1 passes
5. Demo the hero + band info page

### Incremental Delivery

1. Setup + Foundational → routing skeleton live
2. US1 → Homepage → **MVP demo-ready**
3. US2 → Public calendar → visitors can see shows
4. US3 → Auth → admin can log in
5. US4 + US7 → Admin can add + view shows → **core ABM functional**
6. US5 → Admin can edit shows
7. US6 → Admin can delete shows → **full feature complete**
8. Polish → quality gate passed → **ready to deploy**

---

## Task Summary

| Phase | Tasks | Parallelizable |
|---|---|---|
| Phase 1: Setup | T001–T005 (5) | T003, T004, T005 |
| Phase 2: Foundational | T006–T018 (13) | T008, T009, T012, T013, T014, T015, T016, T018 |
| Phase 3: US1 (P1) | T019–T021 (3) | T019, T020 |
| Phase 4: US2 (P2) | T022–T026 (5) | T022, T023, T024, T026 |
| Phase 5: US3 (P3) | T027–T028 (2) | T027 |
| Phase 6: US4+US7 (P4) | T029–T036 (8) | T029, T030, T031, T032, T033, T034, T036 |
| Phase 7: US5 (P5) | T037–T038 (2) | — |
| Phase 8: US6 (P6) | T039–T040 (2) | — |
| Phase 9: Polish | T041–T045 (5) | T041, T042, T043, T044 |
| **Total** | **45 tasks** | **28 parallelizable** |

# Spec 01 — Página Informativa Pública

**Proyecto**: Sitio Web Oficial de Garage22
**Feature Branch**: `001-garage22-shows-site`
**Created**: 2026-07-06
**Status**: Draft

> **Índice del proyecto**: [`spec.md`](./spec.md)
> **Specs relacionadas**: [`spec-02-calendario-publico.md`](./spec-02-calendario-publico.md) — el calendario aparece en el mismo sitio público.

---

## Descripción

Página pública y estática que proyecta la identidad de la banda hacia cualquier visitante. Se sirve en la ruta `/`. No requiere autenticación. Muestra la biografía, los integrantes, el estilo musical y enlaces directos a Instagram y Spotify. Las rutas públicas `/` y `/shows` comparten una barra de navegación (`Navbar`) con enlaces "Inicio" y "Shows"; la ruta `/admin` tiene un layout completamente independiente sin esta navbar.

---

## User Scenarios & Testing

### User Story 1 — Visitante descubre la banda (Priority: P1)

Un visitante llega al sitio por primera vez y puede leer la información de la banda (biografía, integrantes, estilo musical) y acceder con un clic a su Instagram y su Spotify. No necesita iniciar sesión ni realizar ninguna acción adicional.

**Why this priority**: Es la razón principal de existencia del sitio: proyectar la identidad de la banda hacia el público general. Sin esta funcionalidad el sitio no tiene sentido.

**Independent Test**: Abrir el sitio sin sesión iniciada y verificar que la página de inicio muestra biografía, integrantes, estilo musical y dos enlaces externos (Instagram y Spotify) operativos.

**Acceptance Scenarios**:

1. **Given** que un visitante abre el sitio sin estar autenticado, **When** se carga la página principal, **Then** ve la biografía de la banda, la lista de integrantes y el estilo musical sin necesidad de hacer login.
2. **Given** que el visitante está en la página principal, **When** hace clic en el enlace de Instagram, **Then** es redirigido a la cuenta de Instagram de Garage22 en una pestaña nueva.
3. **Given** que el visitante está en la página principal, **When** hace clic en el enlace de Spotify, **Then** es redirigido al perfil de Spotify de Garage22 en una pestaña nueva.
4. **Given** que el visitante no está logueado, **When** navega por la página informativa, **Then** no ve ningún botón, formulario ni enlace de administración.

### Edge Cases

- ¿Qué ocurre si un visitante accede con JavaScript desactivado? → Fuera de alcance; React requiere JS habilitado.

---

## Requirements

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar en la ruta `/` una página pública con la biografía de la banda, la lista de integrantes y el estilo musical, accesible sin autenticación.
- **FR-002**: La página `/` DEBE mostrar un enlace externo visible a Instagram de Garage22 que abra en pestaña nueva.
- **FR-003**: La página `/` DEBE mostrar un enlace externo visible a Spotify de Garage22 que abra en pestaña nueva.
- **FR-004**: La página `/` NO DEBE mostrar controles de administración a visitantes no autenticados.
- **FR-004b**: Las rutas públicas (`/` y `/shows`) DEBEN incluir una barra de navegación (`Navbar`) compartida con enlaces "Inicio" (→ `/`) y "Shows" (→ `/shows`). La ruta `/admin` NO incluye esta navbar; tiene un layout independiente.

---

## Success Criteria

- **SC-001**: Un visitante que llega al sitio sin sesión puede ver biografía, integrantes, estilo musical y acceder a Instagram y Spotify en menos de 2 clics, sin necesidad de iniciar sesión.

---

## Assumptions

- Las URLs de Instagram y Spotify son conocidas y se configuran como constantes en el código (no son editables desde la UI en v1).
- El contenido de la página informativa (texto de biografía, nombres de integrantes, estilo musical) es estático en v1; no existe un panel de edición para estos datos.
- El sitio es en español (idioma de la banda y su audiencia principal).

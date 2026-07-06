# Garage22 — Sitio Web Oficial

**TP Firebase — Orgnero & Legaria**

Sitio web oficial de **Garage22**, una banda de rock under.  
Stack: **React 18 + Vite 5 + Firebase 10** (Authentication + Firestore).

---

## Prerequisitos

- Node.js ≥ 18 y npm ≥ 9
- Proyecto Firebase creado en [console.firebase.google.com](https://console.firebase.google.com) con:
  - **Firestore** habilitado (modo producción)
  - **Authentication** con proveedor **Email/Password** activado
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone git@github.com:Nicoorgnero/garage22_firebase.git
cd garage22_firebase

# 2. Instalar dependencias (dentro de la carpeta del proyecto React)
cd garage22
npm install
```

---

## Configuración de variables de entorno

```bash
# Dentro de garage22/
cp .env.example .env
```

Editá `.env` con los valores de tu proyecto Firebase  
(Configuración del proyecto → General → Tu app):

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

> ⚠️ `.env` está en `.gitignore` — **nunca** lo subas al repositorio.

---

## Despliegue de reglas de Firestore

```bash
# Desde la raíz del repo (donde está firestore.rules)
firebase login
firebase deploy --only firestore:rules
```

---

## Levantar en desarrollo

```bash
# Dentro de garage22/
npm run dev
# → http://localhost:5173
```

---

## Build para producción

```bash
# Dentro de garage22/
npm run build
# Salida en garage22/dist/
```

---

## Estructura del repositorio

```
garage22_firebase/
├── garage22/                        → código fuente React + Vite
│   ├── src/
│   │   ├── components/              → Hero, Navbar, TarjetaFecha, etc.
│   │   ├── pages/                   → Home, Fechas, Login, Admin
│   │   ├── hooks/                   → useAuth, useFechas, useAdminFechas
│   │   ├── services/firebase/       → config.js, fechasService.js
│   │   ├── context/                 → AuthContext.jsx
│   │   └── styles/                  → tokens.css, globals.css
│   ├── .env.example
│   └── package.json
├── specs/001-garage22-shows-site/   → especificaciones del proyecto
├── .specify/memory/constitution.md  → principios y constitución del proyecto
├── firestore.rules
└── README.md
```

---

## Documentación

| Archivo | Descripción |
|---|---|
| [`specs/spec.md`](./specs/001-garage22-shows-site/spec.md) | Índice general del proyecto |
| [`specs/plan.md`](./specs/001-garage22-shows-site/plan.md) | Plan técnico y arquitectura |
| [`specs/tasks.md`](./specs/001-garage22-shows-site/tasks.md) | Lista de tareas de implementación (45 tareas) |
| [`specs/quickstart.md`](./specs/001-garage22-shows-site/quickstart.md) | Guía de validación end-to-end |
| [`specs/data-model.md`](./specs/001-garage22-shows-site/data-model.md) | Schema Firestore y contratos de UI |

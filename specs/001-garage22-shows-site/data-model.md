# Data Model: Garage22 Shows Site

**Branch**: `001-garage22-shows-site` | **Date**: 2026-07-06 | **Plan**: [plan.md](./plan.md)

---

## Firestore

### Colección: `fechas`

Cada documento representa una fecha/show en el calendario de la banda.

| Campo | Tipo Firestore | Requerido | Descripción |
|---|---|---|---|
| `lugar` | `string` | ✅ | Nombre del venue/lugar del evento. Label visible: **"Venue"** |
| `fechaHora` | `Timestamp` | ✅ | Fecha y hora del show. **Alta**: `Timestamp.fromDate(new Date(inputValue))`. **Edición**: convertir a `YYYY-MM-DDTHH:mm` en hora local del browser (ver research.md). |
| `ciudad` | `string` | ❌ | Ciudad donde se realiza el evento. Label: **"Ciudad"** |
| `descripcion` | `string` | ❌ | Descripción adicional. Máx. 500 caracteres. Label: **"Descripción"** |
| `linkEntradas` | `string` | ❌ | URL a entradas o página del evento. Debe ser URL válida si está presente. Label: **"Link a entradas"** |
| `createdAt` | `Timestamp` | ✅ | Creación del documento. `serverTimestamp()` al crear. Nunca se modifica. |
| `createdBy` | `string` | ✅ | `user.uid` del admin que creó el registro. Nunca se modifica. |
| `updatedAt` | `Timestamp` | ❌* | Última modificación. `serverTimestamp()` solo en `updateDoc`. |
| `updatedBy` | `string` | ❌* | `user.uid` del admin que realizó la última modificación. Solo en `updateDoc`. |

*Condicional: presente en documentos modificados al menos una vez; ausente en creaciones nunca editadas.

> `updatedBy` no figuraba en el input del usuario, pero fue añadido explícitamente en la 4ª ronda de clarificaciones (spec-04, FR-023) y se mantiene en este plan.

**ID del documento**: generado automáticamente por Firestore (`addDoc`).
**Baja**: física — `deleteDoc`. Sin campo `isDeleted` ni borrado lógico (v1).

---

### Operaciones Firestore por tipo ABM

| Operación | Función SDK | Campos escritos |
|---|---|---|
| **Alta** | `addDoc(collection(db,'fechas'), data)` | `lugar`, `fechaHora`, `ciudad?`, `descripcion?`, `linkEntradas?`, `createdAt: serverTimestamp()`, `createdBy: user.uid` |
| **Modificación** | `updateDoc(doc(db,'fechas',id), data)` | campos modificados + `updatedAt: serverTimestamp()`, `updatedBy: user.uid` |
| **Baja** | `deleteDoc(doc(db,'fechas',id))` | — (eliminación física del documento) |

---

### Índices Firestore

| Campo | Dirección | Usado en | Query |
|---|---|---|---|
| `fechaHora` | Ascendente | `/fechas` (vista pública) | `where('fechaHora','>=',now)` + `orderBy('fechaHora','asc')` |
| `fechaHora` | Descendente | `/admin` (listado admin) | `orderBy('fechaHora','desc')` |

Un índice de colección simple en `fechaHora` soporta ambas direcciones en Firestore.

---

### Firestore Security Rules (`firestore.rules`)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /fechas/{fechaId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

- `allow read: if true` — lectura pública para el calendario (`/fechas`) sin login.
- `allow create, update, delete: if request.auth != null` — escritura solo para admins autenticados.
- Las validaciones de campos (longitud de `descripcion`, formato de `linkEntradas`) son client-side (UX); las rules son la barrera de seguridad real.

---

## Contratos de UI

### AuthContext

```ts
// Expuesto por AuthContext.jsx via useAuthContext()
type AuthContextValue = {
  loading: boolean;   // true mientras onAuthStateChanged no resolvió el estado inicial
  user: User | null;  // objeto Firebase User, o null si no hay sesión activa
}
```

### useFechas — modo público (`/fechas`)

```ts
// Solo fechas futuras, orden ascendente
type UseFechasPublicoResult = {
  fechas:  Fecha[];      // vacío durante carga; filtra fechaHora >= now
  loading: boolean;
  error:   Error | null;
}
```

### useFechas — modo admin (`/admin`)

```ts
// Todas las fechas (pasadas y futuras), orden descendente
type UseFechasAdminResult = {
  fechas:  Fecha[];
  loading: boolean;
  error:   Error | null;
}
```

### fechasService.js

```ts
import { db } from './config';
import {
  collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp
} from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

// Alta
async function crearFecha(data: FechaInput, userId: string): Promise<void>

// Modificación
async function actualizarFecha(id: string, data: Partial<FechaInput>, userId: string): Promise<void>

// Baja física
async function eliminarFecha(id: string): Promise<void>
```

### Tipos de datos (JS)

```ts
type Fecha = {
  id:           string;         // ID del documento Firestore
  lugar:        string;
  fechaHora:    Timestamp;
  ciudad?:      string;
  descripcion?: string;
  linkEntradas?:string;
  createdAt:    Timestamp;
  createdBy:    string;
  updatedAt?:   Timestamp;      // ausente en documentos nunca modificados
  updatedBy?:   string;         // ausente en documentos nunca modificados
}

type FechaInput = {
  lugar:        string;         // obligatorio
  fechaHora:    Timestamp;      // obligatorio
  ciudad?:      string;
  descripcion?: string;         // máx. 500 caracteres, validado en cliente
  linkEntradas?:string;         // URL válida si presente, validada en cliente
}
```

---

## Estado del Componente Admin

```ts
// Admin.jsx — estado único de modo activo
type ModoAdmin =
  | 'listado'            // estado por defecto
  | 'alta'               // formulario de alta visible (encima del listado)
  | { editando: string } // string = ID de la fecha en edición inline

// Transiciones válidas:
// 'listado'         → 'alta'              al pulsar "+ Agregar fecha"
// 'listado'         → { editando: id }    al pulsar "Editar" en fila
// 'alta'            → 'listado'           al guardar exitosamente o cancelar
// 'alta'            → { editando: id }    al pulsar "Editar" (cancela alta)
// { editando: id }  → 'listado'           al guardar exitosamente o cancelar
// { editando: id }  → { editando: id2 }   al pulsar "Editar" en otra fila
// { editando: id }  → 'alta'              al pulsar "+ Agregar fecha" (cancela edición)
```

---

## Variables de Entorno

### `.env.example` (versionado en repo)

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Accedidas en código como `import.meta.env.VITE_FIREBASE_*`. Nunca hardcodeadas. `.env` en `.gitignore`.

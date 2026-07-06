# Spec 05 — Seguridad, Firebase y Schema de Datos

**Proyecto**: Sitio Web Oficial de Garage22
**Feature Branch**: `001-garage22-shows-site`
**Created**: 2026-07-06
**Status**: Draft

> **Índice del proyecto**: [`spec.md`](./spec.md)
> **Specs relacionadas**: todas — este documento define el contrato de datos y seguridad del que dependen las demás specs.

---

## Descripción

Define el schema de la colección `shows` en Firestore, las reglas de seguridad (`firestore.rules`) y los requisitos de configuración de Firebase. Toda spec que lea o escriba en Firestore debe ser compatible con este documento. Las reglas de seguridad se versionan en el repositorio y se actualizan en el mismo PR que modifica cualquier entidad del ABM, conforme al Principio III de la constitución.

---

## Schema de Firestore

### Colección: `shows`

Cada documento representa un show o fecha en el calendario de la banda.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `venue` | `string` | ✅ | Nombre del lugar/venue del evento |
| `dateTime` | `timestamp` | ✅ | Fecha y hora del evento (Firestore `Timestamp`). **Alta:** capturado con `<input type="datetime-local">` (valor `YYYY-MM-DDTHH:mm`); convertido a `Timestamp` con `Timestamp.fromDate(new Date(value))` al guardar. **Edición:** el `Timestamp` se convierte a string `YYYY-MM-DDTHH:mm` en **zona horaria local** del browser usando `timestamp.toDate()` formateado localmente (sin `toISOString()` que retornaría UTC); esto asegura que el admin ve y edita la hora argentina tal como fue ingresada. |
| `city` | `string` | ❌ | Ciudad donde se realiza el evento |
| `description` | `string` | ❌ | Descripción o detalle adicional (máx. 500 caracteres) |
| `ticketUrl` | `string` | ❌ | URL a entradas o página del evento (debe ser URL válida si está presente) |
| `createdAt` | `timestamp` | ✅ | Momento de creación del documento (servidor). Se escribe solo al crear con `serverTimestamp()`. |
| `updatedAt` | `timestamp` | ❌* | Momento de la última modificación (servidor). Se escribe solo al actualizar con `serverTimestamp()`. No existe en documentos nunca modificados. |
| `createdBy` | `string` | ✅ | UID del administrador que creó el registro (`user.uid`). Se escribe solo al crear. |
| `updatedBy` | `string` | ❌* | UID del administrador que realizó la última modificación (`user.uid`). Se escribe solo al actualizar. No existe en documentos nunca modificados. |

*Requerido condicionalmente: presente tras la primera modificación del documento; ausente en documentos que nunca han sido editados tras su creación.

**Notas de diseño**:

- El ID del documento es generado automáticamente por Firestore (`addDoc`).
- La baja es **física**: el documento se elimina de Firestore con `deleteDoc`. No existe campo `deletedAt` ni `isDeleted` en v1.
- `createdAt` y `updatedAt` deben escribirse con `serverTimestamp()` para evitar dependencia del reloj del cliente.
- No existe relación con otras colecciones en v1; `shows` es la única colección del sistema.

**Índices requeridos**:

- `dateTime` **ascendente** — usado por la vista pública (`/shows`): `query(collection, where("dateTime", ">=", now), orderBy("dateTime", "asc"))`.
- `dateTime` **descendente** — usado por el listado de administración (`/admin`): `orderBy("dateTime", "desc")`. En Firestore, un campo con un índice de colección simple soporta ambas direcciones; puede ser el mismo índice si Firestore lo permite, o bien se define uno por dirección según lo requiera el emulador/consola.

---

## Reglas de Seguridad (firestore.rules)

### Contrato

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /shows/{showId} {
      // Lectura pública: cualquier visitante (autenticado o no) puede leer shows
      allow read: if true;

      // Escritura restringida: solo administradores autenticados pueden crear,
      // actualizar o eliminar shows
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

### Descripción de las reglas

- **`allow read: if true`** — Permite lectura de cualquier documento de la colección `shows` a cualquier usuario, autenticado o no. Esto habilita el calendario público sin login.
- **`allow create, update, delete: if request.auth != null`** — Restringe toda escritura (alta, modificación, baja) a usuarios autenticados en Firebase Authentication. Un visitante no logueado recibe error de permisos al intentar cualquier escritura.

### Principios aplicados

- Las reglas son la **única barrera real** de protección de datos (el cliente puede ser manipulado; las reglas del servidor no).
- Las validaciones en cliente (FR-018, FR-019) son para UX; las reglas de Firestore son para seguridad real.
- No se confía en ninguna lógica de ocultamiento de UI como sustituto de las reglas.

---

## Requirements

### Functional Requirements

- **FR-026**: Las Firestore Security Rules DEBEN permitir lectura (`read`) de la colección `shows` a cualquier usuario (autenticado o no): `allow read: if true`.
- **FR-027**: Las Firestore Security Rules DEBEN restringir escritura (`create`, `update`, `delete`) en la colección `shows` exclusivamente a usuarios autenticados: `allow create, update, delete: if request.auth != null`.
- **FR-028**: La configuración de Firebase (`apiKey`, `projectId`, `authDomain`, `storageBucket`, `messagingSenderId`, `appId`) DEBE inyectarse mediante variables de entorno (`.env`) y nunca hardcodearse en el código fuente. El repositorio DEBE incluir un `.env.example` con todas las claves listadas sin valores.

---

## Success Criteria

- **SC-007**: Las Firestore Security Rules rechazan escrituras de usuarios no autenticados con error de permisos (verificable en la consola de Firebase Rules Playground o en tests de reglas).

---

## Assumptions

- El archivo `firestore.rules` vive en la raíz del repositorio y se actualiza en el mismo PR que agrega o modifica cualquier entidad del ABM, conforme al Principio III de la constitución.
- La inicialización del SDK de Firebase (`initializeApp`) se realiza una única vez en `src/firebase/config.js` (o equivalente), importado por la app React. Nunca se inicializa mediante un `<script>` suelto en el HTML, conforme al Principio V de la constitución.
- Las variables de entorno siguen la convención de Vite: prefijo `VITE_FIREBASE_*` (ej.: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_APP_ID`). Se acceden en el código con `import.meta.env.VITE_FIREBASE_*`.
- En v1 no se aplican reglas de validación de campos dentro de `firestore.rules` (ej.: longitud de `description`); esa validación queda en el cliente. Si en versiones futuras se requiere, se actualizará esta spec y las reglas.

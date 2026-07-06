# Sanity Check de Requisitos: Garage22 — Shows Site

**Purpose**: Verificar que las specs 01–05 no contienen brechas críticas ni ambigüedades que bloqueen la generación del plan técnico (`/speckit.plan`). ~11 ítems de prioridad alta; foco en el módulo ABM con cobertura transversal.
**Created**: 2026-07-06
**Feature**: [spec.md](../spec.md) · Specs: [01](../spec-01-pagina-informativa.md) · [02](../spec-02-calendario-publico.md) · [03](../spec-03-autenticacion.md) · [04](../spec-04-abm-shows.md) · [05](../spec-05-seguridad-firebase.md)

---

## Completitud de Requisitos

- [ ] CHK001 - ¿Está especificado el copy del `<h1>` y `<title>` de la ruta `/admin` cuando no hay sesión activa? El encabezado visible del formulario de login no está definido en ningún FR ni en las Assumptions. [Gap, Spec §FR-010, spec-03]
- [ ] CHK002 - ¿Están enumerados en un FR los nombres exactos de *todas* las variables de entorno requeridas (incluidos `VITE_FIREBASE_STORAGE_BUCKET` y `VITE_FIREBASE_MESSAGING_SENDER_ID`)? Actualmente solo aparecen en las Assumptions de spec-05, no en FR-028. [Gap, Spec §FR-028, spec-05]
- [ ] CHK003 - ¿Existe algún requisito de accesibilidad (a11y) en alguna de las 5 specs? Navegación por teclado, roles ARIA para el spinner, formularios inline y botones dinámicos (confirmación de baja, edición inline) no están mencionados en ningún FR. [Gap, todas las specs]
- [ ] CHK004 - ¿El contador visual de caracteres restantes del campo "Descripción" (máx. 500) está declarado como FR o solo mencionado en Edge Cases? FR-017 define el límite pero no especifica que deba existir un contador visible en el formulario. [Completeness, Spec §FR-017, spec-04]

---

## Claridad de Requisitos

- [ ] CHK005 - ¿Con qué reloj se evalúa "fecha/hora actual" para el filtro `dateTime >= now` del calendario público? No se especifica si se usa `Date.now()` (reloj del cliente, afectado por la zona horaria del visitante) o un valor de referencia del servidor. [Ambiguity, Spec §FR-008, spec-02]
- [ ] CHK006 - ¿Los "indicadores visuales (badge o ícono)" para campos opcionales en modo lectura del listado muestran solo presencia (sí/no) o también el valor del campo (ej.: tooltip al hover)? FR-016 dice "indicador cuando tienen valor" pero no cuantifica qué información expone. [Clarity, Spec §FR-016, spec-04]
- [ ] CHK007 - ¿El copy del mensaje de error del formulario de login está definido por tipo de falla (contraseña incorrecta, usuario no encontrado, sin conectividad)? "Mensaje comprensible" no es verificable sin copy o una taxonomía de errores. [Clarity, Spec §FR-012, spec-03]
- [ ] CHK008 - ¿Los mensajes de éxito de ~3 segundos especifican si alguna interacción del usuario los descarta antes del timeout? No se indica si una nueva acción (ej.: abrir otro formulario) interrumpe el timer anticipadamente. [Clarity, Spec §FR-024, spec-04]

---

## Consistencia de Requisitos

- [ ] CHK009 - ¿Son consistentes US4 escenario 8 y FR-017 en cuándo se oculta el formulario de alta? US4.8 implica que el formulario permanece visible durante el mensaje de éxito (~3s) y *luego* se cierra; FR-017 dice "al guardar exitosamente, el formulario se oculta" sin mencionar ese delay. Uno de los dos debe ser la fuente de verdad. [Consistency Conflict, Spec §US4-escenario-8 vs §FR-017, spec-04]

---

## Cobertura de Escenarios

- [ ] CHK010 - ¿Hay un requisito que especifique el comportamiento cuando las URLs de Instagram o Spotify son incorrectas o el recurso externo no está disponible? spec-01 las define como constantes en código pero no hay FR para el fallback si el enlace es inválido o el destino está caído. [Edge Case Gap, Spec §FR-002/FR-003, spec-01]
- [ ] CHK011 - ¿Están definidos los requisitos cuando el administrador pierde conectividad mientras tiene el formulario de alta o edición abierto? spec-04 cubre el error que Firestore devuelve, pero no la ausencia total de respuesta (timeout indefinido sin mensaje de error). [Edge Case Coverage, Spec §FR-024, spec-04]

---

## Notas de Revisión

- **CHK001** es un gap **pendiente de resolución activa** (pregunta abierta de la quinta ronda de clarificación, sesión 2026-07-06).
- **CHK009** es el único conflicto de consistencia interna detectado; resolverlo antes de planear afecta el diseño del componente de formulario de alta.
- **CHK003** y **CHK010** son gaps conocidos; probablemente aceptables para v1 pero requieren decisión explícita antes de cerrar los requisitos.
- Marcar con `[x]` los ítems resueltos o explícitamente aceptados como fuera de alcance v1.

import './FilaFechaAdmin.css';

/**
 * Formatea Timestamp → "Sábado 12 de julio de 2026 · 21:00 hs"
 */
function formatearFecha(timestamp) {
  const d = timestamp.toDate();
  const dia = d.toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const hora = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  return `${dia.charAt(0).toUpperCase() + dia.slice(1)} · ${hora} hs`;
}

/**
 * Fila del listado de administración.
 * Sección 3: modo lectura + confirmación de baja.
 * Sección 4 agrega: modo edición inline.
 */
export function FilaFechaAdmin({ fecha, modo, onEditar, onEliminar }) {
  const { id, lugar, fechaHora, ciudad, descripcion, linkEntradas } = fecha;
  const estaEditando = modo?.editando === id;

  // Confirmación de baja (estado local a la fila)
  // Se implementa en Sección 4 (T039); aquí solo el botón base.
  const enConfirmacion = false;

  return (
    <li className={`fila-admin${estaEditando ? ' fila-admin--editando' : ''}`}>
      {/* Modo lectura */}
      <div className="fila-admin__info">
        <span className="fila-admin__lugar">{lugar}</span>
        <span className="fila-admin__fecha">{formatearFecha(fechaHora)}</span>

        {/* Badges para campos opcionales con valor */}
        <div className="fila-admin__badges">
          {ciudad       && <span className="fila-admin__badge">{ciudad}</span>}
          {descripcion  && <span className="fila-admin__badge fila-admin__badge--info">📝 Desc.</span>}
          {linkEntradas && <span className="fila-admin__badge fila-admin__badge--link">🎟 Entradas</span>}
        </div>
      </div>

      {/* Acciones */}
      <div className="fila-admin__acciones">
        {!enConfirmacion ? (
          <>
            <button
              className="fila-admin__btn fila-admin__btn--editar"
              onClick={() => onEditar(id)}
              aria-label={`Editar ${lugar}`}
            >
              Editar
            </button>
            <button
              className="fila-admin__btn fila-admin__btn--eliminar"
              onClick={() => onEliminar(id)}
              aria-label={`Eliminar ${lugar}`}
            >
              Eliminar
            </button>
          </>
        ) : null}
      </div>
    </li>
  );
}

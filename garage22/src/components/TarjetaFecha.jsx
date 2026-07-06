import { BotonSello } from './BotonSello';
import './TarjetaFecha.css';

/**
 * Formatea un Firestore Timestamp como:
 * "Sábado 12 de julio de 2026 · 21:00 hs"
 */
function formatearFecha(timestamp) {
  const d = timestamp.toDate();
  const dia = d.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const hora = d.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const diaCapitalizado = dia.charAt(0).toUpperCase() + dia.slice(1);
  return `${diaCapitalizado} · ${hora} hs`;
}

/**
 * Día y mes grandes para el costado izquierdo de la tarjeta.
 */
function getDiaMes(timestamp) {
  const d = timestamp.toDate();
  return {
    dia: d.getDate(),
    mes: d.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '').toUpperCase(),
  };
}

export function TarjetaFecha({ fecha }) {
  const { lugar, fechaHora, ciudad, descripcion, linkEntradas } = fecha;
  const { dia, mes } = getDiaMes(fechaHora);

  return (
    <article className="tarjeta-fecha tape-detail">
      {/* Columna izquierda: día grande */}
      <div className="tarjeta-fecha__fecha-col" aria-hidden="true">
        <span className="tarjeta-fecha__dia">{dia}</span>
        <span className="tarjeta-fecha__mes">{mes}</span>
      </div>

      {/* Columna derecha: info del show */}
      <div className="tarjeta-fecha__info">
        <h3 className="tarjeta-fecha__lugar">{lugar}</h3>
        {ciudad && (
          <p className="tarjeta-fecha__ciudad">{ciudad}</p>
        )}
        <p className="tarjeta-fecha__fecha-texto">
          <time dateTime={fechaHora.toDate().toISOString()}>
            {formatearFecha(fechaHora)}
          </time>
        </p>
        {descripcion && (
          <p className="tarjeta-fecha__descripcion">{descripcion}</p>
        )}
        {linkEntradas && (
          <div className="tarjeta-fecha__entradas">
            <BotonSello
              as="a"
              href={linkEntradas}
              target="_blank"
              variant="secondary"
            >
              Conseguir entradas
            </BotonSello>
          </div>
        )}
      </div>
    </article>
  );
}

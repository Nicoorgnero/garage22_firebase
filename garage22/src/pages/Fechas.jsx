import { useEffect, useRef } from 'react';
import { useFechas }       from '../hooks/useFechas';
import { TarjetaFecha }    from '../components/TarjetaFecha';
import { Spinner }         from '../components/Spinner';
import './Fechas.css';

/**
 * Hook que agrega clase `.visible` cuando el elemento entra en el viewport.
 */
function useScrollReveal(containerRef) {
  useEffect(() => {
    const targets = containerRef.current?.querySelectorAll('.tarjeta-fecha');
    if (!targets || targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });
}

export function Fechas() {
  const { fechas, loading, error } = useFechas();
  const listaRef = useRef(null);
  useScrollReveal(listaRef);

  return (
    <div className="fechas">
      <div className="fechas__header">
        <div className="fechas__header-inner">
          <h1 className="fechas__titulo">Próximas Fechas</h1>
        </div>
      </div>

      <div className="fechas__contenido">
        <div className="fechas__inner">

          {/* Estado: cargando */}
          {loading && <Spinner size="lg" />}

          {/* Estado: error */}
          {!loading && error && (
            <p className="fechas__mensaje fechas__mensaje--error">
              Algo salió mal cargando las fechas. Intentá de nuevo más tarde.
            </p>
          )}

          {/* Estado: vacío */}
          {!loading && !error && fechas.length === 0 && (
            <p className="fechas__mensaje fechas__mensaje--vacio">
              Todavía no hay fechas confirmadas. Volvé pronto.
            </p>
          )}

          {/* Lista de fechas */}
          {!loading && !error && fechas.length > 0 && (
            <ul className="fechas__lista" ref={listaRef} role="list">
              {fechas.map((fecha) => (
                <li key={fecha.id}>
                  <TarjetaFecha fecha={fecha} />
                </li>
              ))}
            </ul>
          )}

        </div>
      </div>
    </div>
  );
}

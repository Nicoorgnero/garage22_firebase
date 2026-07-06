import './Hero.css';

/**
 * Hero de la página principal.
 * Título GARAGE22 en tipografía display + tape detail en CSS puro.
 * Animación heroEntrance (fade-in + slide-up) al montar.
 */
export function Hero() {
  return (
    <section className="hero tape-detail" aria-label="Garage22">
      <div className="hero__inner">
        <div className="hero__tag">Rock Under · Buenos Aires</div>
        <h1 className="hero__title">GARAGE22</h1>
        <p className="hero__sub">
          Tres tipos, un garage, demasiado volumen.
        </p>
      </div>
    </section>
  );
}

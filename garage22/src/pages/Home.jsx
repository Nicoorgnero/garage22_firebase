import { BotonSello }  from '../components/BotonSello';
import { Hero }        from '../components/Hero';
import { INSTAGRAM_URL, SPOTIFY_URL } from '../config/bandConfig';
import './Home.css';

const INTEGRANTES = [
  { nombre: 'Nico',     rol: 'Guitarra / Voz' },
  { nombre: 'Santiago', rol: 'Bajo'            },
  { nombre: 'Legaria',  rol: 'Batería'         },
];

export function Home() {
  return (
    <div className="home">
      <Hero />

      {/* ── Bio ── */}
      <section className="home__section home__bio" aria-labelledby="bio-titulo">
        <div className="home__inner">
          <h2 className="home__section-title" id="bio-titulo">La Banda</h2>
          <p className="home__bio-text">
            Garage22 nació en un garage de Caballito que olía a aceite quemado y
            feedback mal calibrado. Desde 2019 tocamos rock under en bares
            donde el PA nunca tiene suficiente subwoofer y el camarín es el baño.
            Tres discos, cero plata, varios vecinos enojados.
          </p>
          <p className="home__bio-text">
            Si buscás algo prolijo y bien producido, equivocaste de sitio.
            Si llegaste hasta acá, probablemente ya te gustamos.
          </p>
        </div>
      </section>

      {/* ── Integrantes ── */}
      <section className="home__section home__integrantes" aria-labelledby="integrantes-titulo">
        <div className="home__inner">
          <h2 className="home__section-title" id="integrantes-titulo">Integrantes</h2>
          <ul className="home__integrantes-lista" role="list">
            {INTEGRANTES.map((p) => (
              <li key={p.nombre} className="home__integrante">
                <span className="home__integrante-nombre">{p.nombre}</span>
                <span className="home__integrante-rol">{p.rol}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Estilo Musical ── */}
      <section className="home__section home__estilo" aria-labelledby="estilo-titulo">
        <div className="home__inner">
          <h2 className="home__section-title" id="estilo-titulo">Estilo</h2>
          <p className="home__bio-text">
            Rock sucio con influencias del grunge noventoso, el punk ochentero
            y ese blues de bar que nadie sabe bien cómo se llama pero todos
            reconocen cuando lo escuchan. Distorsión sin pedir perdón.
          </p>
        </div>
      </section>

      {/* ── Redes ── */}
      <section className="home__section home__redes" aria-labelledby="redes-titulo">
        <div className="home__inner">
          <h2 className="home__section-title" id="redes-titulo">Seguinos</h2>
          <div className="home__redes-botones">
            <BotonSello as="a" href={INSTAGRAM_URL} target="_blank" variant="primary">
              Instagram
            </BotonSello>
            <BotonSello as="a" href={SPOTIFY_URL} target="_blank" variant="secondary">
              Spotify
            </BotonSello>
          </div>
        </div>
      </section>
    </div>
  );
}

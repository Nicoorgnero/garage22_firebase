import { NavLink } from 'react-router-dom';
import './Navbar.css';

export function Navbar() {
  return (
    <nav className="navbar" aria-label="Navegación principal">
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__brand">
          GARAGE22
        </NavLink>
        <ul className="navbar__links" role="list">
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? 'navbar__link navbar__link--active' : 'navbar__link'
              }
            >
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/fechas"
              className={({ isActive }) =>
                isActive ? 'navbar__link navbar__link--active' : 'navbar__link'
              }
            >
              Fechas
            </NavLink>
          </li>
          <li>
            <NavLink to="/login" className="navbar__btn-admin">
              Admin
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}

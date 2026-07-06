import './Footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__copy">
          GARAGE22 — Rock Under, Buenos Aires
        </p>
        <div className="footer__links">
          <a
            href="https://instagram.com/garage22band"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__link"
            aria-label="Instagram de Garage22"
          >
            {/* Instagram icon SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
            <span>Instagram</span>
          </a>
          <a
            href="https://open.spotify.com/artist/garage22"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__link"
            aria-label="Spotify de Garage22"
          >
            {/* Spotify icon SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.623.623 0 0 1-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 1 1-.277-1.215c3.809-.87 7.077-.496 9.712 1.115a.623.623 0 0 1 .207.857zm1.223-2.722a.78.78 0 0 1-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 1 1-.454-1.493c3.632-1.102 8.147-.568 11.234 1.329a.78.78 0 0 1 .257 1.073zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.937.937 0 1 1-.543-1.793c3.524-1.068 9.385-.862 13.084 1.345a.937.937 0 0 1-.924 1.605z"/>
            </svg>
            <span>Spotify</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

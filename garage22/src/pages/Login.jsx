import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, hasFirebaseConfig } from '../services/firebase/config';
import { useAuthContext } from '../context/AuthContext';
import { BotonSello } from '../components/BotonSello';
import './Login.css';

const ADMIN_EMAIL = 'milolegarion@gmail.com';

function mensajeError(code) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Credenciales incorrectas. Verificá tu email y contraseña.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Esperá unos minutos antes de reintentar.';
    case 'auth/network-request-failed':
      return 'Error de conexión. Verificá tu conexión a internet.';
    default:
      return 'Ocurrió un error al iniciar sesión. Intentá de nuevo.';
  }
}

export function Login() {
  const navigate = useNavigate();
  const { user, loading } = useAuthContext();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Si ya está autenticado, redirigir a /admin
  if (!loading && user) return <Navigate to="/admin" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!hasFirebaseConfig || !auth) {
      setError('Firebase no está configurado. Completá el archivo .env.');
      return;
    }
    if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
      setError('Acceso no autorizado.');
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(mensajeError(err.code));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__card">
        <h1 className="login-page__titulo">Acceso<br />Administradores</h1>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-form__campo">
            <label className="login-form__label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="login-form__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={enviando}
            />
          </div>

          <div className="login-form__campo">
            <label className="login-form__label" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className="login-form__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={enviando}
            />
          </div>

          {error && (
            <p className="login-form__error" role="alert">{error}</p>
          )}

          <BotonSello
            type="submit"
            loading={enviando}
            disabled={enviando}
            className="login-form__submit"
            variant="primary"
          >
            Ingresar
          </BotonSello>
        </form>
      </div>
    </div>
  );
}

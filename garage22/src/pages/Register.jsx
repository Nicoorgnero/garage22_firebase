import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, hasFirebaseConfig } from '../services/firebase/config';
import { useAuthContext } from '../context/AuthContext';
import { BotonSello } from '../components/BotonSello';
import './Register.css';

function mensajeError(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con ese email.';
    case 'auth/invalid-email':
      return 'El email ingresado no es válido.';
    case 'auth/weak-password':
      return 'La contraseña es muy débil. Usá al menos 6 caracteres.';
    case 'auth/network-request-failed':
      return 'Error de conexión. Verificá tu conexión a internet.';
    default:
      return 'Ocurrió un error al crear la cuenta. Intentá de nuevo.';
  }
}

export function Register() {
  const { user, loading } = useAuthContext();

  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [confirmar,  setConfirmar]  = useState('');
  const [error,      setError]      = useState(null);
  const [exito,      setExito]      = useState(false);
  const [enviando,   setEnviando]   = useState(false);

  // Si ya está autenticado, redirigir a /admin
  if (!loading && user) return <Navigate to="/admin" replace />;

  async function handleSubmit(e) {
    e.preventDefault();

    if (!hasFirebaseConfig || !auth) {
      setError('Firebase no está configurado. Completá el archivo .env.');
      return;
    }

    if (password !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setError(null);
    setEnviando(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setExito(true);
    } catch (err) {
      setError(mensajeError(err.code));
    } finally {
      setEnviando(false);
    }
  }

  if (exito) {
    return (
      <div className="register-page">
        <div className="register-page__card">
          <h1 className="register-page__titulo">Cuenta<br />Creada</h1>
          <p className="register-page__exito">
            Tu cuenta fue registrada correctamente.
          </p>
          <BotonSello
            as="a"
            href="/login"
            variant="primary"
            className="register-form__submit"
          >
            Ir al login
          </BotonSello>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-page__card">
        <h1 className="register-page__titulo">Nueva<br />Cuenta</h1>

        <form className="register-form" onSubmit={handleSubmit} noValidate>

          <div className="register-form__campo">
            <label className="register-form__label" htmlFor="reg-email">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              className="register-form__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={enviando}
            />
          </div>

          <div className="register-form__campo">
            <label className="register-form__label" htmlFor="reg-password">
              Contraseña
            </label>
            <input
              id="reg-password"
              type="password"
              className="register-form__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              disabled={enviando}
              minLength={6}
            />
          </div>

          <div className="register-form__campo">
            <label className="register-form__label" htmlFor="reg-confirmar">
              Confirmar contraseña
            </label>
            <input
              id="reg-confirmar"
              type="password"
              className="register-form__input"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              autoComplete="new-password"
              required
              disabled={enviando}
            />
          </div>

          {error && (
            <p className="register-form__error" role="alert">{error}</p>
          )}

          <BotonSello
            type="submit"
            loading={enviando}
            disabled={enviando}
            className="register-form__submit"
            variant="primary"
          >
            Registrarse
          </BotonSello>
        </form>

        <p className="register-page__login-link">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="register-page__link">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

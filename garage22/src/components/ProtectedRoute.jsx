import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { Spinner } from './Spinner';

/**
 * Envuelve rutas protegidas.
 * - loading  → muestra spinner (evita FOUC)
 * - !user    → redirige a /login
 * - user     → renderiza children
 */
export function ProtectedRoute({ children }) {
  const { loading, user } = useAuthContext();

  if (loading) return <Spinner size="lg" />;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
}

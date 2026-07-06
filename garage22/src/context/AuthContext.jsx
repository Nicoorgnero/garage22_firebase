import { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';

const AuthContext = createContext(null);

/**
 * Provee { loading, user } a todo el árbol de componentes.
 * Envolver <App> con <AuthProvider> en main.jsx.
 */
export function AuthProvider({ children }) {
  const auth = useAuth();
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook de conveniencia. Lanza error si se usa fuera del provider.
 */
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuthContext debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}

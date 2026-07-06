import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase/config';

/**
 * Hook que encapsula onAuthStateChanged.
 * Expone { loading, user }:
 *   loading = true  → Firebase aún no resolvió el estado inicial
 *   user    = User  → sesión activa
 *   user    = null  → sin sesión
 */
export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setUser]       = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    // Limpieza del listener al desmontar
    return () => unsubscribe();
  }, []);

  return { loading, user };
}

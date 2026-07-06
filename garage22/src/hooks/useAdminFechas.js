import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, hasFirebaseConfig } from '../services/firebase/config';

/**
 * Hook para el listado de administración.
 * Muestra TODAS las fechas (pasadas y futuras), orden descendente.
 * Retorna { fechas, loading, error }
 */
export function useAdminFechas() {
  const [fechas,  setFechas]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!hasFirebaseConfig || !db) {
      setLoading(false);
      return;
    }

    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        setLoading(false);
        setError(new Error('No se pudo conectar a la base de datos. Verificá tu conexión.'));
      }
    }, 8000);

    const q = query(
      collection(db, 'fechas'),
      orderBy('fechaHora', 'desc'),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        resolved = true;
        clearTimeout(timeout);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFechas(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        resolved = true;
        clearTimeout(timeout);
        console.error('[useAdminFechas]', err);
        setError(err);
        setLoading(false);
      },
    );

    return () => { unsubscribe(); clearTimeout(timeout); };
  }, []);

  return { fechas, loading, error };
}

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db, hasFirebaseConfig } from '../services/firebase/config';

/**
 * Hook para el calendario público.
 * Filtra fechas >= ahora, orden ascendente.
 * Retorna { fechas, loading, error }
 */
export function useFechas() {
  const [fechas,  setFechas]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!hasFirebaseConfig || !db) {
      setLoading(false);
      return;
    }

    const ahora = Timestamp.now();
    const q = query(
      collection(db, 'fechas'),
      where('fechaHora', '>=', ahora),
      orderBy('fechaHora', 'asc'),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFechas(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('[useFechas]', err);
        setError(err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { fechas, loading, error };
}

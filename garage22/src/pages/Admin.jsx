import { useState } from 'react';
import { signOut }   from 'firebase/auth';
import { auth }      from '../services/firebase/config';
import { useAuthContext }   from '../context/AuthContext';
import { useAdminFechas }   from '../hooks/useAdminFechas';
import { FormularioFecha }  from '../components/FormularioFecha';
import { FilaFechaAdmin }   from '../components/FilaFechaAdmin';
import { Spinner }          from '../components/Spinner';
import { BotonSello }       from '../components/BotonSello';
import './Admin.css';

export function Admin() {
  const { user }                   = useAuthContext();
  const { fechas, loading, error } = useAdminFechas();
  const [modo, setModo]            = useState('listado');
  const [cerrando, setCerrando]    = useState(false);

  async function cerrarSesion() {
    setCerrando(true);
    try { await signOut(auth); }
    catch (e) { console.error(e); setCerrando(false); }
  }

  const abrirAlta   = () => setModo('alta');
  const editarFecha = (id) => setModo({ editando: id });
  const volverLista = () => setModo('listado');

  return (
    <div className="admin">
      {/* ── Header ── */}
      <header className="admin__header">
        <div className="admin__header-inner">
          <h1 className="admin__titulo">Panel Admin</h1>
          <BotonSello
            onClick={cerrarSesion}
            loading={cerrando}
            disabled={cerrando}
            variant="secondary"
          >
            Cerrar sesión
          </BotonSello>
        </div>
      </header>

      <div className="admin__contenido">
        <div className="admin__inner">

          {/* ── Formulario de alta (modo alta) ── */}
          {modo === 'alta' && (
            <FormularioFecha
              user={user}
              onSuccess={volverLista}
              onCancel={volverLista}
            />
          )}

          {/* ── Botón agregar (visible en modo listado y edición) ── */}
          {modo !== 'alta' && (
            <div className="admin__toolbar">
              <BotonSello onClick={abrirAlta} variant="primary">
                + Agregar fecha
              </BotonSello>
            </div>
          )}

          {/* ── Estados del listado ── */}
          {loading && <Spinner size="lg" />}

          {!loading && error && (
            <p className="admin__mensaje admin__mensaje--error">
              Error al cargar las fechas. Verificá tu conexión.
            </p>
          )}

          {!loading && !error && fechas.length === 0 && (
            <p className="admin__mensaje">
              No hay fechas cargadas aún.
            </p>
          )}

          {/* ── Listado ── */}
          {!loading && !error && fechas.length > 0 && (
            <ul className="admin__lista" role="list">
              {fechas.map((fecha) => (
                <FilaFechaAdmin
                  key={fecha.id}
                  fecha={fecha}
                  modo={modo}
                  user={user}
                  onEditar={editarFecha}
                  onEliminar={(id) => {
                    // La confirmación de baja se maneja dentro de FilaFechaAdmin (Sección 4)
                    // Por ahora se pasa el callback para cuando esté disponible
                    console.log('eliminar', id);
                  }}
                  onGuardado={volverLista}
                  onCancelar={volverLista}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

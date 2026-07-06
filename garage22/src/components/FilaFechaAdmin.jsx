import { useState, useEffect } from 'react';
import { actualizarFecha, eliminarFecha } from '../services/firebase/fechasService';
import { Spinner } from './Spinner';
import './FilaFechaAdmin.css';

const MAX_DESC = 500;

function formatearFecha(timestamp) {
  const d = timestamp.toDate();
  const dia = d.toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const hora = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  return `${dia.charAt(0).toUpperCase() + dia.slice(1)} · ${hora} hs`;
}

/** Convierte Timestamp → "YYYY-MM-DDTHH:mm" en hora LOCAL del browser */
function timestampToLocal(timestamp) {
  const d = timestamp.toDate();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function esUrlValida(url) {
  if (!url) return true;
  try { new URL(url); return true; }
  catch { return false; }
}

export function FilaFechaAdmin({ fecha, modo, user, onEditar, onGuardado, onCancelar }) {
  const { id, lugar, fechaHora, ciudad = '', descripcion = '', linkEntradas = '' } = fecha;
  const estaEditando = modo?.editando === id;

  /* ── Estado de edición inline ── */
  const [campos,    setCampos]    = useState({});
  const [errores,   setErrores]   = useState({});
  const [guardando, setGuardando] = useState(false);
  const [exitoEdit, setExitoEdit] = useState(false);
  const [errorEdit, setErrorEdit] = useState(null);

  /* ── Estado de confirmación de baja ── */
  const [confirmando, setConfirmando] = useState(false);
  const [eliminando,  setEliminando]  = useState(false);
  const [errorBaja,   setErrorBaja]   = useState(null);

  /* Al entrar en modo edición, pre-popular con los valores actuales */
  useEffect(() => {
    if (estaEditando) {
      setCampos({
        lugar,
        fechaHora:    timestampToLocal(fechaHora),
        ciudad,
        descripcion,
        linkEntradas,
      });
      setErrores({});
      setErrorEdit(null);
      setExitoEdit(false);
    }
    /* Al salir de modo edición (modo cambió), resetear confirmación */
    if (!estaEditando) setConfirmando(false);
  }, [estaEditando]); // eslint-disable-line

  function cambiar(e) {
    const { name, value } = e.target;
    setCampos((p) => ({ ...p, [name]: value }));
    setErrores((p) => ({ ...p, [name]: null }));
    setErrorEdit(null);
  }

  function validar() {
    const errs = {};
    if (!campos.lugar?.trim())  errs.lugar    = 'Obligatorio.';
    if (!campos.fechaHora)      errs.fechaHora = 'Obligatorio.';
    if (!esUrlValida(campos.linkEntradas)) errs.linkEntradas = 'URL inválida.';
    return errs;
  }

  async function handleGuardar() {
    const errs = validar();
    if (Object.keys(errs).length > 0) { setErrores(errs); return; }
    setGuardando(true);
    try {
      await actualizarFecha(id, campos, user.uid);
      setExitoEdit(true);
      setTimeout(() => { setExitoEdit(false); onGuardado(); }, 3000);
    } catch (err) {
      console.error('[FilaFechaAdmin edit]', err);
      setErrorEdit('No se pudo guardar. Intentá de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  async function handleConfirmarBaja() {
    setEliminando(true);
    try {
      await eliminarFecha(id);
      /* onSnapshot elimina la fila — no hace falta feedback textual */
    } catch (err) {
      console.error('[FilaFechaAdmin baja]', err);
      setErrorBaja('No se pudo eliminar. Intentá de nuevo.');
      setConfirmando(false);
    } finally {
      setEliminando(false);
    }
  }

  /* ────────────────────────────────────────────────────────────────
     RENDER
  ──────────────────────────────────────────────────────────────── */
  return (
    <li className={`fila-admin${estaEditando ? ' fila-admin--editando' : ''}`}>

      {estaEditando ? (
        /* ── MODO EDICIÓN INLINE ── */
        <div className="fila-admin__edicion">
          <div className="fila-admin__edicion-campos">

            <div className="fila-admin__edicion-campo">
              <label className="fila-admin__edicion-label" htmlFor={`lugar-${id}`}>Venue *</label>
              <input id={`lugar-${id}`} name="lugar" type="text"
                className={`fila-admin__edicion-input${errores.lugar ? ' fila-admin__edicion-input--error' : ''}`}
                value={campos.lugar ?? ''} onChange={cambiar} disabled={guardando} maxLength={120}
              />
              {errores.lugar && <span className="fila-admin__edicion-err">{errores.lugar}</span>}
            </div>

            <div className="fila-admin__edicion-campo">
              <label className="fila-admin__edicion-label" htmlFor={`fechaHora-${id}`}>Fecha y hora *</label>
              <input id={`fechaHora-${id}`} name="fechaHora" type="datetime-local"
                className={`fila-admin__edicion-input${errores.fechaHora ? ' fila-admin__edicion-input--error' : ''}`}
                value={campos.fechaHora ?? ''} onChange={cambiar} disabled={guardando}
                style={{ colorScheme: 'dark' }}
              />
              {errores.fechaHora && <span className="fila-admin__edicion-err">{errores.fechaHora}</span>}
            </div>

            <div className="fila-admin__edicion-campo">
              <label className="fila-admin__edicion-label" htmlFor={`ciudad-${id}`}>Ciudad</label>
              <input id={`ciudad-${id}`} name="ciudad" type="text"
                className="fila-admin__edicion-input"
                value={campos.ciudad ?? ''} onChange={cambiar} disabled={guardando} maxLength={80}
              />
            </div>

            <div className="fila-admin__edicion-campo">
              <label className="fila-admin__edicion-label" htmlFor={`descripcion-${id}`}>
                Descripción <span className="fila-admin__edicion-contador">({(campos.descripcion ?? '').length}/{MAX_DESC})</span>
              </label>
              <textarea id={`descripcion-${id}`} name="descripcion"
                className="fila-admin__edicion-input fila-admin__edicion-textarea"
                value={campos.descripcion ?? ''} onChange={cambiar}
                disabled={guardando} maxLength={MAX_DESC} rows={2}
              />
            </div>

            <div className="fila-admin__edicion-campo">
              <label className="fila-admin__edicion-label" htmlFor={`linkEntradas-${id}`}>Link a entradas</label>
              <input id={`linkEntradas-${id}`} name="linkEntradas" type="url"
                className={`fila-admin__edicion-input${errores.linkEntradas ? ' fila-admin__edicion-input--error' : ''}`}
                value={campos.linkEntradas ?? ''} onChange={cambiar} disabled={guardando}
                placeholder="https://..."
              />
              {errores.linkEntradas && <span className="fila-admin__edicion-err">{errores.linkEntradas}</span>}
            </div>
          </div>

          {/* Feedback edición */}
          {errorEdit && <p className="fila-admin__feedback fila-admin__feedback--error" role="alert">{errorEdit}</p>}
          {exitoEdit && <p className="fila-admin__feedback fila-admin__feedback--exito" role="status">Show actualizado ✓</p>}

          {/* Botones edición */}
          <div className="fila-admin__acciones">
            <button
              className="fila-admin__btn fila-admin__btn--editar"
              onClick={handleGuardar}
              disabled={guardando}
              aria-busy={guardando}
            >
              {guardando ? <Spinner size="sm" /> : 'Guardar'}
            </button>
            <button
              className="fila-admin__btn fila-admin__btn--cancelar"
              onClick={onCancelar}
              disabled={guardando}
            >
              Cancelar
            </button>
          </div>
        </div>

      ) : (
        /* ── MODO LECTURA ── */
        <>
          <div className="fila-admin__info">
            <span className="fila-admin__lugar">{lugar}</span>
            <span className="fila-admin__fecha">{formatearFecha(fechaHora)}</span>
            <div className="fila-admin__badges">
              {ciudad       && <span className="fila-admin__badge">{ciudad}</span>}
              {descripcion  && <span className="fila-admin__badge fila-admin__badge--info">📝 Desc.</span>}
              {linkEntradas && <span className="fila-admin__badge fila-admin__badge--link">🎟 Entradas</span>}
            </div>
          </div>

          <div className="fila-admin__acciones">
            {!confirmando ? (
              <>
                <button
                  className="fila-admin__btn fila-admin__btn--editar"
                  onClick={() => onEditar(id)}
                  aria-label={`Editar ${lugar}`}
                >
                  Editar
                </button>
                <button
                  className="fila-admin__btn fila-admin__btn--eliminar"
                  onClick={() => { setConfirmando(true); setErrorBaja(null); }}
                  aria-label={`Eliminar ${lugar}`}
                >
                  Eliminar
                </button>
              </>
            ) : (
              /* ── CONFIRMACIÓN DE BAJA ── */
              <>
                <button
                  className="fila-admin__btn fila-admin__btn--confirmar"
                  onClick={handleConfirmarBaja}
                  disabled={eliminando}
                  aria-busy={eliminando}
                >
                  {eliminando ? <Spinner size="sm" /> : '¿Confirmar?'}
                </button>
                <button
                  className="fila-admin__btn fila-admin__btn--cancelar"
                  onClick={() => { setConfirmando(false); setErrorBaja(null); }}
                  disabled={eliminando}
                >
                  Cancelar
                </button>
              </>
            )}
          </div>

          {errorBaja && (
            <p className="fila-admin__feedback fila-admin__feedback--error" role="alert">{errorBaja}</p>
          )}
        </>
      )}
    </li>
  );
}

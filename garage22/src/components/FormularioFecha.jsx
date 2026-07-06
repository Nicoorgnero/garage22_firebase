import { useState } from 'react';
import { crearFecha } from '../services/firebase/fechasService';
import { BotonSello } from './BotonSello';
import './FormularioFecha.css';

const MAX_DESC = 500;

function esUrlValida(url) {
  if (!url) return true;
  try { new URL(url); return true; }
  catch { return false; }
}

function mensajeErrorFirestore(err) {
  const code = err?.code ?? '';
  if (code === 'permission-denied') {
    return 'Sin permiso para escribir. Las reglas de Firestore no están deployadas — ejecutá: firebase deploy --only firestore:rules';
  }
  if (
    code === 'unavailable' ||
    code === 'failed-precondition' ||
    err?.message?.includes('billing') ||
    err?.message?.includes('API')
  ) {
    return 'Firestore no está habilitado en el proyecto. Creá la base de datos en Firebase Console y activá billing.';
  }
  if (code === 'unauthenticated') {
    return 'Tu sesión expiró. Cerrá e ingresá de nuevo.';
  }
  return `Error al guardar (${code || 'desconocido'}). Revisá la consola del navegador para más detalles.`;
}

const EMPTY = { lugar: '', fechaHora: '', ciudad: '', descripcion: '', linkEntradas: '' };

export function FormularioFecha({ user, onSuccess, onCancel }) {
  const [campos,   setCampos]   = useState(EMPTY);
  const [errores,  setErrores]  = useState({});
  const [guardando, setGuardando] = useState(false);
  const [exito,    setExito]    = useState(false);
  const [errorApi, setErrorApi] = useState(null);

  function cambiar(e) {
    const { name, value } = e.target;
    setCampos((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({ ...prev, [name]: null }));
    setErrorApi(null);
  }

  function validar() {
    const errs = {};
    if (!campos.lugar.trim())    errs.lugar    = 'El venue es obligatorio.';
    if (!campos.fechaHora)       errs.fechaHora = 'La fecha y hora son obligatorias.';
    if (!esUrlValida(campos.linkEntradas))
      errs.linkEntradas = 'Ingresá una URL válida o dejá el campo vacío.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validar();
    if (Object.keys(errs).length > 0) { setErrores(errs); return; }

    setGuardando(true);
    try {
      await crearFecha(campos, user.uid);
      setExito(true);
      setCampos(EMPTY);
      setTimeout(() => {
        setExito(false);
        onSuccess();
      }, 3000);
    } catch (err) {
      console.error('[FormularioFecha]', err);
      setErrorApi(mensajeErrorFirestore(err));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form className="formulario-fecha" onSubmit={handleSubmit} noValidate>
      <h2 className="formulario-fecha__titulo">Nueva Fecha</h2>

      {/* Venue */}
      <div className="formulario-fecha__campo">
        <label className="formulario-fecha__label" htmlFor="ff-lugar">
          Venue <span aria-hidden="true">*</span>
        </label>
        <input
          id="ff-lugar" name="lugar" type="text"
          className={`formulario-fecha__input${errores.lugar ? ' formulario-fecha__input--error' : ''}`}
          value={campos.lugar} onChange={cambiar}
          disabled={guardando} maxLength={120}
        />
        {errores.lugar && <p className="formulario-fecha__error-campo">{errores.lugar}</p>}
      </div>

      {/* Fecha y hora */}
      <div className="formulario-fecha__campo">
        <label className="formulario-fecha__label" htmlFor="ff-fechaHora">
          Fecha y hora <span aria-hidden="true">*</span>
        </label>
        <input
          id="ff-fechaHora" name="fechaHora" type="datetime-local"
          className={`formulario-fecha__input${errores.fechaHora ? ' formulario-fecha__input--error' : ''}`}
          value={campos.fechaHora} onChange={cambiar}
          disabled={guardando}
        />
        {errores.fechaHora && <p className="formulario-fecha__error-campo">{errores.fechaHora}</p>}
      </div>

      {/* Ciudad */}
      <div className="formulario-fecha__campo">
        <label className="formulario-fecha__label" htmlFor="ff-ciudad">Ciudad</label>
        <input
          id="ff-ciudad" name="ciudad" type="text"
          className="formulario-fecha__input"
          value={campos.ciudad} onChange={cambiar}
          disabled={guardando} maxLength={80}
        />
      </div>

      {/* Descripción */}
      <div className="formulario-fecha__campo">
        <label className="formulario-fecha__label" htmlFor="ff-descripcion">
          Descripción
        </label>
        <textarea
          id="ff-descripcion" name="descripcion"
          className="formulario-fecha__input formulario-fecha__textarea"
          value={campos.descripcion} onChange={cambiar}
          disabled={guardando} maxLength={MAX_DESC} rows={3}
        />
        <p className="formulario-fecha__contador">
          {campos.descripcion.length}/{MAX_DESC}
        </p>
      </div>

      {/* Link a entradas */}
      <div className="formulario-fecha__campo">
        <label className="formulario-fecha__label" htmlFor="ff-linkEntradas">
          Link a entradas
        </label>
        <input
          id="ff-linkEntradas" name="linkEntradas" type="url"
          className={`formulario-fecha__input${errores.linkEntradas ? ' formulario-fecha__input--error' : ''}`}
          value={campos.linkEntradas} onChange={cambiar}
          disabled={guardando} placeholder="https://..."
        />
        {errores.linkEntradas && <p className="formulario-fecha__error-campo">{errores.linkEntradas}</p>}
      </div>

      {/* Feedback */}
      {errorApi && <p className="formulario-fecha__error-api" role="alert">{errorApi}</p>}
      {exito    && <p className="formulario-fecha__exito"    role="status">¡Fecha guardada correctamente!</p>}

      {/* Acciones */}
      <div className="formulario-fecha__acciones">
        <BotonSello type="submit" loading={guardando} disabled={guardando} variant="primary">
          Guardar
        </BotonSello>
        <BotonSello type="button" onClick={onCancel} disabled={guardando} variant="secondary">
          Cancelar
        </BotonSello>
      </div>
    </form>
  );
}

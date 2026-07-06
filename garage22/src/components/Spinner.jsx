import './Spinner.css';

export function Spinner({ size = 'md' }) {
  return (
    <div className={`spinner spinner--${size}`} role="status" aria-label="Cargando">
      <div className="spinner__ring" />
    </div>
  );
}

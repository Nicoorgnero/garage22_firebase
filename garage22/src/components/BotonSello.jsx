import { Spinner } from './Spinner';
import './BotonSello.css';

/**
 * Botón reutilizable estilo sello/stamp.
 * Props:
 *   as        → 'button' (default) | 'a'
 *   href      → para as='a'
 *   target    → para as='a'
 *   onClick   → para as='button'
 *   disabled  → bool
 *   loading   → bool (muestra spinner inline, deshabilita)
 *   variant   → 'primary' (default, rojo) | 'secondary' (amarillo)
 *   children  → contenido del botón
 */
export function BotonSello({
  as = 'button',
  href,
  target,
  rel,
  onClick,
  disabled = false,
  loading  = false,
  variant  = 'primary',
  className = '',
  children,
  type = 'button',
}) {
  const cls = [
    'boton-sello',
    `boton-sello--${variant}`,
    loading  ? 'boton-sello--loading'  : '',
    disabled ? 'boton-sello--disabled' : '',
    className,
  ].filter(Boolean).join(' ');

  if (as === 'a') {
    return (
      <a
        href={href}
        target={target}
        rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
        className={cls}
        aria-disabled={disabled || loading}
      >
        {loading && <Spinner size="sm" />}
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cls}
      aria-busy={loading}
    >
      {loading && <Spinner size="sm" />}
      <span>{children}</span>
    </button>
  );
}

import { colors, motionTokens, radii } from '@/theme/tokens';

/**
 * Estilos compartidos del panel admin.
 *
 * Regla tipográfica del admin: TODO el texto de interfaz va en la fuente
 * del cuerpo (Lato), en caja normal. La mono queda reservada para CIFRAS
 * (precios, folios) — el admin anterior usaba mono-mayúsculas por todas
 * partes y el usuario lo encontró recargado.
 */

/** Etiqueta de campo de formulario */
export const etiquetaSx = {
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'text.secondary',
  display: 'block',
  mb: 0.5,
} as const;

/** Input / textarea del admin */
export const inputSx = {
  width: '100%',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: `${radii.sm}px`,
  bgcolor: 'background.paper',
  color: 'text.primary',
  fontFamily: 'inherit',
  fontSize: '0.92rem',
  px: 1.25,
  py: 0.9,
  outline: 'none',
  transition: `border-color 0.2s ${motionTokens.easeCss}`,
  '&:focus': { borderColor: colors.teal },
} as const;

/** Input de números: alineado a la derecha (el valor sigue siendo cifra) */
export const inputNumeroSx = { ...inputSx, textAlign: 'right' } as const;

/** Chip/etiqueta pequeña de estado (ej: "Kit Inicial", "Oculto") */
export const chipSx = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.6,
  px: 1.25,
  py: 0.45,
  borderRadius: `${radii.pill}px`,
  fontSize: '0.78rem',
  fontWeight: 600,
  lineHeight: 1.2,
} as const;

/** Botón-ícono cuadrado (guardar, eliminar…) */
export const botonIconoSx = {
  border: 0,
  borderRadius: `${radii.sm}px`,
  width: 34,
  height: 34,
  display: 'grid',
  placeItems: 'center',
  cursor: 'pointer',
  bgcolor: 'transparent',
  color: colors.muted,
  transition: `all 0.2s ${motionTokens.easeCss}`,
} as const;

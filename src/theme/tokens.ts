/**
 * Fuente de verdad del sistema de diseño MundoSIP.
 * Nada de valores mágicos en componentes: todo sale de aquí o del theme.
 */

export const colors = {
  teal: '#204E5F',
  tealDeep: '#132E38',
  tealNight: '#0D2129',
  tan: '#B98A4E',
  tanLight: '#CFA76F',
  tanDark: '#9A7140',
  cream: '#F6F1EA',
  ink: '#14232B',
  muted: '#6B7A82',
  line: '#E4DACE',
  lineDark: 'rgba(246, 241, 234, 0.14)',
  paper: '#FFFFFF',
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 18,
  pill: 999,
} as const;

/** Curva y duraciones compartidas entre CSS y Framer Motion */
export const motionTokens = {
  ease: [0.2, 0.7, 0.2, 1] as [number, number, number, number],
  easeCss: 'cubic-bezier(.2,.7,.2,1)',
  dur: {
    hover: 0.3,
    reveal: 0.8,
    slow: 1.1,
  },
} as const;

export const layout = {
  maxWidth: 1280,
  headerHeight: { mobile: 72, desktop: 88 },
} as const;

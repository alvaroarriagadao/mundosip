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

/**
 * SCRIMS — el velo oscuro que va sobre fotos y video para que el texto
 * encima se lea. (En diseño se le llama "scrim" u overlay.)
 *
 * Cómo ajustarlos: cada `rgba(13, 33, 41, X)` es una parada del degradado
 * y X es cuánto tapa (0 = foto limpia, 1 = color sólido).
 *   · Se ve muy oscuro / "muy azul" → baja los X
 *   · No se lee el texto encima     → sube los X de esa zona
 * El primer degradado va de izquierda a derecha; el segundo, de arriba
 * abajo. Se apilan: el de más arriba queda encima.
 */
const VELO = (o: number) => `rgba(13, 33, 41, ${o})`;

export const scrims = {
  /** Hero del home: el video se ve casi limpio, el texto vive abajo a la izquierda */
  heroVideo: `
    linear-gradient(180deg, ${VELO(0.55)} 0%, ${VELO(0.2)} 34%, ${VELO(0.62)} 100%),
    linear-gradient(90deg, ${VELO(0.42)} 0%, ${VELO(0.1)} 58%, ${VELO(0.02)} 100%)
  `,
  /** Hero de contacto: texto denso a la izquierda, foto a la vista a la derecha */
  heroFoto: `
    linear-gradient(100deg, ${VELO(0.86)} 0%, ${VELO(0.72)} 34%, ${VELO(0.4)} 62%, ${VELO(0.24)} 100%),
    linear-gradient(180deg, ${VELO(0.45)} 0%, ${VELO(0.06)} 45%, ${VELO(0.66)} 100%)
  `,
} as const;

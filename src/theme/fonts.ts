import { Lato, Montserrat, Space_Mono } from 'next/font/google';

/**
 * Display: titulares, navbar y wordmark — geométrica y elegante.
 * Variable font: todos los pesos disponibles sin coste extra.
 */
export const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

/** Cuerpo / lectura ('Lato', Helvetica, Arial — referencia losriosarquitectos) */
export const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-sans',
  display: 'swap',
});

/** Datos, precios, specs, eyebrows — sensación de ficha técnica */
export const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
});

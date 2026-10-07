/**
 * Precio del kit y promoción vigente.
 *
 * La promoción es UNA para todos los modelos ("Descuento primavera 3%"):
 * el equipo la prende o apaga desde /admin/modelos y el sitio muestra el
 * precio tachado junto al rebajado. Es independiente del descuento de
 * cada plantilla de cotización, aunque desde el panel se puede copiar
 * a todas con un clic para que ambos digan lo mismo.
 */

export interface Promocion {
  nombre: string;
  /** Porcentaje 0–99.99 */
  descuentoPct: number;
  activa: boolean;
}

export const SIN_PROMOCION: Promocion = { nombre: '', descuentoPct: 0, activa: false };

/**
 * Leyenda que acompaña al precio del kit en el sitio. Si el equipo
 * decide mostrar precios netos, basta con cambiar este texto.
 */
export const NOTA_IVA = 'IVA incluido';

export function promocionVigente(p: Promocion | null | undefined): p is Promocion {
  return !!p && p.activa && p.descuentoPct > 0;
}

/** Precio rebajado, redondeado a pesos */
export function precioConPromocion(precio: number, p: Promocion): number {
  return Math.round(precio * (1 - p.descuentoPct / 100));
}

/** "3" → "3%", "2.5" → "2,5%" (es-CL) */
export function formatPct(pct: number): string {
  return `${pct.toLocaleString('es-CL', { maximumFractionDigits: 2 })}%`;
}

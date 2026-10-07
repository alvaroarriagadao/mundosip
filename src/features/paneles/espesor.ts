import type { PanelProducto } from './panel.types';

/**
 * Espesor del OSB como número de milímetros. El admin lo escribe a mano
 * ("9.5 mm", "11,1 mm", "11.1"), así que se normaliza la coma decimal.
 */
export function mmOsb(panel: Pick<PanelProducto, 'espesorOsb'>): number | null {
  const match = panel.espesorOsb?.replace(',', '.').match(/\d+(\.\d+)?/);
  const mm = match ? Number(match[0]) : NaN;
  return Number.isFinite(mm) && mm > 0 ? mm : null;
}

/** "OSB 9.5 mm" — siempre con punto decimal, como el resto del catálogo */
export function etiquetaOsb(mm: number): string {
  return `OSB ${mm} mm`;
}

/**
 * Tono de color por espesor: el más delgado 0, el siguiente 1, etc.
 * Se calcula sobre todo el catálogo para que el mismo espesor tenga
 * siempre el mismo color en todas las tarjetas.
 */
export function tonosPorEspesor(paneles: Pick<PanelProducto, 'espesorOsb'>[]): Map<number, number> {
  const distintos = [...new Set(paneles.map(mmOsb).filter((mm): mm is number => mm != null))].sort((a, b) => a - b);
  return new Map(distintos.map((mm, i) => [mm, i]));
}

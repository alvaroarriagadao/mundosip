import type {
  ItemCotizacion,
  PlantillaCotizacion,
  SeccionCotizacion,
  TotalesCotizacion,
} from './cotizacion.types';

/**
 * Aritmética de la cotización — compartida entre el configurador (total en
 * vivo) y la API (total definitivo). El servidor SIEMPRE recalcula: del
 * cliente solo viajan los ids de las secciones elegidas, nunca precios.
 *
 * Todo se redondea a pesos enteros línea por línea, para que el PDF cierre
 * exacto: la suma de los ítems visibles ES el subtotal visible.
 */

export function totalItem(item: Pick<ItemCotizacion, 'cantidad' | 'precioUnitario'>): number {
  return Math.round(item.cantidad * item.precioUnitario);
}

export function subtotalSeccion(seccion: Pick<SeccionCotizacion, 'items'>): number {
  return seccion.items.reduce((suma, item) => suma + totalItem(item), 0);
}

/**
 * Secciones que entran a la cotización: las obligatorias + las marcadas.
 * Las obligatorias (el kit de autoconstrucción) van PRIMERO aunque en el
 * Excel sean la N°13: son la base sobre la que se suma todo lo demás, y
 * así se leen en el PDF.
 */
export function seccionesElegidas(
  plantilla: PlantillaCotizacion,
  idsMarcados: ReadonlySet<string>,
): SeccionCotizacion[] {
  const elegidas = plantilla.secciones.filter((s) => s.obligatoria || idsMarcados.has(s.id));
  return [...elegidas.filter((s) => s.obligatoria), ...elegidas.filter((s) => !s.obligatoria)];
}

export function calcularTotales(
  plantilla: Pick<PlantillaCotizacion, 'descuentoPct' | 'ivaPct'>,
  secciones: readonly SeccionCotizacion[],
): TotalesCotizacion {
  const neto = secciones.reduce((suma, s) => suma + subtotalSeccion(s), 0);
  const descuento = Math.round((neto * plantilla.descuentoPct) / 100);
  const netoConDescuento = neto - descuento;
  const iva = Math.round((netoConDescuento * plantilla.ivaPct) / 100);
  return { neto, descuento, netoConDescuento, iva, total: netoConDescuento + iva };
}

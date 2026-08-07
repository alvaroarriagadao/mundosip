/**
 * Contratos del sistema de cotizaciones llave en mano.
 *
 * Una PLANTILLA (por modelo × kit) espeja los Excel del equipo:
 * secciones N°1..N°12, cada una con ítems cantidad × precio unitario.
 * Los totales jamás se guardan en la plantilla: se calculan siempre
 * (ver calcular.ts), así nunca vuelve a pasar que un total quede
 * desactualizado a mano como en las planillas.
 */

export type KitCotizacion = 'inicial' | 'full';

export const KIT_LABEL: Record<KitCotizacion, string> = {
  inicial: 'Kit Inicial',
  full: 'Kit Full',
};

export interface ItemCotizacion {
  id: string;
  /** "1.1" — numeración visible en el PDF */
  codigo: string | null;
  descripcion: string;
  /** gl, m², m³, ml, uni… tal como la maneja el equipo */
  unidad: string;
  cantidad: number;
  /** CLP enteros */
  precioUnitario: number;
}

export interface SeccionCotizacion {
  id: string;
  /** "N°1" */
  codigo: string;
  nombre: string;
  /** true = el cliente no puede desmarcarla (sin esto no hay casa) */
  obligatoria: boolean;
  items: ItemCotizacion[];
}

export interface PlantillaCotizacion {
  id: string;
  modeloSlug: string;
  kit: KitCotizacion;
  /** "MODELO TULIPÁN 80M2 LLAVE EN MANO APOYO" */
  titulo: string;
  descuentoNombre: string | null;
  descuentoPct: number;
  ivaPct: number;
  validezDias: number;
  condicionesPago: string | null;
  notas: string[];
  /** m² del modelo: el "costo x m²" de cada emisión = neto c/desc ÷ esto */
  superficieM2: number | null;
  secciones: SeccionCotizacion[];
}

export interface TotalesCotizacion {
  /** Suma de las secciones elegidas */
  neto: number;
  descuento: number;
  netoConDescuento: number;
  iva: number;
  total: number;
}

export interface DatosClienteCotizacion {
  nombre: string;
  email: string;
  telefono?: string | null;
}

/**
 * Foto completa de una cotización al momento de emitirse: si mañana
 * cambian los precios, el folio emitido sigue siendo reproducible.
 * Es lo que se guarda en cotizaciones_emitidas.snapshot y lo que
 * consume el PDF.
 */
export interface SnapshotCotizacion {
  folio: string;
  fechaISO: string;
  modeloSlug: string;
  kit: KitCotizacion;
  titulo: string;
  descuentoNombre: string | null;
  descuentoPct: number;
  ivaPct: number;
  validezDias: number;
  condicionesPago: string | null;
  notas: string[];
  cliente: DatosClienteCotizacion;
  /** Solo las secciones que el cliente eligió, con sus ítems y precios */
  secciones: SeccionCotizacion[];
  /** Cuántas secciones tenía la plantilla al emitir (para marcar alcance parcial) */
  seccionesTotales?: number;
  totales: TotalesCotizacion;
}

/**
 * Producto "panel SIP" de la tienda /paneles.
 *
 * Espejo 1:1 de la tabla `paneles` en Neon: cada campo es un campo del
 * formulario de /admin/paneles. Publicar un panel nuevo = llenar esto.
 */
export interface PanelProducto {
  id: string;
  /** URL y clave estable: panel-sip-94-mm */
  slug: string;
  /** "Panel SIP 94 mm" */
  nombre: string;
  precioClp: number;
  /** "1220 x 2440 x 94 mm" */
  dimensiones: string | null;
  /** "9.5 mm" */
  espesorOsb: string | null;
  /** "75 mm" */
  espesorEps: string | null;
  /** "15 kg/m³" */
  densidadEps: string | null;
  /** '2×3" calibrada' */
  aptoParaMadera: string | null;
  imagenUrl: string | null;
  descripcion: string | null;
  /** false = oculto en la tienda sin borrarlo */
  publicado: boolean;
  orden: number;
}

/** Línea del carrito / del pedido emitido */
export interface LineaPedido {
  slug: string;
  nombre: string;
  precioClp: number;
  cantidad: number;
}

/** Lo que se guarda en pedidos_paneles.snapshot */
export interface SnapshotPedido {
  folio: string;
  fechaISO: string;
  cliente: { nombre: string; email: string; telefono?: string | null };
  lineas: LineaPedido[];
  totalClp: number;
}

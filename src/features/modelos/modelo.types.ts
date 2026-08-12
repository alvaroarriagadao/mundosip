/**
 * Estructura FIJA de un modelo de casa (kit de autoconstrucción).
 *
 * Contrato con el futuro panel de administración (fase 2, Payload):
 * cada campo será un campo del formulario. Publicar un modelo nuevo =
 * llenar estos campos + subir renders. Cero código.
 */

export interface ImagenModelo {
  url: string;
  alt: string;
}

export interface Modelo {
  id: string;
  /** URL: /modelos/tulipan */
  slug: string;
  nombre: string;
  superficieM2: number;
  habitaciones: number;
  banos: number;
  /** Precio del kit de autoconstrucción, CLP sin decimales */
  precioDesdeCLP: number;
  /** 1–2 líneas para la card del listado (la cara "desde afuera") */
  resumen: string;
  /** Párrafo de presentación en la ficha */
  descripcion: string;
  /** Puntos fuertes del diseño, ordenados (4–8) */
  caracteristicas: string[];
  /** Ítems del Kit Inicial, ordenados (la base que traen ambos kits) */
  kitInicial: string[];
  /**
   * SOLO lo que el Kit Full agrega sobre el Inicial.
   * Se modela como "extras" y no como lista completa para que la
   * diferencia entre kits sea evidente y el admin no duplique datos.
   * El primero se muestra como diferenciador destacado.
   */
  kitFullExtras: string[];
  /** Render que representa al modelo en listado y hero de la ficha */
  portada: ImagenModelo;
  /** Galería de la ficha (2–12 imágenes) */
  galeria: ImagenModelo[];
  destacado: boolean;
  /** false = borrador: no aparece en el sitio, pero se puede previsualizar */
  publicado: boolean;
  orden: number;
}

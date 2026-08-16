/**
 * Estructura FIJA de un proyecto construido.
 *
 * Este shape es el contrato entre el sitio y el panel /admin/proyectos:
 * cada campo de esta interfaz es un campo del formulario que llena el
 * equipo no técnico. Agregar un proyecto nuevo = llenar estos campos +
 * subir fotos. Nunca requiere tocar código.
 */

export interface ImagenProyecto {
  url: string;
  alt: string;
}

export interface RegionProyecto {
  /** Para el filtro y la URL: "los-rios" */
  slug: string;
  /** Para mostrar: "Los Ríos" */
  nombre: string;
}

/** Obra entregada, o todavía en construcción (lleva etiqueta en el sitio) */
export type EstadoProyecto = 'terminada' | 'en_proceso';

export interface Proyecto {
  id: string;
  /** URL: /proyecto/casa-lago-panguipulli */
  slug: string;
  nombre: string;
  region: RegionProyecto;
  /** "Panguipulli, Región de Los Ríos" */
  ubicacion: string;
  superficieM2: number;
  anoDiseno: number;
  anoConstruccion: number;
  /** Una línea para la card de la galería */
  resumen: string;
  /** Párrafo grande destacado de la reseña (2–4 frases) */
  resenaDestacada: string;
  /** Párrafo de apoyo, más pequeño (2–3 frases) */
  resena: string;
  /** Imagen hero del detalle y de la card */
  portada: ImagenProyecto;
  /** Imagen que acompaña la reseña */
  imagenResena: ImagenProyecto;
  /** Mosaico + lightbox (3 a 12 imágenes) */
  galeria: ImagenProyecto[];
  /** Link de YouTube/Vimeo opcional; se embebe en la página del proyecto */
  videoUrl: string | null;
  estado: EstadoProyecto;
  destacado: boolean;
  /** false = borrador: solo visible desde el panel con "Previsualizar" */
  publicado: boolean;
  orden: number;
}

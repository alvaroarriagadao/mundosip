import { neon } from '@neondatabase/serverless';

import type { EstadoProyecto, Proyecto, RegionProyecto } from './proyecto.types';

/**
 * Acceso a datos de los proyectos construidos — SOLO servidor.
 *
 * Los administra el equipo en /admin/proyectos. Un proyecto con
 * `publicado = false` es un borrador: no sale en el sitio, pero se
 * puede previsualizar desde el panel con `?preview=1`.
 */

function sqlCliente() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Falta DATABASE_URL');
  return neon(url);
}

/** Imagen estándar mientras un proyecto nuevo no tiene fotos */
export const PORTADA_DEFECTO_PROYECTO = '/images/proyectos/casa-lago-panguipulli/portada.jpg';

interface FilaProyecto {
  id: string;
  slug: string;
  nombre: string;
  region_slug: string;
  region_nombre: string;
  ubicacion: string;
  superficie_m2: number;
  ano_diseno: number;
  ano_construccion: number;
  resumen: string;
  resena_destacada: string;
  resena: string;
  video_url: string | null;
  video_en_resena: boolean;
  estado: string;
  destacado: boolean;
  publicado: boolean;
  orden: number;
}

interface FilaImagen {
  proyecto_id: string;
  tipo: string;
  url: string;
  alt: string | null;
  orden: number;
}

const COLUMNAS = `id, slug, nombre, region_slug, region_nombre, ubicacion, superficie_m2,
                  ano_diseno, ano_construccion, resumen, resena_destacada, resena,
                  video_url, video_en_resena, estado, destacado, publicado, orden`;

/** Ensambla los proyectos con sus imágenes en 1 consulta extra, no N+1 */
async function armar(filas: FilaProyecto[]): Promise<Proyecto[]> {
  if (filas.length === 0) return [];
  const sql = sqlCliente();
  const ids = filas.map((f) => f.id);

  const imagenes = (await sql`
    select proyecto_id, tipo, url, alt, orden from proyecto_imagenes
    where proyecto_id = any(${ids}) order by orden
  `) as FilaImagen[];

  return filas.map((p) => {
    const suyas = imagenes.filter((i) => i.proyecto_id === p.id);
    const portada = suyas.find((i) => i.tipo === 'portada');
    const resena = suyas.find((i) => i.tipo === 'resena');
    const galeria = suyas.filter((i) => i.tipo === 'galeria');

    return {
      id: p.id,
      slug: p.slug,
      nombre: p.nombre,
      region: { slug: p.region_slug, nombre: p.region_nombre },
      ubicacion: p.ubicacion,
      superficieM2: p.superficie_m2,
      anoDiseno: p.ano_diseno,
      anoConstruccion: p.ano_construccion,
      resumen: p.resumen,
      resenaDestacada: p.resena_destacada,
      resena: p.resena,
      portada: {
        url: portada?.url ?? PORTADA_DEFECTO_PROYECTO,
        alt: portada?.alt ?? `Fotografía del proyecto ${p.nombre}`,
      },
      // Sin foto propia de reseña, se reutiliza la portada: la página nunca queda rota
      imagenResena: {
        url: resena?.url ?? portada?.url ?? PORTADA_DEFECTO_PROYECTO,
        alt: resena?.alt ?? `Fotografía del proyecto ${p.nombre}`,
      },
      galeria: galeria.map((i) => ({ url: i.url, alt: i.alt ?? p.nombre })),
      videoUrl: p.video_url,
      videoEnResena: p.video_en_resena,
      estado: (p.estado === 'en_proceso' ? 'en_proceso' : 'terminada') as EstadoProyecto,
      destacado: p.destacado,
      publicado: p.publicado,
      orden: p.orden,
    };
  });
}

/** Galería pública: solo proyectos publicados */
export async function getProyectosPublicados(): Promise<Proyecto[]> {
  const sql = sqlCliente();
  const filas = (await sql.query(
    `select ${COLUMNAS} from proyectos where publicado order by orden, nombre`,
  )) as FilaProyecto[];
  return armar(filas);
}

/**
 * Un proyecto por su slug. `incluirBorradores` solo lo usa el admin
 * para previsualizar antes de publicar.
 */
export async function getProyectoPorSlug(
  slug: string,
  incluirBorradores = false,
): Promise<Proyecto | undefined> {
  const sql = sqlCliente();
  const filas = (await sql.query(
    `select ${COLUMNAS} from proyectos where slug = $1 ${incluirBorradores ? '' : 'and publicado'}`,
    [slug],
  )) as FilaProyecto[];
  const [proyecto] = await armar(filas);
  return proyecto;
}

/** Todos los proyectos, publicados o no (panel) */
export async function getProyectosAdmin(): Promise<Proyecto[]> {
  const sql = sqlCliente();
  const filas = (await sql.query(
    `select ${COLUMNAS} from proyectos order by orden, nombre`,
  )) as FilaProyecto[];
  return armar(filas);
}

/** Un proyecto por id, para el editor del panel */
export async function getProyectoPorId(id: string): Promise<Proyecto | undefined> {
  const sql = sqlCliente();
  const filas = (await sql.query(`select ${COLUMNAS} from proyectos where id = $1`, [id])) as FilaProyecto[];
  const [proyecto] = await armar(filas);
  return proyecto;
}

/** Regiones con al menos un proyecto publicado, para el filtro de la galería */
export async function getRegionesConProyectos(): Promise<RegionProyecto[]> {
  const sql = sqlCliente();
  const filas = (await sql`
    select distinct region_slug, region_nombre from proyectos where publicado
  `) as Array<{ region_slug: string; region_nombre: string }>;
  return filas
    .map((f) => ({ slug: f.region_slug, nombre: f.region_nombre }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

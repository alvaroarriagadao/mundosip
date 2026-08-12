import { neon } from '@neondatabase/serverless';

import type { Modelo } from './modelo.types';

/**
 * Acceso a datos de los modelos de casa — SOLO servidor.
 *
 * Los administra el equipo en /admin/modelos: cada modelo se arma con
 * su ficha, sus características, los ítems de cada kit y su galería.
 * Un modelo con `publicado = false` es un borrador: no sale en el
 * sitio, pero se puede previsualizar desde el panel.
 */

function sqlCliente() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Falta DATABASE_URL');
  return neon(url);
}

/** Imagen estándar cuando un modelo todavía no tiene portada */
export const PORTADA_DEFECTO = '/images/modelos/tulipan/portada.jpg';

interface FilaModelo {
  id: string;
  slug: string;
  nombre: string;
  superficie_m2: number;
  habitaciones: number;
  banos: number;
  precio_desde_clp: number;
  resumen: string | null;
  descripcion: string | null;
  destacado: boolean;
  publicado: boolean;
  orden: number;
}

interface FilaImagen {
  modelo_id: string;
  url: string;
  alt: string | null;
  tipo: string;
  orden: number;
}

interface FilaTexto {
  modelo_id: string;
  texto: string;
}

interface FilaKit extends FilaTexto {
  tipo: string;
}

const COLUMNAS = `id, slug, nombre, superficie_m2, habitaciones, banos, precio_desde_clp,
                  resumen, descripcion, destacado, publicado, orden`;

/** Ensambla los modelos con sus listas en 3 consultas, no N+1 */
async function armar(filas: FilaModelo[]): Promise<Modelo[]> {
  if (filas.length === 0) return [];
  const sql = sqlCliente();
  const ids = filas.map((f) => f.id);

  const [imagenes, caracteristicas, kits] = (await Promise.all([
    sql`select modelo_id, url, alt, tipo, orden from modelo_imagenes
        where modelo_id = any(${ids}) order by orden`,
    sql`select modelo_id, texto from modelo_caracteristicas
        where modelo_id = any(${ids}) order by orden`,
    sql`select modelo_id, texto, tipo from kit_items
        where modelo_id = any(${ids}) order by orden`,
  ])) as [FilaImagen[], FilaTexto[], FilaKit[]];

  return filas.map((m) => {
    const suyas = imagenes.filter((i) => i.modelo_id === m.id);
    const portada = suyas.find((i) => i.tipo === 'portada');
    const galeria = suyas.filter((i) => i.tipo !== 'portada');

    return {
      id: m.id,
      slug: m.slug,
      nombre: m.nombre,
      superficieM2: m.superficie_m2,
      habitaciones: m.habitaciones,
      banos: m.banos,
      precioDesdeCLP: m.precio_desde_clp,
      resumen: m.resumen ?? '',
      descripcion: m.descripcion ?? '',
      caracteristicas: caracteristicas.filter((c) => c.modelo_id === m.id).map((c) => c.texto),
      kitInicial: kits.filter((k) => k.modelo_id === m.id && k.tipo === 'inicial').map((k) => k.texto),
      kitFullExtras: kits.filter((k) => k.modelo_id === m.id && k.tipo === 'full_extra').map((k) => k.texto),
      portada: {
        url: portada?.url ?? PORTADA_DEFECTO,
        alt: portada?.alt ?? `Render del modelo ${m.nombre}`,
      },
      galeria: galeria.map((i) => ({ url: i.url, alt: i.alt ?? m.nombre })),
      destacado: m.destacado,
      publicado: m.publicado,
      orden: m.orden,
    };
  });
}

/** Catálogo público: solo modelos publicados */
export async function getModelosPublicados(): Promise<Modelo[]> {
  const sql = sqlCliente();
  const filas = (await sql.query(
    `select ${COLUMNAS} from modelos where publicado order by orden, precio_desde_clp`,
  )) as FilaModelo[];
  return armar(filas);
}

/**
 * Un modelo por su slug. `incluirBorradores` solo lo usa el admin para
 * previsualizar antes de publicar.
 */
export async function getModeloPorSlug(
  slug: string,
  incluirBorradores = false,
): Promise<Modelo | undefined> {
  const sql = sqlCliente();
  const filas = (await sql.query(
    `select ${COLUMNAS} from modelos where slug = $1 ${incluirBorradores ? '' : 'and publicado'}`,
    [slug],
  )) as FilaModelo[];
  const [modelo] = await armar(filas);
  return modelo;
}

/** Todos los modelos, publicados o no (panel) */
export async function getModelosAdmin(): Promise<Modelo[]> {
  const sql = sqlCliente();
  const filas = (await sql.query(
    `select ${COLUMNAS} from modelos order by orden, nombre`,
  )) as FilaModelo[];
  return armar(filas);
}

/** Un modelo por id, para el editor del panel */
export async function getModeloPorId(id: string): Promise<Modelo | undefined> {
  const sql = sqlCliente();
  const filas = (await sql.query(`select ${COLUMNAS} from modelos where id = $1`, [id])) as FilaModelo[];
  const [modelo] = await armar(filas);
  return modelo;
}

/** Kits de cotización ya cargados para un modelo (vínculo con el otro CMS) */
export async function getKitsCotizablesDeModelo(
  modeloSlug: string,
): Promise<Array<{ id: string; kit: string; items: number }>> {
  const sql = sqlCliente();
  return (await sql`
    select p.id, p.kit, count(i.id)::int as items
    from cotizacion_plantillas p
    left join cotizacion_secciones s on s.plantilla_id = p.id
    left join cotizacion_items i on i.seccion_id = s.id
    where p.modelo_slug = ${modeloSlug}
    group by p.id, p.kit
    order by p.kit
  `) as Array<{ id: string; kit: string; items: number }>;
}

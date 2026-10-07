import { neon } from '@neondatabase/serverless';

/**
 * Lo mínimo que el sitemap necesita de cada contenido publicado: su
 * slug y cuándo cambió por última vez. Si la base no responde, el
 * sitemap sale igual con las páginas fijas.
 */

export interface EntradaSitemap {
  slug: string;
  actualizado: Date;
}

async function consultar(tabla: 'modelos' | 'proyectos'): Promise<EntradaSitemap[]> {
  const url = process.env.DATABASE_URL;
  if (!url) return [];
  try {
    const sql = neon(url);
    const filas = (await sql.query(
      `select slug, updated_at from ${tabla} where publicado order by orden`,
    )) as Array<{ slug: string; updated_at: string }>;
    return filas.map((f) => ({ slug: f.slug, actualizado: new Date(f.updated_at) }));
  } catch (error) {
    console.error(`[sitemap] no se pudo leer ${tabla}`, error);
    return [];
  }
}

export const getModelosParaSitemap = () => consultar('modelos');
export const getProyectosParaSitemap = () => consultar('proyectos');

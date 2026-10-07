import type { MetadataRoute } from 'next';

import { getModelosParaSitemap, getProyectosParaSitemap } from '@/features/seo/sitemap.db';
import { SITE_URL } from '@/lib/site';

// El contenido cambia desde el admin: el sitemap se arma en cada pedido
export const dynamic = 'force-dynamic';

/**
 * Todas las páginas indexables. Las fichas de modelos y proyectos salen
 * de la base con su fecha real de actualización; el cotizador y el
 * panel no van (no son páginas de destino).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [modelos, proyectos] = await Promise.all([getModelosParaSitemap(), getProyectosParaSitemap()]);
  const ultimaModelos = masReciente(modelos.map((m) => m.actualizado));
  const ultimaProyectos = masReciente(proyectos.map((p) => p.actualizado));

  return [
    { url: SITE_URL, lastModified: ultimaModelos ?? ultimaProyectos, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/modelos`, lastModified: ultimaModelos, changeFrequency: 'weekly', priority: 0.9 },
    ...modelos.map((m) => ({
      url: `${SITE_URL}/modelos/${m.slug}`,
      lastModified: m.actualizado,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/paneles`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/proyectos`, lastModified: ultimaProyectos, changeFrequency: 'weekly', priority: 0.8 },
    ...proyectos.map((p) => ({
      url: `${SITE_URL}/proyecto/${p.slug}`,
      lastModified: p.actualizado,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    { url: `${SITE_URL}/preguntas-frecuentes`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contacto`, changeFrequency: 'yearly', priority: 0.7 },
  ];
}

function masReciente(fechas: Date[]): Date | undefined {
  if (fechas.length === 0) return undefined;
  return new Date(Math.max(...fechas.map((f) => f.getTime())));
}

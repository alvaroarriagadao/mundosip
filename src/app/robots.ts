import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/site';

/**
 * Qué pueden rastrear los buscadores. El panel y la API quedan fuera;
 * las vistas previas de borradores (?preview=1) también. El cotizador
 * NO se bloquea aquí: lleva noindex y Google tiene que poder leerlo.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/*?preview='],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

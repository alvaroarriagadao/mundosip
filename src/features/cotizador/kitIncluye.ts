import { getModeloPorSlug } from '@/features/modelos/modelos.db';

import type { ContenidoKit, KitCotizacion } from './cotizacion.types';

/**
 * Contenido del kit de autoconstrucción de un modelo, desde la MISMA
 * fuente que la ficha pública (/modelos/[slug]): así la web y el PDF
 * nunca dicen cosas distintas. Nunca lanza: si falla, la cotización
 * se emite igual, solo sin el detalle del kit.
 */
export async function contenidoKit(modeloSlug: string, kit: KitCotizacion): Promise<ContenidoKit | undefined> {
  try {
    const modelo = await getModeloPorSlug(modeloSlug, true);
    if (!modelo || modelo.kitInicial.length === 0) return undefined;
    return {
      items: modelo.kitInicial,
      // "Piso – panel SIP 169 mm: la plataforma estructural de tu casa"
      // → en el PDF basta el título; la bajada es texto de marketing
      extras: kit === 'full' ? modelo.kitFullExtras.map((e) => e.split(':')[0].trim()).filter(Boolean) : [],
    };
  } catch (error) {
    console.error('[cotizaciones] no se pudo leer el contenido del kit', error);
    return undefined;
  }
}

import type { Faq } from '@/features/faqs/faq.types';
import type { Modelo } from '@/features/modelos/modelo.types';
import type { Proyecto, RegionProyecto } from '@/features/proyectos/proyecto.types';

import { faqs } from './faqs';
import { modelos } from './modelos';
import { proyectos } from './proyectos';

/**
 * ÚNICA capa de acceso a datos del sitio.
 *
 * Hoy lee datos locales tipados; en fase 2 (Payload CMS + Neon) solo
 * cambia la implementación de estas funciones — los componentes no se
 * tocan. Por eso todas son async aunque hoy no lo necesiten.
 */

export async function getFaqs(): Promise<Faq[]> {
  return [...faqs].sort((a, b) => a.orden - b.orden);
}

export async function getModelos(): Promise<Modelo[]> {
  return [...modelos].sort((a, b) => a.orden - b.orden);
}

export async function getModeloBySlug(slug: string): Promise<Modelo | undefined> {
  return modelos.find((m) => m.slug === slug);
}

export async function getProyectos(): Promise<Proyecto[]> {
  return [...proyectos].sort((a, b) => a.orden - b.orden);
}

export async function getProyectoBySlug(slug: string): Promise<Proyecto | undefined> {
  return proyectos.find((p) => p.slug === slug);
}

/** Regiones con al menos un proyecto, para el filtro de la galería */
export async function getRegionesProyectos(): Promise<RegionProyecto[]> {
  const unicas = new Map<string, RegionProyecto>();
  for (const p of proyectos) {
    unicas.set(p.region.slug, p.region);
  }
  return [...unicas.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

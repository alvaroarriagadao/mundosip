import type { Faq } from '@/features/faqs/faq.types';
import type { Modelo } from '@/features/modelos/modelo.types';
import { getModeloPorSlug, getModelosPublicados } from '@/features/modelos/modelos.db';
import type { Proyecto, RegionProyecto } from '@/features/proyectos/proyecto.types';
import {
  getProyectoPorSlug,
  getProyectosPublicados,
  getRegionesConProyectos,
} from '@/features/proyectos/proyectos.db';

import { faqs } from './faqs';

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

// Los modelos viven en Neon y los administra el equipo en /admin/modelos.
// El repositorio sigue siendo la única puerta de entrada para las páginas.

export async function getModelos(): Promise<Modelo[]> {
  return getModelosPublicados();
}

export async function getModeloBySlug(slug: string): Promise<Modelo | undefined> {
  return getModeloPorSlug(slug);
}

// Los paneles ya migraron a la DB (fase CMS propia): ver
// features/paneles/paneles.db.ts — se administran en /admin/paneles.

// Los proyectos también viven en Neon: se administran en /admin/proyectos.

export async function getProyectos(): Promise<Proyecto[]> {
  return getProyectosPublicados();
}

export async function getProyectoBySlug(slug: string): Promise<Proyecto | undefined> {
  return getProyectoPorSlug(slug);
}

/** Regiones con al menos un proyecto publicado, para el filtro de la galería */
export async function getRegionesProyectos(): Promise<RegionProyecto[]> {
  return getRegionesConProyectos();
}

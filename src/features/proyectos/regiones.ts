import type { RegionProyecto } from './proyecto.types';

/**
 * Las 16 regiones de Chile, de norte a sur, para el selector del admin.
 *
 * El equipo elige de esta lista y nunca escribe la región a mano: así el
 * filtro de /proyectos no se llena de variantes ("Los Rios", "los ríos"…)
 * y el slug queda siempre bien formado.
 */
export const REGIONES_CHILE: readonly RegionProyecto[] = [
  { slug: 'arica-y-parinacota', nombre: 'Arica y Parinacota' },
  { slug: 'tarapaca', nombre: 'Tarapacá' },
  { slug: 'antofagasta', nombre: 'Antofagasta' },
  { slug: 'atacama', nombre: 'Atacama' },
  { slug: 'coquimbo', nombre: 'Coquimbo' },
  { slug: 'valparaiso', nombre: 'Valparaíso' },
  { slug: 'metropolitana', nombre: 'Metropolitana' },
  { slug: 'ohiggins', nombre: "O'Higgins" },
  { slug: 'maule', nombre: 'Maule' },
  { slug: 'nuble', nombre: 'Ñuble' },
  { slug: 'biobio', nombre: 'Biobío' },
  { slug: 'la-araucania', nombre: 'La Araucanía' },
  { slug: 'los-rios', nombre: 'Los Ríos' },
  { slug: 'los-lagos', nombre: 'Los Lagos' },
  { slug: 'aysen', nombre: 'Aysén' },
  { slug: 'magallanes', nombre: 'Magallanes' },
] as const;

export function regionPorSlug(slug: string): RegionProyecto | undefined {
  return REGIONES_CHILE.find((r) => r.slug === slug);
}

/**
 * "Panguipulli, Región de Los Ríos" → "Panguipulli".
 * La ubicación completa se arma en el servidor (lugar + región elegida);
 * el editor solo muestra y edita la parte del lugar.
 */
export function lugarDeUbicacion(ubicacion: string): string {
  return ubicacion.split(/,\s*Región de /)[0].trim();
}

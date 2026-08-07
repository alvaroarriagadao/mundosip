import { neon } from '@neondatabase/serverless';

import type { KitCotizacion, PlantillaCotizacion } from './cotizacion.types';

/**
 * Acceso a datos del cotizador — SOLO servidor (route handlers y
 * server components). Las plantillas viven en Neon y las mantiene el
 * equipo vía admin o `npm run cotizaciones:importar`.
 */

function sqlCliente() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Falta DATABASE_URL');
  return neon(url);
}

interface FilaPlantilla {
  id: string;
  modelo_slug: string;
  kit: KitCotizacion;
  titulo: string;
  descuento_nombre: string | null;
  descuento_pct: number;
  iva_pct: number;
  validez_dias: number;
  condiciones_pago: string | null;
  notas: string[];
  superficie_m2: number | null;
}

interface FilaSeccion {
  id: string;
  plantilla_id: string;
  codigo: string;
  nombre: string;
  obligatoria: boolean;
}

interface FilaItem {
  id: string;
  seccion_id: string;
  codigo: string | null;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precio_unitario: number;
}

/** Arma las plantillas completas (secciones + ítems) a partir de sus filas. */
async function cargarPlantillas(filas: FilaPlantilla[]): Promise<PlantillaCotizacion[]> {
  if (filas.length === 0) return [];
  const sql = sqlCliente();
  const ids = filas.map((f) => f.id);

  const secciones = (await sql`
    select id, plantilla_id, codigo, nombre, obligatoria
    from cotizacion_secciones
    where plantilla_id = any(${ids})
    order by orden
  `) as FilaSeccion[];

  const items = (await sql`
    select i.id, i.seccion_id, i.codigo, i.descripcion, i.unidad,
           i.cantidad::float8 as cantidad, i.precio_unitario
    from cotizacion_items i
    join cotizacion_secciones s on s.id = i.seccion_id
    where s.plantilla_id = any(${ids})
    order by i.orden
  `) as FilaItem[];

  const itemsPorSeccion = new Map<string, FilaItem[]>();
  for (const item of items) {
    const lista = itemsPorSeccion.get(item.seccion_id) ?? [];
    lista.push(item);
    itemsPorSeccion.set(item.seccion_id, lista);
  }

  return filas.map((p) => ({
    id: p.id,
    modeloSlug: p.modelo_slug,
    kit: p.kit,
    titulo: p.titulo,
    descuentoNombre: p.descuento_nombre,
    descuentoPct: Number(p.descuento_pct),
    ivaPct: Number(p.iva_pct),
    validezDias: p.validez_dias,
    condicionesPago: p.condiciones_pago,
    notas: p.notas ?? [],
    superficieM2: p.superficie_m2,
    secciones: secciones
      .filter((s) => s.plantilla_id === p.id)
      .map((s) => ({
        id: s.id,
        codigo: s.codigo,
        nombre: s.nombre,
        obligatoria: s.obligatoria,
        items: (itemsPorSeccion.get(s.id) ?? []).map((i) => ({
          id: i.id,
          codigo: i.codigo,
          descripcion: i.descripcion,
          unidad: i.unidad,
          cantidad: Number(i.cantidad),
          precioUnitario: i.precio_unitario,
        })),
      })),
  }));
}

/** Ambos kits de un modelo (para el toggle del configurador). */
export async function getPlantillasDeModelo(modeloSlug: string): Promise<PlantillaCotizacion[]> {
  const sql = sqlCliente();
  const filas = (await sql`
    select id, modelo_slug, kit, titulo, descuento_nombre, descuento_pct::float8 as descuento_pct,
           iva_pct::float8 as iva_pct, validez_dias, condiciones_pago, notas, superficie_m2
    from cotizacion_plantillas
    where modelo_slug = ${modeloSlug} and publicado
    order by kit
  `) as FilaPlantilla[];
  return cargarPlantillas(filas);
}

/** Una plantilla puntual, para recalcular en la API al emitir. */
export async function getPlantilla(
  modeloSlug: string,
  kit: KitCotizacion,
): Promise<PlantillaCotizacion | null> {
  const plantillas = await getPlantillasDeModelo(modeloSlug);
  return plantillas.find((p) => p.kit === kit) ?? null;
}

/** Todas las plantillas (listado del admin). Sin ítems: solo cabeceras. */
export async function getPlantillasResumen(): Promise<
  Array<{ id: string; modeloSlug: string; kit: KitCotizacion; titulo: string; secciones: number; items: number; neto: number }>
> {
  const sql = sqlCliente();
  const filas = (await sql`
    select p.id, p.modelo_slug, p.kit, p.titulo,
           count(distinct s.id)::int as secciones,
           count(i.id)::int as items,
           coalesce(sum(round(i.cantidad * i.precio_unitario)), 0)::float8 as neto
    from cotizacion_plantillas p
    left join cotizacion_secciones s on s.plantilla_id = p.id
    left join cotizacion_items i on i.seccion_id = s.id
    group by p.id, p.modelo_slug, p.kit, p.titulo
    order by p.modelo_slug, p.kit
  `) as Array<{ id: string; modelo_slug: string; kit: KitCotizacion; titulo: string; secciones: number; items: number; neto: number }>;
  return filas.map((f) => ({
    id: f.id,
    modeloSlug: f.modelo_slug,
    kit: f.kit,
    titulo: f.titulo,
    secciones: f.secciones,
    items: f.items,
    neto: Number(f.neto),
  }));
}

export interface EmitidaResumen {
  id: string;
  folioNum: number;
  modeloSlug: string;
  kit: KitCotizacion;
  nombre: string;
  email: string;
  telefono: string | null;
  totalClp: number;
  createdAt: string;
}

/** Últimas cotizaciones emitidas por clientes (vista del admin). */
export async function getEmitidas(limite = 100): Promise<EmitidaResumen[]> {
  const sql = sqlCliente();
  const filas = (await sql`
    select id, folio_num, modelo_slug, kit, nombre, email, telefono, total_clp, created_at
    from cotizaciones_emitidas
    order by created_at desc
    limit ${limite}
  `) as Array<{
    id: string;
    folio_num: string;
    modelo_slug: string;
    kit: KitCotizacion;
    nombre: string;
    email: string;
    telefono: string | null;
    total_clp: number;
    created_at: string;
  }>;
  return filas.map((f) => ({
    id: f.id,
    folioNum: Number(f.folio_num),
    modeloSlug: f.modelo_slug,
    kit: f.kit,
    nombre: f.nombre,
    email: f.email,
    telefono: f.telefono,
    totalClp: f.total_clp,
    createdAt: new Date(f.created_at).toISOString(),
  }));
}

/** Plantilla por id (edición en admin). */
export async function getPlantillaPorId(id: string): Promise<PlantillaCotizacion | null> {
  const sql = sqlCliente();
  const filas = (await sql`
    select id, modelo_slug, kit, titulo, descuento_nombre, descuento_pct::float8 as descuento_pct,
           iva_pct::float8 as iva_pct, validez_dias, condiciones_pago, notas, superficie_m2
    from cotizacion_plantillas
    where id = ${id}
  `) as FilaPlantilla[];
  const [plantilla] = await cargarPlantillas(filas);
  return plantilla ?? null;
}

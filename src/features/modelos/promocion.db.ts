import { neon } from '@neondatabase/serverless';

import { SIN_PROMOCION, type Promocion } from './precio';

/** Acceso a la promoción vigente — SOLO servidor. */

function sqlCliente() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Falta DATABASE_URL');
  return neon(url);
}

interface FilaPromocion {
  nombre: string;
  descuento_pct: string | number;
  activa: boolean;
}

/**
 * Crea la tabla si no existe (misma definición que db/schema.sql,
 * migración 010). Se llama solo al GUARDAR desde el panel, así el
 * sitio funciona aunque aún no se haya corrido `npm run db:aplicar`.
 */
async function asegurarTabla() {
  const sql = sqlCliente();
  await sql`
    create table if not exists promocion (
      id             integer primary key default 1 check (id = 1),
      nombre         text not null default '',
      descuento_pct  numeric(5,2) not null default 0 check (descuento_pct >= 0 and descuento_pct < 100),
      activa         boolean not null default false,
      updated_at     timestamptz not null default now()
    )
  `;
  await sql`insert into promocion (id) values (1) on conflict (id) do nothing`;
}

/**
 * Promoción actual. Si la tabla todavía no existe devuelve "sin
 * promoción": una base sin migrar no debe dejar el catálogo caído.
 */
export async function getPromocion(): Promise<Promocion> {
  try {
    const sql = sqlCliente();
    const [fila] = (await sql`
      select nombre, descuento_pct, activa from promocion where id = 1
    `) as FilaPromocion[];
    if (!fila) return SIN_PROMOCION;
    return { nombre: fila.nombre, descuentoPct: Number(fila.descuento_pct), activa: fila.activa };
  } catch (error) {
    // 42P01 = la tabla no existe (aún no se aplicó la migración 010)
    if ((error as { code?: string })?.code !== '42P01') {
      console.error('[promocion] error leyendo la promoción', error);
    }
    return SIN_PROMOCION;
  }
}

export async function guardarPromocion(p: Promocion): Promise<void> {
  await asegurarTabla();
  const sql = sqlCliente();
  await sql`
    update promocion
    set nombre = ${p.nombre}, descuento_pct = ${p.descuentoPct}, activa = ${p.activa}, updated_at = now()
    where id = 1
  `;
}

/**
 * Copia el descuento a TODAS las plantillas de cotización, para que lo
 * que ve el cliente en el catálogo coincida con lo que cotiza.
 * Con la promoción apagada deja las plantillas sin descuento.
 */
export async function aplicarPromocionACotizaciones(p: Promocion): Promise<number> {
  const sql = sqlCliente();
  const vigente = p.activa && p.descuentoPct > 0;
  const filas = (await sql`
    update cotizacion_plantillas
    set descuento_nombre = ${vigente ? p.nombre || 'Descuento' : null},
        descuento_pct = ${vigente ? p.descuentoPct : 0}
    returning id
  `) as unknown[];
  return filas.length;
}

import { neon } from '@neondatabase/serverless';

import { faqs as faqsIniciales } from '@/data/faqs';

import type { Faq, PuntoFaq } from './faq.types';

/**
 * Preguntas frecuentes en Neon — SOLO servidor. Se administran en
 * /admin/preguntas.
 *
 * La tabla se crea y se llena sola la primera vez que se abre el admin
 * (con las preguntas que antes estaban fijas en src/data/faqs.ts), así
 * no depende de correr `npm run db:aplicar`. Mientras no exista, el
 * sitio público sigue mostrando esas mismas preguntas del código.
 */

function sqlCliente() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Falta DATABASE_URL');
  return neon(url);
}

export interface FaqAdmin extends Faq {
  publicado: boolean;
}

interface FilaFaq {
  id: string;
  pregunta: string;
  respuesta: string | null;
  puntos: PuntoFaq[] | null;
  orden: number;
  publicado: boolean;
}

function mapear(f: FilaFaq): FaqAdmin {
  const puntos = Array.isArray(f.puntos) ? f.puntos : [];
  return {
    id: f.id,
    pregunta: f.pregunta,
    respuesta: f.respuesta || undefined,
    puntos: puntos.length > 0 ? puntos : undefined,
    orden: f.orden,
    publicado: f.publicado,
  };
}

/** Misma definición que db/schema.sql (migración 012) + carga inicial */
export async function asegurarTablaFaqs() {
  const sql = sqlCliente();
  await sql`
    create table if not exists faqs (
      id          uuid primary key default gen_random_uuid(),
      pregunta    text not null check (length(trim(pregunta)) >= 5),
      respuesta   text,
      puntos      jsonb not null default '[]'::jsonb,
      orden       integer not null default 0,
      publicado   boolean not null default true,
      created_at  timestamptz not null default now(),
      updated_at  timestamptz not null default now()
    )
  `;
  // La tabla puede venir del esquema inicial, que no tenía `puntos` y
  // exigía `respuesta`: el create de arriba no la toca, estos sí
  await sql`alter table faqs add column if not exists puntos jsonb not null default '[]'::jsonb`;
  await sql`alter table faqs alter column respuesta drop not null`;
  // Una sola sentencia con "where not exists": si dos pestañas abren el
  // admin a la vez, solo una carga las preguntas iniciales
  const iniciales = faqsIniciales.map((f, i) => ({
    pregunta: f.pregunta,
    respuesta: f.respuesta ?? null,
    puntos: f.puntos ?? [],
    orden: i + 1,
  }));
  await sql`
    insert into faqs (pregunta, respuesta, puntos, orden)
    select x.pregunta, x.respuesta, x.puntos, x.orden
    from jsonb_to_recordset(${JSON.stringify(iniciales)}::jsonb)
      as x(pregunta text, respuesta text, puntos jsonb, orden int)
    where not exists (select 1 from faqs)
  `;
}

const ORDEN = 'order by orden, created_at';

/** Preguntas visibles en /preguntas-frecuentes */
export async function getFaqsPublicadas(): Promise<Faq[]> {
  try {
    const sql = sqlCliente();
    const filas = (await sql.query(
      `select id, pregunta, respuesta, puntos, orden, publicado from faqs where publicado ${ORDEN}`,
    )) as FilaFaq[];
    return filas.map(mapear);
  } catch (error) {
    // 42P01 = la tabla aún no existe: se muestran las del código
    if ((error as { code?: string })?.code !== '42P01') {
      console.error('[faqs] error leyendo las preguntas', error);
    }
    return [...faqsIniciales].sort((a, b) => a.orden - b.orden);
  }
}

/** Todas, visibles u ocultas (admin). Crea y llena la tabla si hace falta. */
export async function getFaqsAdmin(): Promise<FaqAdmin[]> {
  await asegurarTablaFaqs();
  const sql = sqlCliente();
  const filas = (await sql.query(
    `select id, pregunta, respuesta, puntos, orden, publicado from faqs ${ORDEN}`,
  )) as FilaFaq[];
  return filas.map(mapear);
}

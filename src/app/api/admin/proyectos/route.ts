import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

import { proyectoSchema } from '@/features/admin/admin.schema';
import { esAdmin } from '@/features/admin/auth';
import { regionPorSlug } from '@/features/proyectos/regiones';

/** "Casa Lago Ranco" → "casa-lago-ranco" */
function slugificar(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Crea un proyecto. Nace como borrador salvo que se pida publicado,
 * para que el equipo suba fotos y textos con calma y lo previsualice
 * antes de mostrarlo en /proyectos.
 */
export async function POST(request: Request) {
  if (!(await esAdmin())) {
    return NextResponse.json({ ok: false, error: 'Sesión expirada.' }, { status: 401 });
  }

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Solicitud inválida.' }, { status: 400 });
  }

  const parsed = proyectoSchema.safeParse(cuerpo);
  if (!parsed.success) {
    const primero = parsed.error.issues[0];
    return NextResponse.json({ ok: false, error: primero?.message ?? 'Revisa los datos.' }, { status: 422 });
  }

  const d = parsed.data;
  const region = regionPorSlug(d.regionSlug)!;
  const base = slugificar(d.nombre);
  if (!base) {
    return NextResponse.json({ ok: false, error: 'El nombre no genera una URL válida.' }, { status: 422 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);

    const existentes = (await sql`
      select slug from proyectos where slug = ${base} or slug like ${base + '-%'}
    `) as Array<{ slug: string }>;
    const ocupados = new Set(existentes.map((e) => e.slug));
    let slug = base;
    for (let n = 2; ocupados.has(slug); n++) slug = `${base}-${n}`;

    const [fila] = (await sql`
      insert into proyectos
        (slug, nombre, region_slug, region_nombre, ubicacion, superficie_m2,
         ano_diseno, ano_construccion, resumen, resena_destacada, resena,
         video_url, estado, destacado, publicado, orden)
      values
        (${slug}, ${d.nombre}, ${region.slug}, ${region.nombre},
         ${`${d.lugar}, Región de ${region.nombre}`}, ${d.superficieM2},
         ${d.anoDiseno}, ${d.anoConstruccion}, ${d.resumen}, ${d.resenaDestacada},
         ${d.resena}, ${d.videoUrl}, ${d.estado}, ${d.destacado}, ${d.publicado},
         (select coalesce(max(orden), 0) + 1 from proyectos))
      returning id, slug
    `) as Array<{ id: string; slug: string }>;

    return NextResponse.json({ ok: true, id: fila.id, slug: fila.slug });
  } catch (error) {
    console.error('[admin/proyectos] error creando proyecto', error);
    return NextResponse.json({ ok: false, error: 'No se pudo crear el proyecto.' }, { status: 500 });
  }
}

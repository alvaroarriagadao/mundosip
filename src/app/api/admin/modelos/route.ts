import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

import { modeloSchema } from '@/features/admin/admin.schema';
import { esAdmin } from '@/features/admin/auth';

/** "Casa Canelo 90" → "casa-canelo-90" */
function slugificar(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Crea un modelo. Nace como borrador salvo que se pida publicado, para
 * que el equipo pueda armarlo con calma y previsualizarlo antes.
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

  const parsed = modeloSchema.safeParse(cuerpo);
  if (!parsed.success) {
    const primero = parsed.error.issues[0];
    return NextResponse.json({ ok: false, error: primero?.message ?? 'Revisa los datos.' }, { status: 422 });
  }

  const d = parsed.data;
  const base = slugificar(d.nombre);
  if (!base) {
    return NextResponse.json({ ok: false, error: 'El nombre no genera una URL válida.' }, { status: 422 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);

    const existentes = (await sql`
      select slug from modelos where slug = ${base} or slug like ${base + '-%'}
    `) as Array<{ slug: string }>;
    const ocupados = new Set(existentes.map((e) => e.slug));
    let slug = base;
    for (let n = 2; ocupados.has(slug); n++) slug = `${base}-${n}`;

    const [fila] = (await sql`
      insert into modelos
        (slug, nombre, superficie_m2, habitaciones, banos, precio_desde_clp,
         resumen, descripcion, destacado, publicado, orden)
      values
        (${slug}, ${d.nombre}, ${d.superficieM2}, ${d.habitaciones}, ${d.banos},
         ${d.precioDesdeCLP}, ${d.resumen || null}, ${d.descripcion || null},
         ${d.destacado}, ${d.publicado},
         (select coalesce(max(orden), 0) + 1 from modelos))
      returning id, slug
    `) as Array<{ id: string; slug: string }>;

    return NextResponse.json({ ok: true, id: fila.id, slug: fila.slug });
  } catch (error) {
    console.error('[admin/modelos] error creando modelo', error);
    return NextResponse.json({ ok: false, error: 'No se pudo crear el modelo.' }, { status: 500 });
  }
}

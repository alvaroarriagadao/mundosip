import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

import { panelSchema } from '@/features/admin/admin.schema';
import { esAdmin } from '@/features/admin/auth';

/** "Panel SIP 94 mm" → "panel-sip-94-mm" */
function slugificar(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Crea un producto panel; el slug sale del nombre (con sufijo si choca). */
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

  const parsed = panelSchema.safeParse(cuerpo);
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

    // Slug único: panel-sip-94-mm, -2, -3…
    const existentes = (await sql`
      select slug from paneles where slug = ${base} or slug like ${base + '-%'}
    `) as Array<{ slug: string }>;
    const ocupados = new Set(existentes.map((e) => e.slug));
    let slug = base;
    for (let n = 2; ocupados.has(slug); n++) slug = `${base}-${n}`;

    const [fila] = (await sql`
      insert into paneles
        (slug, nombre, precio_clp, dimensiones, espesor_osb, espesor_eps, densidad_eps,
         apto_para_madera, imagen_url, imagen_alt, descripcion, publicado, orden)
      values
        (${slug}, ${d.nombre}, ${d.precioClp}, ${d.dimensiones}, ${d.espesorOsb}, ${d.espesorEps},
         ${d.densidadEps}, ${d.aptoParaMadera}, ${d.imagenUrl}, ${`${d.nombre} MundoSIP`},
         ${d.descripcion}, ${d.publicado},
         (select coalesce(max(orden), 0) + 1 from paneles))
      returning id, slug, orden
    `) as Array<{ id: string; slug: string; orden: number }>;

    return NextResponse.json({ ok: true, id: fila.id, slug: fila.slug, orden: fila.orden });
  } catch (error) {
    console.error('[admin/paneles] error creando producto', error);
    return NextResponse.json({ ok: false, error: 'No se pudo crear el producto.' }, { status: 500 });
  }
}

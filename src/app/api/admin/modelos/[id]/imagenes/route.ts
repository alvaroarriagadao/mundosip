import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { modeloImagenesSchema } from '@/features/admin/admin.schema';
import { esAdmin } from '@/features/admin/auth';

interface Contexto {
  params: Promise<{ id: string }>;
}

/**
 * Guarda portada y galería en bloque, respetando el orden en que el
 * equipo las dejó en el editor.
 */
export async function PUT(request: Request, { params }: Contexto) {
  if (!(await esAdmin())) {
    return NextResponse.json({ ok: false, error: 'Sesión expirada.' }, { status: 401 });
  }

  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json({ ok: false, error: 'Id inválido.' }, { status: 400 });
  }

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Solicitud inválida.' }, { status: 400 });
  }

  const parsed = modeloImagenesSchema.safeParse(cuerpo);
  if (!parsed.success) {
    const primero = parsed.error.issues[0];
    return NextResponse.json({ ok: false, error: primero?.message ?? 'Revisa las imágenes.' }, { status: 422 });
  }

  const { portada, galeria } = parsed.data;

  try {
    const sql = neon(process.env.DATABASE_URL!);

    const existe = (await sql`select 1 from modelos where id = ${id}`) as unknown[];
    if (existe.length === 0) {
      return NextResponse.json({ ok: false, error: 'El modelo no existe.' }, { status: 404 });
    }

    await sql`delete from modelo_imagenes where modelo_id = ${id}`;

    if (portada) {
      await sql`
        insert into modelo_imagenes (modelo_id, url, alt, tipo, orden)
        values (${id}, ${portada.url}, ${portada.alt || null}, 'portada', 0)
      `;
    }
    if (galeria.length > 0) {
      await sql`
        insert into modelo_imagenes (modelo_id, url, alt, tipo, orden)
        select ${id}, g.url, nullif(g.alt, ''), 'galeria', g.i
        from jsonb_to_recordset(${JSON.stringify(galeria.map((g, i) => ({ ...g, i: i + 1 })))}::jsonb)
             as g(url text, alt text, i int)
      `;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/modelos] error guardando imágenes', error);
    return NextResponse.json({ ok: false, error: 'No se pudieron guardar las imágenes.' }, { status: 500 });
  }
}

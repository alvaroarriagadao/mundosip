import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { proyectoImagenesSchema } from '@/features/admin/admin.schema';
import { esAdmin } from '@/features/admin/auth';

interface Contexto {
  params: Promise<{ id: string }>;
}

/**
 * Guarda las fotos del proyecto en bloque (portada, foto de la reseña y
 * galería), respetando el orden en que el equipo las dejó en el editor.
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

  const parsed = proyectoImagenesSchema.safeParse(cuerpo);
  if (!parsed.success) {
    const primero = parsed.error.issues[0];
    return NextResponse.json({ ok: false, error: primero?.message ?? 'Revisa las fotos.' }, { status: 422 });
  }

  const { portada, imagenResena, galeria } = parsed.data;

  try {
    const sql = neon(process.env.DATABASE_URL!);

    const existe = (await sql`select 1 from proyectos where id = ${id}`) as unknown[];
    if (existe.length === 0) {
      return NextResponse.json({ ok: false, error: 'El proyecto no existe.' }, { status: 404 });
    }

    await sql`delete from proyecto_imagenes where proyecto_id = ${id}`;

    const filas = [
      ...(portada ? [{ ...portada, tipo: 'portada', orden: 0 }] : []),
      ...(imagenResena ? [{ ...imagenResena, tipo: 'resena', orden: 0 }] : []),
      ...galeria.map((g, i) => ({ ...g, tipo: 'galeria', orden: i + 1 })),
    ];

    if (filas.length > 0) {
      await sql`
        insert into proyecto_imagenes (proyecto_id, tipo, url, alt, orden)
        select ${id}, f.tipo, f.url, coalesce(nullif(f.alt, ''), 'Fotografía del proyecto'), f.orden
        from jsonb_to_recordset(${JSON.stringify(filas)}::jsonb)
             as f(tipo text, url text, alt text, orden int)
      `;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/proyectos] error guardando fotos', error);
    return NextResponse.json({ ok: false, error: 'No se pudieron guardar las fotos.' }, { status: 500 });
  }
}

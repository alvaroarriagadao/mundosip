import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { modeloSchema } from '@/features/admin/admin.schema';
import { esAdmin } from '@/features/admin/auth';

interface Contexto {
  params: Promise<{ id: string }>;
}

/** Actualiza la ficha del modelo (no toca listas ni imágenes). */
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

  const parsed = modeloSchema.safeParse(cuerpo);
  if (!parsed.success) {
    const primero = parsed.error.issues[0];
    return NextResponse.json({ ok: false, error: primero?.message ?? 'Revisa los datos.' }, { status: 422 });
  }

  const d = parsed.data;

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const filas = (await sql`
      update modelos
      set nombre = ${d.nombre},
          superficie_m2 = ${d.superficieM2},
          habitaciones = ${d.habitaciones},
          banos = ${d.banos},
          precio_desde_clp = ${d.precioDesdeCLP},
          resumen = ${d.resumen || null},
          descripcion = ${d.descripcion || null},
          destacado = ${d.destacado},
          publicado = ${d.publicado}
      where id = ${id}
      returning id, slug
    `) as Array<{ id: string; slug: string }>;

    if (filas.length === 0) {
      return NextResponse.json({ ok: false, error: 'El modelo no existe.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, slug: filas[0].slug });
  } catch (error) {
    console.error('[admin/modelos] error actualizando modelo', error);
    return NextResponse.json({ ok: false, error: 'No se pudo guardar.' }, { status: 500 });
  }
}

/**
 * Elimina el modelo con sus imágenes, características y kits (cascade).
 * Las plantillas de cotización NO se borran: viven aparte y el equipo
 * decide qué hacer con ellas desde su propio panel.
 */
export async function DELETE(_request: Request, { params }: Contexto) {
  if (!(await esAdmin())) {
    return NextResponse.json({ ok: false, error: 'Sesión expirada.' }, { status: 401 });
  }

  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json({ ok: false, error: 'Id inválido.' }, { status: 400 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    await sql`delete from modelos where id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/modelos] error eliminando modelo', error);
    return NextResponse.json({ ok: false, error: 'No se pudo eliminar.' }, { status: 500 });
  }
}

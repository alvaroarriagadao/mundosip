import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { seccionUpdateSchema } from '@/features/admin/admin.schema';
import { esAdmin } from '@/features/admin/auth';

interface Contexto {
  params: Promise<{ id: string }>;
}

/** Renombra la sección o cambia si va siempre incluida en el cotizador. */
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

  const parsed = seccionUpdateSchema.safeParse(cuerpo);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Revisa los datos de la sección.' }, { status: 422 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const filas = (await sql`
      update cotizacion_secciones
      set nombre = ${parsed.data.nombre}, obligatoria = ${parsed.data.obligatoria}
      where id = ${id}
      returning id
    `) as Array<{ id: string }>;
    if (filas.length === 0) {
      return NextResponse.json({ ok: false, error: 'La sección no existe.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/secciones] error actualizando sección', error);
    return NextResponse.json({ ok: false, error: 'No se pudo guardar.' }, { status: 500 });
  }
}

/** Elimina la sección con todas sus partidas (cascade en la DB). */
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
    await sql`delete from cotizacion_secciones where id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/secciones] error eliminando sección', error);
    return NextResponse.json({ ok: false, error: 'No se pudo eliminar.' }, { status: 500 });
  }
}

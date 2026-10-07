import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { faqSchema } from '@/features/admin/admin.schema';
import { esAdmin } from '@/features/admin/auth';

interface Contexto {
  params: Promise<{ id: string }>;
}

/** Guarda una pregunta completa (texto, puntos y visible/oculta). */
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

  const parsed = faqSchema.safeParse(cuerpo);
  if (!parsed.success) {
    const primero = parsed.error.issues[0];
    return NextResponse.json({ ok: false, error: primero?.message ?? 'Revisa los datos.' }, { status: 422 });
  }

  const d = parsed.data;
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const filas = (await sql`
      update faqs
      set pregunta = ${d.pregunta}, respuesta = ${d.respuesta}, puntos = ${JSON.stringify(d.puntos)}::jsonb,
          publicado = ${d.publicado}, updated_at = now()
      where id = ${id}
      returning id
    `) as unknown[];
    if (filas.length === 0) {
      return NextResponse.json({ ok: false, error: 'La pregunta ya no existe.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/faqs] error guardando la pregunta', error);
    return NextResponse.json({ ok: false, error: 'No se pudo guardar.' }, { status: 500 });
  }
}

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
    await sql`delete from faqs where id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/faqs] error eliminando la pregunta', error);
    return NextResponse.json({ ok: false, error: 'No se pudo eliminar.' }, { status: 500 });
  }
}

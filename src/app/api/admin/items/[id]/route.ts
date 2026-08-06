import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { itemUpdateSchema } from '@/features/admin/admin.schema';
import { esAdmin } from '@/features/admin/auth';

interface Contexto {
  params: Promise<{ id: string }>;
}

const uuidSchema = z.uuid();

export async function PUT(request: Request, { params }: Contexto) {
  if (!(await esAdmin())) {
    return NextResponse.json({ ok: false, error: 'Sesión expirada.' }, { status: 401 });
  }

  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ ok: false, error: 'Id inválido.' }, { status: 400 });
  }

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Solicitud inválida.' }, { status: 400 });
  }

  const parsed = itemUpdateSchema.safeParse(cuerpo);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Revisa los datos de la partida.' }, { status: 422 });
  }

  const { descripcion, unidad, cantidad, precioUnitario } = parsed.data;

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const filas = (await sql`
      update cotizacion_items
      set descripcion = ${descripcion}, unidad = ${unidad},
          cantidad = ${cantidad}, precio_unitario = ${precioUnitario}
      where id = ${id}
      returning id
    `) as Array<{ id: string }>;
    if (filas.length === 0) {
      return NextResponse.json({ ok: false, error: 'La partida no existe.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/items] error actualizando partida', error);
    return NextResponse.json({ ok: false, error: 'No se pudo guardar.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Contexto) {
  if (!(await esAdmin())) {
    return NextResponse.json({ ok: false, error: 'Sesión expirada.' }, { status: 401 });
  }

  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ ok: false, error: 'Id inválido.' }, { status: 400 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    await sql`delete from cotizacion_items where id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/items] error eliminando partida', error);
    return NextResponse.json({ ok: false, error: 'No se pudo eliminar.' }, { status: 500 });
  }
}

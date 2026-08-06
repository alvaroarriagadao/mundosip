import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

import { itemCreateSchema } from '@/features/admin/admin.schema';
import { esAdmin } from '@/features/admin/auth';

/** Agrega una partida al final de su sección. */
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

  const parsed = itemCreateSchema.safeParse(cuerpo);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Revisa los datos de la partida.' }, { status: 422 });
  }

  const { seccionId, codigo, descripcion, unidad, cantidad, precioUnitario } = parsed.data;

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const [fila] = (await sql`
      insert into cotizacion_items (seccion_id, codigo, descripcion, unidad, cantidad, precio_unitario, orden)
      values (
        ${seccionId}, ${codigo || null}, ${descripcion}, ${unidad}, ${cantidad}, ${precioUnitario},
        coalesce((select max(orden) + 1 from cotizacion_items where seccion_id = ${seccionId}), 0)
      )
      returning id
    `) as Array<{ id: string }>;
    return NextResponse.json({ ok: true, id: fila.id });
  } catch (error) {
    console.error('[admin/items] error creando partida', error);
    return NextResponse.json({ ok: false, error: 'No se pudo crear la partida.' }, { status: 500 });
  }
}

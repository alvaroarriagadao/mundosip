import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

import { ordenFaqsSchema } from '@/features/admin/admin.schema';
import { esAdmin } from '@/features/admin/auth';

/**
 * Guarda el orden de las preguntas: la posición en la lista del panel pasa
 * a ser `orden` (1, 2, 3…) y /preguntas-frecuentes las muestra en ese orden.
 */
export async function PUT(request: Request) {
  if (!(await esAdmin())) {
    return NextResponse.json({ ok: false, error: 'Sesión expirada.' }, { status: 401 });
  }

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Solicitud inválida.' }, { status: 400 });
  }

  const parsed = ordenFaqsSchema.safeParse(cuerpo);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Lista de preguntas inválida.' }, { status: 422 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const filas = parsed.data.ids.map((id, i) => ({ id, orden: i + 1 }));
    await sql`
      update faqs q
      set orden = f.orden
      from jsonb_to_recordset(${JSON.stringify(filas)}::jsonb) as f(id uuid, orden int)
      where q.id = f.id
    `;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/faqs] error guardando el orden', error);
    return NextResponse.json({ ok: false, error: 'No se pudo guardar el orden.' }, { status: 500 });
  }
}

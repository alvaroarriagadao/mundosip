import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

import { faqSchema } from '@/features/admin/admin.schema';
import { esAdmin } from '@/features/admin/auth';
import { asegurarTablaFaqs } from '@/features/faqs/faqs.db';

/** Crea una pregunta frecuente; queda al final de la lista. */
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

  const parsed = faqSchema.safeParse(cuerpo);
  if (!parsed.success) {
    const primero = parsed.error.issues[0];
    return NextResponse.json({ ok: false, error: primero?.message ?? 'Revisa los datos.' }, { status: 422 });
  }

  const d = parsed.data;
  try {
    await asegurarTablaFaqs();
    const sql = neon(process.env.DATABASE_URL!);
    const [fila] = (await sql`
      insert into faqs (pregunta, respuesta, puntos, publicado, orden)
      values (
        ${d.pregunta}, ${d.respuesta}, ${JSON.stringify(d.puntos)}::jsonb, ${d.publicado},
        (select coalesce(max(orden), 0) + 1 from faqs)
      )
      returning id, orden
    `) as Array<{ id: string; orden: number }>;
    return NextResponse.json({ ok: true, id: fila.id, orden: fila.orden });
  } catch (error) {
    console.error('[admin/faqs] error creando la pregunta', error);
    return NextResponse.json({ ok: false, error: 'No se pudo crear la pregunta.' }, { status: 500 });
  }
}

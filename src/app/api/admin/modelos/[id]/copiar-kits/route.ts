import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { esAdmin } from '@/features/admin/auth';

interface Contexto {
  params: Promise<{ id: string }>;
}

const cuerpoSchema = z.object({ desdeModeloId: z.uuid() });

/**
 * Devuelve los kits de otro modelo para copiarlos en el editor.
 *
 * No los graba: el editor los carga en pantalla y el equipo decide si
 * los ajusta antes de guardar. Así "copiar" nunca pisa nada sin querer.
 */
export async function POST(request: Request, { params }: Contexto) {
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

  const parsed = cuerpoSchema.safeParse(cuerpo);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Elige un modelo de origen.' }, { status: 422 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const filas = (await sql`
      select tipo, texto from kit_items
      where modelo_id = ${parsed.data.desdeModeloId}
      order by orden
    `) as Array<{ tipo: string; texto: string }>;

    return NextResponse.json({
      ok: true,
      kitInicial: filas.filter((f) => f.tipo === 'inicial').map((f) => f.texto),
      kitFullExtras: filas.filter((f) => f.tipo === 'full_extra').map((f) => f.texto),
    });
  } catch (error) {
    console.error('[admin/modelos] error copiando kits', error);
    return NextResponse.json({ ok: false, error: 'No se pudieron copiar los kits.' }, { status: 500 });
  }
}

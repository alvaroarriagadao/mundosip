import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { modeloListasSchema } from '@/features/admin/admin.schema';
import { esAdmin } from '@/features/admin/auth';

interface Contexto {
  params: Promise<{ id: string }>;
}

/**
 * Guarda las listas del modelo (características y ambos kits) en bloque:
 * se borran las anteriores y se insertan las nuevas en orden. Reemplazo
 * total en vez de CRUD por ítem — el editor manda siempre la lista
 * completa, así no quedan estados a medias.
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

  const parsed = modeloListasSchema.safeParse(cuerpo);
  if (!parsed.success) {
    const primero = parsed.error.issues[0];
    return NextResponse.json({ ok: false, error: primero?.message ?? 'Revisa las listas.' }, { status: 422 });
  }

  const { caracteristicas, kitInicial, kitFullExtras } = parsed.data;

  try {
    const sql = neon(process.env.DATABASE_URL!);

    const existe = (await sql`select 1 from modelos where id = ${id}`) as unknown[];
    if (existe.length === 0) {
      return NextResponse.json({ ok: false, error: 'El modelo no existe.' }, { status: 404 });
    }

    await sql`delete from modelo_caracteristicas where modelo_id = ${id}`;
    await sql`delete from kit_items where modelo_id = ${id}`;

    // unnest + generate_subscripts: una sola sentencia por lista, con su orden
    if (caracteristicas.length > 0) {
      await sql`
        insert into modelo_caracteristicas (modelo_id, texto, orden)
        select ${id}, t, i - 1
        from unnest(${caracteristicas}::text[]) with ordinality as u(t, i)
      `;
    }
    for (const [tipo, items] of [
      ['inicial', kitInicial],
      ['full_extra', kitFullExtras],
    ] as const) {
      if (items.length === 0) continue;
      await sql`
        insert into kit_items (modelo_id, tipo, texto, orden)
        select ${id}, ${tipo}, t, i - 1
        from unnest(${items}::text[]) with ordinality as u(t, i)
      `;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/modelos] error guardando listas', error);
    return NextResponse.json({ ok: false, error: 'No se pudieron guardar las listas.' }, { status: 500 });
  }
}

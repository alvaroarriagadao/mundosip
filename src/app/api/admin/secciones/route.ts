import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

import { seccionCreateSchema } from '@/features/admin/admin.schema';
import { esAdmin } from '@/features/admin/auth';

/** Crea una sección vacía al final de la plantilla (código correlativo). */
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

  const parsed = seccionCreateSchema.safeParse(cuerpo);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Revisa el nombre de la sección.' }, { status: 422 });
  }

  const { plantillaId, nombre } = parsed.data;

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const [fila] = (await sql`
      insert into cotizacion_secciones (plantilla_id, codigo, nombre, obligatoria, orden)
      select ${plantillaId},
             'N°' || (coalesce(max(orden), -1) + 2)::text,
             ${nombre},
             false,
             coalesce(max(orden), -1) + 1
      from cotizacion_secciones where plantilla_id = ${plantillaId}
      returning id, codigo
    `) as Array<{ id: string; codigo: string }>;
    return NextResponse.json({ ok: true, id: fila.id, codigo: fila.codigo });
  } catch (error) {
    console.error('[admin/secciones] error creando sección', error);
    return NextResponse.json({ ok: false, error: 'No se pudo crear la sección.' }, { status: 500 });
  }
}

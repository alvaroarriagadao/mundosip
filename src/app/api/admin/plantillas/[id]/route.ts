import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { plantillaUpdateSchema } from '@/features/admin/admin.schema';
import { esAdmin } from '@/features/admin/auth';

interface Contexto {
  params: Promise<{ id: string }>;
}

/** Actualiza los datos generales de la plantilla (descuento, notas, pago). */
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

  const parsed = plantillaUpdateSchema.safeParse(cuerpo);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Revisa los datos de la plantilla.' }, { status: 422 });
  }

  const { titulo, descuentoNombre, descuentoPct, ivaPct, superficieM2, condicionesPago, notas } = parsed.data;

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const filas = (await sql`
      update cotizacion_plantillas
      set titulo = ${titulo},
          descuento_nombre = ${descuentoNombre},
          descuento_pct = ${descuentoPct},
          iva_pct = ${ivaPct},
          superficie_m2 = ${superficieM2},
          condiciones_pago = ${condicionesPago},
          notas = ${notas}
      where id = ${id}
      returning id
    `) as Array<{ id: string }>;
    if (filas.length === 0) {
      return NextResponse.json({ ok: false, error: 'La plantilla no existe.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/plantillas] error actualizando', error);
    return NextResponse.json({ ok: false, error: 'No se pudo guardar.' }, { status: 500 });
  }
}

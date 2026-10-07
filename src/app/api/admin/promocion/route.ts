import { NextResponse } from 'next/server';

import { promocionSchema } from '@/features/admin/admin.schema';
import { esAdmin } from '@/features/admin/auth';
import { aplicarPromocionACotizaciones, guardarPromocion } from '@/features/modelos/promocion.db';

/** Guarda la promoción vigente y, si se pide, la copia a las cotizaciones. */
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

  const parsed = promocionSchema.safeParse(cuerpo);
  if (!parsed.success) {
    const primero = parsed.error.issues[0];
    return NextResponse.json({ ok: false, error: primero?.message ?? 'Revisa los datos.' }, { status: 422 });
  }

  const { aplicarACotizaciones, ...promocion } = parsed.data;

  try {
    await guardarPromocion(promocion);
    const plantillas = aplicarACotizaciones ? await aplicarPromocionACotizaciones(promocion) : 0;
    return NextResponse.json({ ok: true, plantillas });
  } catch (error) {
    console.error('[admin/promocion] error guardando', error);
    return NextResponse.json({ ok: false, error: 'No se pudo guardar la promoción.' }, { status: 500 });
  }
}

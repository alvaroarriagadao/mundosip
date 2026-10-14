import { NextResponse } from 'next/server';

import { folioSchema } from '@/features/admin/admin.schema';
import { esAdmin } from '@/features/admin/auth';
import { fijarSiguienteFolio, getEstadoFolio } from '@/features/admin/folios.db';

/** Fija el número de la próxima cotización de casas o de paneles. */
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

  const parsed = folioSchema.safeParse(cuerpo);
  if (!parsed.success) {
    const primero = parsed.error.issues[0];
    return NextResponse.json({ ok: false, error: primero?.message ?? 'Revisa el número.' }, { status: 422 });
  }

  const { tipo, siguiente } = parsed.data;
  try {
    const aplicado = await fijarSiguienteFolio(tipo, siguiente);
    const estado = await getEstadoFolio(tipo);
    if (!aplicado) {
      return NextResponse.json(
        {
          ok: false,
          error: `Debe ser mayor a ${estado.ultimoEmitido}, el último folio ya emitido. Así ningún número se repite.`,
          ...estado,
        },
        { status: 422 },
      );
    }
    return NextResponse.json({ ok: true, ...estado });
  } catch (error) {
    console.error('[admin/folios] error fijando el folio', error);
    return NextResponse.json({ ok: false, error: 'No se pudo guardar el número.' }, { status: 500 });
  }
}

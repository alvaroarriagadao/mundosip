import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { esAdmin } from '@/features/admin/auth';

const duplicarSchema = z.object({
  plantillaId: z.uuid(),
  modeloSlug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug inválido (usa minúsculas y guiones, ej: canelo)'),
});

/**
 * Duplica una plantilla completa (secciones + partidas) hacia otro modelo,
 * manteniendo el kit. Es la vía rápida para dar de alta la cotización de
 * un modelo nuevo: duplicar la más parecida y ajustar precios.
 */
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

  const parsed = duplicarSchema.safeParse(cuerpo);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Revisa el slug: minúsculas y guiones, por ejemplo "canelo".' },
      { status: 422 },
    );
  }

  const { plantillaId, modeloSlug } = parsed.data;

  try {
    const sql = neon(process.env.DATABASE_URL!);

    const [origen] = (await sql`
      select id, kit from cotizacion_plantillas where id = ${plantillaId}
    `) as Array<{ id: string; kit: string }>;
    if (!origen) {
      return NextResponse.json({ ok: false, error: 'La plantilla de origen no existe.' }, { status: 404 });
    }

    const existe = (await sql`
      select 1 from cotizacion_plantillas where modelo_slug = ${modeloSlug} and kit = ${origen.kit}
    `) as unknown[];
    if (existe.length > 0) {
      return NextResponse.json(
        { ok: false, error: `${modeloSlug} ya tiene plantilla de ese kit. Edítala desde el listado.` },
        { status: 409 },
      );
    }

    // Copia de cabecera + secciones; el título queda marcado para editar
    const [nueva] = (await sql`
      insert into cotizacion_plantillas
        (modelo_slug, kit, titulo, descuento_nombre, descuento_pct, iva_pct, validez_dias, condiciones_pago, notas)
      select ${modeloSlug}, kit,
             ${'MODELO ' + modeloSlug.toUpperCase().replaceAll('-', ' ') + ' LLAVE EN MANO — REVISAR TÍTULO'},
             descuento_nombre, descuento_pct, iva_pct, validez_dias, condiciones_pago, notas
      from cotizacion_plantillas where id = ${plantillaId}
      returning id
    `) as Array<{ id: string }>;

    await sql`
      insert into cotizacion_secciones (plantilla_id, codigo, nombre, obligatoria, orden)
      select ${nueva.id}, codigo, nombre, obligatoria, orden
      from cotizacion_secciones where plantilla_id = ${plantillaId}
    `;

    // Las partidas se mapean sección a sección por su orden (es único por plantilla)
    await sql`
      insert into cotizacion_items (seccion_id, codigo, descripcion, unidad, cantidad, precio_unitario, orden)
      select ns.id, i.codigo, i.descripcion, i.unidad, i.cantidad, i.precio_unitario, i.orden
      from cotizacion_items i
      join cotizacion_secciones vs on vs.id = i.seccion_id and vs.plantilla_id = ${plantillaId}
      join cotizacion_secciones ns on ns.plantilla_id = ${nueva.id} and ns.orden = vs.orden
    `;

    return NextResponse.json({ ok: true, id: nueva.id });
  } catch (error) {
    console.error('[admin/plantillas] error duplicando', error);
    return NextResponse.json({ ok: false, error: 'No se pudo duplicar la plantilla.' }, { status: 500 });
  }
}

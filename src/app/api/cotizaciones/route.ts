import { neon } from '@neondatabase/serverless';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import { NextResponse } from 'next/server';
import { createElement, type ReactElement } from 'react';
import { z } from 'zod';

import { calcularTotales, seccionesElegidas } from '@/features/cotizador/calcular';
import { emitirCotizacionSchema } from '@/features/cotizador/cotizacion.schema';
import { KIT_LABEL, type SnapshotCotizacion } from '@/features/cotizador/cotizacion.types';
import { getPlantilla } from '@/features/cotizador/cotizador.db';
import { formatearFolio } from '@/features/cotizador/folio';
import CotizacionPDF from '@/features/cotizador/pdf/CotizacionPDF';

/**
 * Emite una cotización llave en mano:
 *  1. Recalcula TODO en el servidor desde la DB (del cliente solo viajan
 *     ids de secciones — jamás precios).
 *  2. Guarda folio + snapshot en cotizaciones_emitidas y deja un lead.
 *  3. Devuelve el PDF listo para descargar.
 */
export async function POST(request: Request) {
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Solicitud inválida.' }, { status: 400 });
  }

  const parsed = emitirCotizacionSchema.safeParse(cuerpo);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Revisa los datos del formulario.', detalles: z.treeifyError(parsed.error) },
      { status: 422 },
    );
  }

  const { modeloSlug, kit, seccionIds, nombre, email, telefono, web } = parsed.data;

  // Honeypot: si viene relleno es un bot. Respondemos ok sin dar pistas.
  if (web) {
    return NextResponse.json({ ok: true });
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('[cotizaciones] falta DATABASE_URL');
    return NextResponse.json(
      { ok: false, error: 'No pudimos generar tu cotización. Escríbenos por WhatsApp mientras lo solucionamos.' },
      { status: 500 },
    );
  }

  try {
    const plantilla = await getPlantilla(modeloSlug, kit);
    if (!plantilla) {
      return NextResponse.json(
        { ok: false, error: 'Este modelo aún no tiene cotizador disponible.' },
        { status: 404 },
      );
    }

    const secciones = seccionesElegidas(plantilla, new Set(seccionIds));
    const totales = calcularTotales(plantilla, secciones);

    const snapshotBase: Omit<SnapshotCotizacion, 'folio' | 'fechaISO'> = {
      modeloSlug: plantilla.modeloSlug,
      kit: plantilla.kit,
      titulo: plantilla.titulo,
      descuentoNombre: plantilla.descuentoNombre,
      descuentoPct: plantilla.descuentoPct,
      ivaPct: plantilla.ivaPct,
      validezDias: plantilla.validezDias,
      condicionesPago: plantilla.condicionesPago,
      notas: plantilla.notas,
      cliente: { nombre, email, telefono: telefono || null },
      secciones,
      seccionesTotales: plantilla.secciones.length,
      totales,
    };

    const sql = neon(url);
    const [emitida] = (await sql`
      insert into cotizaciones_emitidas
        (modelo_slug, kit, nombre, email, telefono, snapshot,
         neto_clp, descuento_clp, iva_clp, total_clp)
      values
        (${plantilla.modeloSlug}, ${plantilla.kit}, ${nombre}, ${email}, ${telefono || null},
         ${JSON.stringify(snapshotBase)},
         ${totales.neto}, ${totales.descuento}, ${totales.iva}, ${totales.total})
      returning folio_num, created_at
    `) as Array<{ folio_num: string; created_at: string }>;

    const folio = formatearFolio(emitida.folio_num);
    const cotizacion: SnapshotCotizacion = {
      ...snapshotBase,
      folio,
      fechaISO: new Date(emitida.created_at).toISOString(),
    };

    // La cotización también es un lead para el equipo comercial
    const resumenSecciones = secciones.map((s) => s.nombre).join(', ');
    await sql`
      insert into leads (nombre, email, telefono, mensaje, origen)
      values (
        ${nombre}, ${email}, ${telefono || null},
        ${`Cotización ${folio} · ${plantilla.titulo} · ${KIT_LABEL[kit]} · Total ${totales.total.toLocaleString('es-CL')} CLP · Secciones: ${resumenSecciones}`},
        ${`web:cotizador · ${modeloSlug}/${kit}`}
      )
    `;

    // createElement (y no JSX) porque las rutas viven en .ts; el cast es
    // necesario porque react-pdf tipa el elemento raíz como <Document>.
    const pdf = await renderToBuffer(
      createElement(CotizacionPDF, { cotizacion }) as unknown as ReactElement<DocumentProps>,
    );
    const nombreArchivo = `Cotizacion-MundoSIP-${folio}-${modeloSlug}.pdf`;

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${nombreArchivo}"`,
        'X-Folio': folio,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[cotizaciones] error emitiendo la cotización', error);
    return NextResponse.json(
      { ok: false, error: 'No pudimos generar tu cotización. Inténtalo de nuevo o escríbenos por WhatsApp.' },
      { status: 500 },
    );
  }
}

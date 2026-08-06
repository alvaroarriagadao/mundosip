import { neon } from '@neondatabase/serverless';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import { NextResponse } from 'next/server';
import { createElement, type ReactElement } from 'react';
import { z } from 'zod';

import { esAdmin } from '@/features/admin/auth';
import type { SnapshotCotizacion } from '@/features/cotizador/cotizacion.types';
import { formatearFolio } from '@/features/cotizador/folio';
import CotizacionPDF from '@/features/cotizador/pdf/CotizacionPDF';

interface Contexto {
  params: Promise<{ id: string }>;
}

/**
 * Re-descarga el PDF de una cotización YA emitida, desde su snapshot:
 * el documento sale idéntico al original aunque los precios hayan cambiado.
 */
export async function GET(_request: Request, { params }: Contexto) {
  if (!(await esAdmin())) {
    return NextResponse.json({ ok: false, error: 'Sesión expirada.' }, { status: 401 });
  }

  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json({ ok: false, error: 'Id inválido.' }, { status: 400 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const [fila] = (await sql`
      select folio_num, created_at, modelo_slug, snapshot
      from cotizaciones_emitidas
      where id = ${id}
    `) as Array<{
      folio_num: string;
      created_at: string;
      modelo_slug: string;
      snapshot: Omit<SnapshotCotizacion, 'folio' | 'fechaISO'>;
    }>;

    if (!fila) {
      return NextResponse.json({ ok: false, error: 'La cotización no existe.' }, { status: 404 });
    }

    const folio = formatearFolio(fila.folio_num);
    const cotizacion: SnapshotCotizacion = {
      ...fila.snapshot,
      folio,
      fechaISO: new Date(fila.created_at).toISOString(),
    };

    const pdf = await renderToBuffer(
      createElement(CotizacionPDF, { cotizacion }) as unknown as ReactElement<DocumentProps>,
    );

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Cotizacion-MundoSIP-${folio}-${fila.modelo_slug}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[admin/emitidas] error regenerando PDF', error);
    return NextResponse.json({ ok: false, error: 'No se pudo generar el PDF.' }, { status: 500 });
  }
}

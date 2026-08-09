import { neon } from '@neondatabase/serverless';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import { NextResponse } from 'next/server';
import { createElement, type ReactElement } from 'react';
import { z } from 'zod';

import { esAdmin } from '@/features/admin/auth';
import type { SnapshotPedido } from '@/features/paneles/panel.types';
import { formatearFolioPedido } from '@/features/paneles/pedido.schema';
import PedidoPanelesPDF from '@/features/paneles/pdf/PedidoPanelesPDF';

interface Contexto {
  params: Promise<{ id: string }>;
}

/** Re-descarga el PDF de un pedido de paneles desde su snapshot. */
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
      select folio_num, created_at, snapshot from pedidos_paneles where id = ${id}
    `) as Array<{ folio_num: string; created_at: string; snapshot: Omit<SnapshotPedido, 'folio' | 'fechaISO'> }>;

    if (!fila) {
      return NextResponse.json({ ok: false, error: 'El pedido no existe.' }, { status: 404 });
    }

    const folio = formatearFolioPedido(fila.folio_num);
    const pedido: SnapshotPedido = {
      ...fila.snapshot,
      folio,
      fechaISO: new Date(fila.created_at).toISOString(),
    };

    const pdf = await renderToBuffer(
      createElement(PedidoPanelesPDF, { pedido }) as unknown as ReactElement<DocumentProps>,
    );

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Cotizacion-Paneles-MundoSIP-${folio}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[admin/pedidos-paneles] error regenerando PDF', error);
    return NextResponse.json({ ok: false, error: 'No se pudo generar el PDF.' }, { status: 500 });
  }
}

import { neon } from '@neondatabase/serverless';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import { NextResponse } from 'next/server';
import { createElement, type ReactElement } from 'react';
import { z } from 'zod';

import type { LineaPedido, SnapshotPedido } from '@/features/paneles/panel.types';
import { getPanelesPublicados } from '@/features/paneles/paneles.db';
import { cotizarPanelesSchema, formatearFolioPedido } from '@/features/paneles/pedido.schema';
import PedidoPanelesPDF from '@/features/paneles/pdf/PedidoPanelesPDF';

/**
 * Emite la cotización del carrito de paneles:
 * precios SIEMPRE desde la DB (del cliente solo viajan slugs y cantidades),
 * guarda el pedido con folio PAN-##### + lead, y devuelve el PDF.
 */
export async function POST(request: Request) {
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Solicitud inválida.' }, { status: 400 });
  }

  const parsed = cotizarPanelesSchema.safeParse(cuerpo);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Revisa los datos del formulario.', detalles: z.treeifyError(parsed.error) },
      { status: 422 },
    );
  }

  const { items, nombre, email, telefono, web } = parsed.data;

  // Honeypot: bot detectado, respondemos ok sin dar pistas
  if (web) {
    return NextResponse.json({ ok: true });
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('[paneles/cotizar] falta DATABASE_URL');
    return NextResponse.json(
      { ok: false, error: 'No pudimos generar tu cotización. Escríbenos por WhatsApp mientras lo solucionamos.' },
      { status: 500 },
    );
  }

  try {
    const catalogo = await getPanelesPublicados();
    const porSlug = new Map(catalogo.map((p) => [p.slug, p]));

    const lineas: LineaPedido[] = [];
    for (const item of items) {
      const panel = porSlug.get(item.slug);
      if (!panel) {
        return NextResponse.json(
          { ok: false, error: 'Uno de los paneles ya no está disponible. Recarga la página.' },
          { status: 409 },
        );
      }
      lineas.push({ slug: panel.slug, nombre: panel.nombre, precioClp: panel.precioClp, cantidad: item.cantidad });
    }

    const totalClp = lineas.reduce((suma, l) => suma + l.precioClp * l.cantidad, 0);

    const sql = neon(url);
    const snapshotBase: Omit<SnapshotPedido, 'folio' | 'fechaISO'> = {
      cliente: { nombre, email, telefono: telefono || null },
      lineas,
      totalClp,
    };

    const [fila] = (await sql`
      insert into pedidos_paneles (nombre, email, telefono, snapshot, total_clp)
      values (${nombre}, ${email}, ${telefono || null}, ${JSON.stringify(snapshotBase)}, ${totalClp})
      returning folio_num, created_at
    `) as Array<{ folio_num: string; created_at: string }>;

    const folio = formatearFolioPedido(fila.folio_num);
    const pedido: SnapshotPedido = {
      ...snapshotBase,
      folio,
      fechaISO: new Date(fila.created_at).toISOString(),
    };

    // El pedido también es un lead para el equipo comercial
    const resumen = lineas.map((l) => `${l.cantidad}× ${l.nombre}`).join(', ');
    await sql`
      insert into leads (nombre, email, telefono, mensaje, origen)
      values (
        ${nombre}, ${email}, ${telefono || null},
        ${`Cotización ${folio} · ${resumen} · Total ${totalClp.toLocaleString('es-CL')} CLP`},
        ${'web:paneles'}
      )
    `;

    const pdf = await renderToBuffer(
      createElement(PedidoPanelesPDF, { pedido }) as unknown as ReactElement<DocumentProps>,
    );

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Cotizacion-Paneles-MundoSIP-${folio}.pdf"`,
        'X-Folio': folio,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[paneles/cotizar] error emitiendo el pedido', error);
    return NextResponse.json(
      { ok: false, error: 'No pudimos generar tu cotización. Inténtalo de nuevo o escríbenos por WhatsApp.' },
      { status: 500 },
    );
  }
}

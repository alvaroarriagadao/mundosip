import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { contactoSchema, INTERESES } from '@/features/contacto/contacto.schema';

/** Etiqueta legible del interés, para guardarla junto al mensaje */
function etiquetaInteres(valor: string): string {
  return INTERESES.find((i) => i.valor === valor)?.label ?? valor;
}

export async function POST(request: Request) {
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Solicitud inválida.' }, { status: 400 });
  }

  const parsed = contactoSchema.safeParse(cuerpo);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Revisa los datos del formulario.', detalles: z.treeifyError(parsed.error) },
      { status: 422 },
    );
  }

  const { nombre, email, telefono, interes, mensaje, web } = parsed.data;

  // Honeypot: si viene relleno es un bot. Respondemos ok para no darle pistas.
  if (web) {
    return NextResponse.json({ ok: true });
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('[contacto] falta DATABASE_URL');
    return NextResponse.json(
      { ok: false, error: 'No pudimos registrar tu mensaje. Escríbenos por WhatsApp mientras lo solucionamos.' },
      { status: 500 },
    );
  }

  try {
    const sql = neon(url);
    await sql`
      insert into leads (nombre, email, telefono, mensaje, origen)
      values (
        ${nombre},
        ${email},
        ${telefono || null},
        ${mensaje},
        ${`web:contacto · ${etiquetaInteres(interes)}`}
      )
    `;
  } catch (error) {
    console.error('[contacto] error guardando el lead', error);
    return NextResponse.json(
      { ok: false, error: 'No pudimos registrar tu mensaje. Inténtalo de nuevo o escríbenos por WhatsApp.' },
      { status: 500 },
    );
  }

  // TODO fase 2: enviar aviso por Resend al equipo comercial.
  return NextResponse.json({ ok: true });
}

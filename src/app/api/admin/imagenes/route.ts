import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

import { esAdmin } from '@/features/admin/auth';

/** Tipos que aceptamos y peso máximo ya redimensionado en el navegador */
const MIMES = new Set(['image/webp', 'image/jpeg', 'image/png']);
const MAX_BYTES = 1_500_000;

/**
 * Sube la foto de un producto. El navegador la redimensiona y comprime
 * antes de enviarla; acá solo validamos, guardamos y devolvemos la URL
 * pública (/api/imagenes/<id>) para dejarla en `paneles.imagen_url`.
 */
export async function POST(request: Request) {
  if (!(await esAdmin())) {
    return NextResponse.json({ ok: false, error: 'Sesión expirada.' }, { status: 401 });
  }

  let archivo: File | null = null;
  try {
    const datos = await request.formData();
    const valor = datos.get('archivo');
    if (valor instanceof File) archivo = valor;
  } catch {
    return NextResponse.json({ ok: false, error: 'No pudimos leer el archivo.' }, { status: 400 });
  }

  if (!archivo) {
    return NextResponse.json({ ok: false, error: 'Elige una imagen.' }, { status: 400 });
  }
  if (!MIMES.has(archivo.type)) {
    return NextResponse.json(
      { ok: false, error: 'Formato no admitido. Usa JPG, PNG o WebP.' },
      { status: 415 },
    );
  }
  if (archivo.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: 'La imagen pesa demasiado. Prueba con una más liviana.' },
      { status: 413 },
    );
  }

  try {
    const buffer = Buffer.from(await archivo.arrayBuffer());
    const sql = neon(process.env.DATABASE_URL!);
    const [fila] = (await sql`
      insert into imagenes (mime, datos, nombre, bytes)
      values (${archivo.type}, ${buffer.toString('base64')}, ${archivo.name || null}, ${buffer.byteLength})
      returning id
    `) as Array<{ id: string }>;

    return NextResponse.json({ ok: true, url: `/api/imagenes/${fila.id}` });
  } catch (error) {
    console.error('[admin/imagenes] error guardando la imagen', error);
    return NextResponse.json({ ok: false, error: 'No se pudo guardar la imagen.' }, { status: 500 });
  }
}

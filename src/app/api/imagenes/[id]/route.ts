import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { z } from 'zod';

interface Contexto {
  params: Promise<{ id: string }>;
}

/**
 * Sirve una imagen subida desde el admin. Es pública (son fotos de
 * catálogo) y va con cache inmutable: el id nunca se reutiliza, así
 * que el navegador puede guardarla para siempre.
 */
export async function GET(_request: Request, { params }: Contexto) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json({ error: 'Id inválido.' }, { status: 400 });
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    return NextResponse.json({ error: 'No disponible.' }, { status: 500 });
  }

  try {
    const sql = neon(url);
    const [fila] = (await sql`select mime, datos from imagenes where id = ${id}`) as Array<{
      mime: string;
      datos: string;
    }>;

    if (!fila) {
      return NextResponse.json({ error: 'Imagen no encontrada.' }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(Buffer.from(fila.datos, 'base64')), {
      headers: {
        'Content-Type': fila.mime,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('[imagenes] error sirviendo la imagen', error);
    return NextResponse.json({ error: 'No disponible.' }, { status: 500 });
  }
}

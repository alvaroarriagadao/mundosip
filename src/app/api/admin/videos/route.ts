import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

import { esAdmin } from '@/features/admin/auth';

/**
 * Firma la subida de videos del panel a Vercel Blob.
 *
 * El archivo NO pasa por esta función: el navegador lo sube directo al
 * storage con un token firmado aquí (así no chocamos con el límite de
 * 4.5 MB por request de Vercel). En la base solo queda la URL.
 */
export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          'El almacenamiento de videos no está configurado: crea un Blob store en Vercel (Storage → Create → Blob) y conéctalo al proyecto.',
      },
      { status: 500 },
    );
  }

  let cuerpo: HandleUploadBody;
  try {
    cuerpo = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  try {
    const respuesta = await handleUpload({
      body: cuerpo,
      request,
      onBeforeGenerateToken: async () => {
        if (!(await esAdmin())) throw new Error('Sesión expirada.');
        return {
          allowedContentTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
          maximumSizeInBytes: 100 * 1024 * 1024, // videos cortos: sobra
          addRandomSuffix: true,
        };
      },
      // El aviso de término llega por webhook (no alcanza a localhost);
      // no dependemos de él: el cliente ya recibe la URL al subir.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(respuesta);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo subir el video.';
    console.error('[admin/videos] error firmando subida', error);
    return NextResponse.json({ error: mensaje }, { status: 400 });
  }
}

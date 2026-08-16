/**
 * Utilidades de fotos del panel — SOLO cliente (usa canvas y fetch).
 *
 * El equipo arrastra fotos de 5 MB del celular sin pensar en formatos:
 * aquí se redimensionan y comprimen EN EL NAVEGADOR (WebP, proporción
 * original) y llegan al servidor pesando decenas de KB.
 */

/** Redimensiona al ancho máximo manteniendo la proporción y comprime a WebP */
export async function prepararFoto(archivo: File, anchoMax = 1600, calidad = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, anchoMax / bitmap.width);
  const ancho = Math.round(bitmap.width * escala);
  const alto = Math.round(bitmap.height * escala);

  const lienzo = document.createElement('canvas');
  lienzo.width = ancho;
  lienzo.height = alto;
  const ctx = lienzo.getContext('2d');
  if (!ctx) throw new Error('sin canvas');
  ctx.drawImage(bitmap, 0, 0, ancho, alto);
  bitmap.close();

  return new Promise((resolver, rechazar) => {
    lienzo.toBlob((b) => (b ? resolver(b) : rechazar(new Error('sin blob'))), 'image/webp', calidad);
  });
}

/** Comprime y sube una foto; devuelve la URL servible o un mensaje de error */
export async function subirFoto(
  archivo: File,
  anchoMax = 1600,
): Promise<{ url: string } | { error: string }> {
  if (!archivo.type.startsWith('image/')) {
    return { error: 'Ese archivo no es una imagen.' };
  }
  try {
    const optimizada = await prepararFoto(archivo, anchoMax);
    const cuerpo = new FormData();
    cuerpo.append('archivo', new File([optimizada], 'foto.webp', { type: 'image/webp' }));

    const respuesta = await fetch('/api/admin/imagenes', { method: 'POST', body: cuerpo });
    const datos = (await respuesta.json().catch(() => null)) as { url?: string; error?: string } | null;
    if (!respuesta.ok || !datos?.url) {
      return { error: datos?.error ?? 'No se pudo subir la foto.' };
    }
    return { url: datos.url };
  } catch {
    return { error: 'No se pudo procesar la imagen. Prueba con otra.' };
  }
}

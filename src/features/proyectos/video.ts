/**
 * Convierte un link "normal" de YouTube o Vimeo (el que el equipo copia
 * del navegador) en la URL embebible del reproductor.
 *
 * Acepta las formas más comunes; devuelve null si no es un video
 * reconocible — el admin usa eso para avisar antes de guardar.
 */
export function urlEmbedVideo(url: string): string | null {
  const limpia = url.trim();
  if (!limpia) return null;

  // youtube.com/watch?v=ID · youtu.be/ID · youtube.com/shorts/ID · youtube.com/embed/ID
  const youtube = limpia.match(
    /^https:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,20})/,
  );
  if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube[1]}`;

  // vimeo.com/123456789
  const vimeo = limpia.match(/^https:\/\/(?:www\.)?vimeo\.com\/(\d{6,12})/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return null;
}

/** Archivo de video subido desde el panel (Vercel Blob) o un .mp4/.webm directo */
export function esVideoArchivo(url: string): boolean {
  const limpia = url.trim();
  if (!limpia.startsWith('https://')) return false;
  return /\.(mp4|webm|mov)(\?.*)?$/i.test(limpia) || limpia.includes('blob.vercel-storage.com');
}

export type MedioVideo =
  | { tipo: 'embed'; src: string } // YouTube/Vimeo → iframe
  | { tipo: 'archivo'; src: string }; // archivo subido → <video>

/** Clasifica el video del proyecto; null si la URL no es reconocible */
export function medioVideo(url: string | null): MedioVideo | null {
  if (!url || !url.trim()) return null;
  const embed = urlEmbedVideo(url);
  if (embed) return { tipo: 'embed', src: embed };
  if (esVideoArchivo(url)) return { tipo: 'archivo', src: url.trim() };
  return null;
}

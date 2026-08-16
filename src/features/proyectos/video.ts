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

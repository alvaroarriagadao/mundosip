'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

import type { ImagenModelo } from '@/features/modelos/modelo.types';
import { colors, motionTokens, radii } from '@/theme/tokens';

import { prepararFoto } from './fotos';
import { inputSx } from './ui';

interface GaleriaEditableProps {
  portada: ImagenModelo | null;
  galeria: ImagenModelo[];
  nombreModelo: string;
  onCambiar: (datos: { portada: ImagenModelo | null; galeria: ImagenModelo[] }) => void;
}

/**
 * Galería del modelo: subir fotos desde el computador, elegir cuál es
 * la portada (la que se ve en el listado y en el hero) y ordenarlas.
 *
 * Internamente portada y galería son una sola fila de imágenes: la
 * primera marcada con estrella es la portada. Para el equipo es una
 * sola cosa —"las fotos del modelo"— y no dos conceptos separados.
 */
export default function GaleriaEditable({ portada, galeria, nombreModelo, onCambiar }: GaleriaEditableProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [encima, setEncima] = useState(false);

  /** Todas las fotos en una lista; índice 0 = portada */
  const fotos: ImagenModelo[] = portada ? [portada, ...galeria] : galeria;

  function emitir(nuevas: ImagenModelo[]) {
    onCambiar({
      portada: nuevas.length > 0 ? nuevas[0] : null,
      galeria: nuevas.slice(1),
    });
  }

  async function subir(archivos: FileList | null) {
    if (!archivos || archivos.length === 0) return;
    const validos = [...archivos].filter((a) => a.type.startsWith('image/'));
    if (validos.length === 0) {
      setError('Esos archivos no son imágenes.');
      return;
    }

    setError(null);
    setSubiendo(validos.length);
    const subidas: ImagenModelo[] = [];

    try {
      for (const archivo of validos) {
        const optimizada = await prepararFoto(archivo);
        const cuerpo = new FormData();
        cuerpo.append('archivo', new File([optimizada], 'render.webp', { type: 'image/webp' }));
        const respuesta = await fetch('/api/admin/imagenes', { method: 'POST', body: cuerpo });
        const datos = (await respuesta.json().catch(() => null)) as { url?: string; error?: string } | null;
        if (!respuesta.ok || !datos?.url) {
          setError(datos?.error ?? 'No se pudo subir una de las fotos.');
          break;
        }
        subidas.push({ url: datos.url, alt: `Render del modelo ${nombreModelo}` });
        setSubiendo((n) => n - 1);
      }
      if (subidas.length > 0) emitir([...fotos, ...subidas]);
    } catch {
      setError('No se pudo procesar la imagen. Prueba con otra.');
    } finally {
      setSubiendo(0);
    }
  }

  function mover(indice: number, delta: number) {
    const destino = indice + delta;
    if (destino < 0 || destino >= fotos.length) return;
    const copia = [...fotos];
    [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
    emitir(copia);
  }

  const accionSx = {
    width: 28,
    height: 28,
    border: 0,
    borderRadius: `${radii.sm}px`,
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'rgba(13, 33, 41, 0.55)',
    color: colors.cream,
    cursor: 'pointer',
    transition: `background-color 0.2s ${motionTokens.easeCss}`,
    '&:hover': { bgcolor: colors.tealNight },
    '&:disabled': { opacity: 0.35, cursor: 'default' },
  } as const;

  return (
    <Box>
      {/* Zona para subir */}
      <Box
        onDragOver={(e: React.DragEvent) => {
          e.preventDefault();
          setEncima(true);
        }}
        onDragLeave={() => setEncima(false)}
        onDrop={(e: React.DragEvent) => {
          e.preventDefault();
          setEncima(false);
          void subir(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
          px: 2,
          py: 2.5,
          mb: 2,
          borderRadius: `${radii.md}px`,
          border: '1.5px dashed',
          borderColor: encima ? colors.teal : 'divider',
          bgcolor: encima ? 'rgba(32, 78, 95, 0.06)' : 'transparent',
          cursor: 'pointer',
          textAlign: 'center',
          transition: `all 0.2s ${motionTokens.easeCss}`,
          '&:hover': { borderColor: colors.teal },
        }}
      >
        <Box aria-hidden sx={{ color: subiendo ? colors.teal : colors.muted, display: 'grid' }}>
          {subiendo ? (
            <Box component="span" sx={{ display: 'inline-flex', animation: 'giro 1s linear infinite', '@keyframes giro': { to: { transform: 'rotate(360deg)' } } }}>
              <Loader2 size={22} />
            </Box>
          ) : (
            <ImagePlus size={22} />
          )}
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: subiendo ? colors.teal : 'text.primary' }}>
          {subiendo ? `Procesando ${subiendo} foto${subiendo > 1 ? 's' : ''}…` : 'Subir fotos del modelo'}
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.45, maxWidth: 420 }}>
          Arrastra los renders o haz clic. Puedes elegir varios a la vez. Ideal horizontales (16:10);
          nosotros las ajustamos y comprimimos.
        </Typography>
      </Box>

      <Box
        component="input"
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          void subir(e.target.files);
          e.target.value = '';
        }}
        sx={{ display: 'none' }}
      />

      {error && <Typography sx={{ mb: 1.5, fontSize: '0.82rem', color: '#B4472E' }}>{error}</Typography>}

      {fotos.length === 0 ? (
        <Typography sx={{ fontSize: '0.88rem', color: 'text.secondary' }}>
          Aún no hay fotos. La primera que subas será la portada.
        </Typography>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          {fotos.map((foto, i) => (
            <Box
              key={`${foto.url}-${i}`}
              sx={{
                border: '1px solid',
                borderColor: i === 0 ? colors.tan : 'divider',
                borderRadius: `${radii.md}px`,
                overflow: 'hidden',
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ position: 'relative', aspectRatio: '16 / 10', bgcolor: '#FBF9F5' }}>
                <Box component="img" src={foto.url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                {i === 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1,
                      py: 0.4,
                      borderRadius: `${radii.pill}px`,
                      bgcolor: colors.tan,
                      color: colors.tealNight,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    <Star size={12} fill="currentColor" /> Portada
                  </Box>
                )}

                <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                  <Box component="button" type="button" aria-label="Mover antes" disabled={i === 0} onClick={() => mover(i, -1)} sx={accionSx}>
                    <ArrowLeft size={14} />
                  </Box>
                  <Box component="button" type="button" aria-label="Mover después" disabled={i === fotos.length - 1} onClick={() => mover(i, 1)} sx={accionSx}>
                    <ArrowRight size={14} />
                  </Box>
                  <Box
                    component="button"
                    type="button"
                    aria-label="Eliminar foto"
                    onClick={() => emitir(fotos.filter((_, j) => j !== i))}
                    sx={{ ...accionSx, '&:hover': { bgcolor: '#B4472E' } }}
                  >
                    <Trash2 size={14} />
                  </Box>
                </Box>
              </Box>

              <Box sx={{ p: 1.25 }}>
                <Box
                  component="input"
                  value={foto.alt}
                  placeholder="Describe la foto (accesibilidad)"
                  aria-label={`Descripción de la foto ${i + 1}`}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    emitir(fotos.map((f, j) => (j === i ? { ...f, alt: e.target.value } : f)))
                  }
                  sx={{ ...inputSx, fontSize: '0.84rem', py: 0.7 }}
                />
                {i !== 0 && (
                  <Box
                    component="button"
                    type="button"
                    onClick={() => {
                      const copia = [...fotos];
                      const [elegida] = copia.splice(i, 1);
                      emitir([elegida, ...copia]);
                    }}
                    sx={{
                      mt: 0.75,
                      border: 0,
                      bgcolor: 'transparent',
                      p: 0,
                      cursor: 'pointer',
                      color: colors.teal,
                      fontFamily: 'inherit',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      '&:hover': { color: colors.tanDark },
                    }}
                  >
                    <Star size={12} /> Usar como portada
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ArrowLeft, ArrowRight, GripVertical, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

import type { ImagenProyecto } from '@/features/proyectos/proyecto.types';
import { colors, motionTokens, radii } from '@/theme/tokens';

import { subirFoto } from './fotos';
import { inputSx } from './ui';

interface GaleriaFotosProps {
  fotos: ImagenProyecto[];
  onCambiar: (fotos: ImagenProyecto[]) => void;
  /** Recomendación de dimensiones que ve el equipo antes de subir */
  ayuda: string;
  /** Descripción inicial de cada foto subida (accesibilidad) */
  altPorDefecto: string;
  maximo?: number;
}

/**
 * Galería de fotos sin roles: subir varias de una vez y ordenarlas
 * ARRASTRANDO cada tarjeta a su lugar (con flechas como alternativa,
 * que en el celular son más cómodas que arrastrar).
 */
export default function GaleriaFotos({ fotos, onCambiar, ayuda, altPorDefecto, maximo = 12 }: GaleriaFotosProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [encima, setEncima] = useState(false);
  /** Índice de la foto que se está arrastrando para reordenar */
  const [arrastrando, setArrastrando] = useState<number | null>(null);
  const [destino, setDestino] = useState<number | null>(null);

  async function subir(archivos: FileList | null) {
    if (!archivos || archivos.length === 0) return;
    const validos = [...archivos].filter((a) => a.type.startsWith('image/'));
    if (validos.length === 0) {
      setError('Esos archivos no son imágenes.');
      return;
    }
    if (fotos.length + validos.length > maximo) {
      setError(`Máximo ${maximo} fotos en la galería.`);
      return;
    }

    setError(null);
    setSubiendo(validos.length);
    const subidas: ImagenProyecto[] = [];
    for (const archivo of validos) {
      const resultado = await subirFoto(archivo);
      if ('error' in resultado) {
        setError(resultado.error);
        break;
      }
      subidas.push({ url: resultado.url, alt: altPorDefecto });
      setSubiendo((n) => n - 1);
    }
    setSubiendo(0);
    if (subidas.length > 0) onCambiar([...fotos, ...subidas]);
  }

  function mover(indice: number, delta: number) {
    const hasta = indice + delta;
    if (hasta < 0 || hasta >= fotos.length) return;
    const copia = [...fotos];
    [copia[indice], copia[hasta]] = [copia[hasta], copia[indice]];
    onCambiar(copia);
  }

  /** Suelta la foto arrastrada en su nueva posición */
  function soltarEn(indice: number) {
    if (arrastrando == null || arrastrando === indice) {
      setArrastrando(null);
      setDestino(null);
      return;
    }
    const copia = [...fotos];
    const [movida] = copia.splice(arrastrando, 1);
    copia.splice(indice, 0, movida);
    onCambiar(copia);
    setArrastrando(null);
    setDestino(null);
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
          // Los arrastres internos de reordenar no deben activar la zona de subida
          if (arrastrando != null) return;
          e.preventDefault();
          setEncima(true);
        }}
        onDragLeave={() => setEncima(false)}
        onDrop={(e: React.DragEvent) => {
          if (arrastrando != null) return;
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
          {subiendo ? `Procesando ${subiendo} foto${subiendo > 1 ? 's' : ''}…` : 'Subir fotos a la galería'}
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.45, maxWidth: 440 }}>
          {ayuda}
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
          Aún no hay fotos en la galería.
        </Typography>
      ) : (
        <>
          <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mb: 1.25 }}>
            Arrastra las fotos para cambiar su orden (o usa las flechas).
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            {fotos.map((foto, i) => (
              <Box
                key={`${foto.url}-${i}`}
                draggable
                onDragStart={(e: React.DragEvent) => {
                  e.dataTransfer.effectAllowed = 'move';
                  setArrastrando(i);
                }}
                onDragEnd={() => {
                  setArrastrando(null);
                  setDestino(null);
                }}
                onDragOver={(e: React.DragEvent) => {
                  if (arrastrando == null) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (destino !== i) setDestino(i);
                }}
                onDrop={(e: React.DragEvent) => {
                  if (arrastrando == null) return;
                  e.preventDefault();
                  soltarEn(i);
                }}
                sx={{
                  border: '1px solid',
                  borderColor: destino === i && arrastrando !== i ? colors.teal : 'divider',
                  borderRadius: `${radii.md}px`,
                  overflow: 'hidden',
                  bgcolor: 'background.paper',
                  opacity: arrastrando === i ? 0.45 : 1,
                  cursor: 'grab',
                  transition: `border-color 0.15s ${motionTokens.easeCss}, opacity 0.15s ${motionTokens.easeCss}`,
                  '&:active': { cursor: 'grabbing' },
                }}
              >
                <Box sx={{ position: 'relative', aspectRatio: '16 / 10', bgcolor: '#FBF9F5' }}>
                  <Box component="img" src={foto.url} alt="" draggable={false} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                  <Box
                    aria-hidden
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.4,
                      px: 0.9,
                      py: 0.4,
                      borderRadius: `${radii.pill}px`,
                      bgcolor: 'rgba(13, 33, 41, 0.55)',
                      color: colors.cream,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    <GripVertical size={12} /> {i + 1}
                  </Box>

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
                      onClick={() => onCambiar(fotos.filter((_, j) => j !== i))}
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
                      onCambiar(fotos.map((f, j) => (j === i ? { ...f, alt: e.target.value } : f)))
                    }
                    sx={{ ...inputSx, fontSize: '0.84rem', py: 0.7 }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}

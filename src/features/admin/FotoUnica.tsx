'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ImagePlus, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

import type { ImagenProyecto } from '@/features/proyectos/proyecto.types';
import { colors, motionTokens, radii } from '@/theme/tokens';

import { subirFoto } from './fotos';
import { inputSx } from './ui';

interface FotoUnicaProps {
  valor: ImagenProyecto | null;
  onCambiar: (foto: ImagenProyecto | null) => void;
  /** Nombre del campo, ej "Foto de portada" */
  titulo: string;
  /** Recomendación de dimensiones que ve el equipo antes de subir */
  ayuda: string;
  /** Proporción de la vista previa, igual a la del sitio: '16 / 10', '4 / 4.6'… */
  aspecto: string;
  /** Descripción inicial de la foto (accesibilidad) */
  altPorDefecto: string;
  /** Ancho máximo con que se guarda (px) */
  anchoMax?: number;
}

/**
 * Campo de UNA foto con rol fijo (portada, foto de la reseña).
 *
 * La vista previa usa la misma proporción con que el sitio la recorta:
 * lo que el equipo ve aquí es lo que va a quedar en la página, sin
 * sorpresas de encuadre.
 */
export default function FotoUnica({
  valor,
  onCambiar,
  titulo,
  ayuda,
  aspecto,
  altPorDefecto,
  anchoMax = 1600,
}: FotoUnicaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [encima, setEncima] = useState(false);

  async function subir(archivo: File | undefined) {
    if (!archivo) return;
    setSubiendo(true);
    setError(null);
    const resultado = await subirFoto(archivo, anchoMax);
    setSubiendo(false);
    if ('error' in resultado) {
      setError(resultado.error);
      return;
    }
    onCambiar({ url: resultado.url, alt: valor?.alt || altPorDefecto });
  }

  const zonaProps = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setEncima(true);
    },
    onDragLeave: () => setEncima(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setEncima(false);
      void subir(e.dataTransfer.files?.[0]);
    },
    onClick: () => inputRef.current?.click(),
  };

  return (
    <Box>
      <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 0.25 }}>{titulo}</Typography>
      <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mb: 1.25 }}>{ayuda}</Typography>

      {valor ? (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: `${radii.md}px`,
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ position: 'relative', aspectRatio: aspecto, bgcolor: '#FBF9F5' }}>
            {/* <img> y no next/image: la fuente cambia al vuelo tras cada subida */}
            <Box component="img" src={valor.url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {subiendo && (
              <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', bgcolor: 'rgba(246, 241, 234, 0.7)', color: colors.teal }}>
                <Box component="span" sx={{ display: 'inline-flex', animation: 'giro 1s linear infinite', '@keyframes giro': { to: { transform: 'rotate(360deg)' } } }}>
                  <Loader2 size={26} />
                </Box>
              </Box>
            )}
          </Box>
          <Box sx={{ p: 1.25 }}>
            <Box
              component="input"
              value={valor.alt}
              placeholder="Describe la foto (accesibilidad)"
              aria-label={`Descripción de ${titulo.toLowerCase()}`}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onCambiar({ ...valor, alt: e.target.value })}
              sx={{ ...inputSx, fontSize: '0.84rem', py: 0.7 }}
            />
            <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
              <Box
                component="button"
                type="button"
                {...zonaProps}
                sx={{
                  border: 0,
                  bgcolor: 'transparent',
                  p: 0,
                  cursor: 'pointer',
                  color: colors.teal,
                  fontFamily: 'inherit',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  '&:hover': { color: colors.tanDark },
                }}
              >
                <RefreshCw size={13} /> Cambiar la foto
              </Box>
              <Box
                component="button"
                type="button"
                onClick={() => onCambiar(null)}
                sx={{
                  border: 0,
                  bgcolor: 'transparent',
                  p: 0,
                  cursor: 'pointer',
                  color: colors.muted,
                  fontFamily: 'inherit',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  '&:hover': { color: '#B4472E' },
                }}
              >
                <Trash2 size={13} /> Quitar
              </Box>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box
          {...zonaProps}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            px: 2,
            py: 3,
            aspectRatio: aspecto,
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
          <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: subiendo ? colors.teal : 'text.primary' }}>
            {subiendo ? 'Procesando la foto…' : 'Arrastra la foto o haz clic'}
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
            JPG, PNG o WebP. Nosotros la ajustamos y comprimimos.
          </Typography>
        </Box>
      )}

      <Box
        component="input"
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          void subir(e.target.files?.[0]);
          e.target.value = '';
        }}
        sx={{ display: 'none' }}
      />

      {error && <Typography sx={{ mt: 1, fontSize: '0.82rem', color: '#B4472E' }}>{error}</Typography>}
    </Box>
  );
}

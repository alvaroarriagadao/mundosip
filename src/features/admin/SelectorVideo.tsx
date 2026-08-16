'use client';

import { upload } from '@vercel/blob/client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Check, Clapperboard, Loader2, Trash2, TriangleAlert } from 'lucide-react';
import { useRef, useState } from 'react';

import { medioVideo } from '@/features/proyectos/video';
import { colors, motionTokens, radii } from '@/theme/tokens';

import { inputSx } from './ui';

interface SelectorVideoProps {
  /** URL actual: link de YouTube/Vimeo o archivo ya subido */
  valor: string;
  onCambiar: (url: string) => void;
}

/**
 * Campo de video del proyecto, con las dos vías que usa el equipo:
 * subir el archivo corto directo desde el computador (va a Vercel Blob,
 * el navegador lo sube con token firmado) o pegar un link de
 * YouTube/Vimeo. Ambas terminan en la misma URL guardada.
 */
export default function SelectorVideo({ valor, onCambiar }: SelectorVideoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progreso, setProgreso] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [encima, setEncima] = useState(false);

  const medio = medioVideo(valor);

  async function subir(archivo: File | undefined) {
    if (!archivo) return;
    if (!archivo.type.startsWith('video/')) {
      setError('Ese archivo no es un video. Usa MP4, WebM o MOV.');
      return;
    }
    if (archivo.size > 100 * 1024 * 1024) {
      setError('El video pesa más de 100 MB. Recórtalo o comprímelo antes de subirlo.');
      return;
    }

    setError(null);
    setProgreso(0);
    try {
      const blob = await upload(archivo.name, archivo, {
        access: 'public',
        handleUploadUrl: '/api/admin/videos',
        multipart: true,
        onUploadProgress: ({ percentage }) => setProgreso(Math.round(percentage)),
      });
      onCambiar(blob.url);
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : '';
      setError(
        mensaje.includes('configurado')
          ? mensaje
          : 'No se pudo subir el video. Revisa tu conexión e inténtalo de nuevo.',
      );
    } finally {
      setProgreso(null);
    }
  }

  const subiendo = progreso != null;

  return (
    <Box>
      {/* Zona de subida */}
      <Box
        onDragOver={(e: React.DragEvent) => {
          e.preventDefault();
          setEncima(true);
        }}
        onDragLeave={() => setEncima(false)}
        onDrop={(e: React.DragEvent) => {
          e.preventDefault();
          setEncima(false);
          void subir(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
          px: 2,
          py: 2,
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
              <Loader2 size={20} />
            </Box>
          ) : (
            <Clapperboard size={20} />
          )}
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: subiendo ? colors.teal : 'text.primary' }}>
          {subiendo ? `Subiendo… ${progreso}%` : medio?.tipo === 'archivo' ? 'Cambiar el video' : 'Subir un video corto'}
        </Typography>
        <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', lineHeight: 1.45, maxWidth: 420 }}>
          Arrastra el archivo o haz clic. MP4, WebM o MOV; ideal 20–30 segundos (máximo 100 MB).
        </Typography>
        {subiendo && (
          <Box sx={{ width: '100%', maxWidth: 320, height: 5, borderRadius: 3, bgcolor: 'rgba(13, 33, 41, 0.1)', overflow: 'hidden', mt: 0.5 }}>
            <Box sx={{ width: `${progreso}%`, height: '100%', bgcolor: colors.teal, transition: 'width 0.2s ease' }} />
          </Box>
        )}
      </Box>

      <Box
        component="input"
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          void subir(e.target.files?.[0]);
          e.target.value = '';
        }}
        sx={{ display: 'none' }}
      />

      {/* Vista previa del archivo subido */}
      {medio?.tipo === 'archivo' && (
        <Box sx={{ mt: 1.5, borderRadius: `${radii.md}px`, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <Box component="video" src={medio.src} controls playsInline preload="metadata" sx={{ display: 'block', width: '100%', maxHeight: 260, bgcolor: colors.tealNight }} />
        </Box>
      )}

      {/* La otra vía: pegar un link */}
      <Typography sx={{ mt: 2, mb: 0.5, fontSize: '0.8rem', fontWeight: 600, color: 'text.secondary' }}>
        …o pega un link de YouTube o Vimeo
      </Typography>
      <Box
        component="input"
        value={valor}
        placeholder="https://www.youtube.com/watch?v=…"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onCambiar(e.target.value)}
        sx={inputSx}
      />

      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        {valor.trim() !== '' &&
          (medio ? (
            <Typography sx={{ fontSize: '0.82rem', color: colors.teal, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              <Check size={14} strokeWidth={2.5} />
              {medio.tipo === 'archivo' ? 'Video subido: se verá en la página.' : 'Video reconocido: se verá en la página.'}
            </Typography>
          ) : (
            <Typography sx={{ fontSize: '0.82rem', color: '#B4472E', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              <TriangleAlert size={13} /> Ese link no parece de YouTube, Vimeo ni un video subido.
            </Typography>
          ))}
        {valor.trim() !== '' && (
          <Box
            component="button"
            type="button"
            onClick={() => onCambiar('')}
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
            <Trash2 size={13} /> Quitar el video
          </Box>
        )}
      </Box>

      {error && <Typography sx={{ mt: 1, fontSize: '0.82rem', color: '#B4472E' }}>{error}</Typography>}
    </Box>
  );
}

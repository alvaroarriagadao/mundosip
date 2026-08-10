'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import { colors, motionTokens, radii } from '@/theme/tokens';

/** Lado máximo de la foto guardada: suficiente para la ficha, liviano de servir */
const LADO_MAX = 900;
const CALIDAD = 0.82;

/**
 * Redimensiona y comprime la foto EN EL NAVEGADOR antes de subirla.
 *
 * Así el equipo puede arrastrar una foto de 5 MB del celular sin
 * pensar en formatos: llega al servidor como WebP de ~60 KB, cuadrada
 * sobre fondo blanco para que todas las fichas se vean parejas.
 */
async function prepararImagen(archivo: File): Promise<Blob> {
  const bitmap = await createImageBitmap(archivo);
  const lado = Math.min(LADO_MAX, Math.max(bitmap.width, bitmap.height));

  const lienzo = document.createElement('canvas');
  lienzo.width = lado;
  lienzo.height = lado;
  const ctx = lienzo.getContext('2d');
  if (!ctx) throw new Error('sin canvas');

  // Fondo blanco: los PNG con transparencia no quedan con bordes negros
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, lado, lado);

  // Contiene la imagen completa dentro del cuadrado, centrada
  const escala = Math.min(lado / bitmap.width, lado / bitmap.height);
  const ancho = bitmap.width * escala;
  const alto = bitmap.height * escala;
  ctx.drawImage(bitmap, (lado - ancho) / 2, (lado - alto) / 2, ancho, alto);
  bitmap.close();

  return new Promise((resolver, rechazar) => {
    lienzo.toBlob(
      (blob) => (blob ? resolver(blob) : rechazar(new Error('sin blob'))),
      'image/webp',
      CALIDAD,
    );
  });
}

interface SelectorImagenProps {
  valor: string;
  onCambiar: (url: string) => void;
  /** Se muestra cuando no hay foto propia */
  fallback: string;
}

/** Campo de foto: arrastrar o elegir archivo, con vista previa. */
export default function SelectorImagen({ valor, onCambiar, fallback }: SelectorImagenProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [encima, setEncima] = useState(false);

  async function subir(archivo: File | undefined) {
    if (!archivo) return;
    if (!archivo.type.startsWith('image/')) {
      setError('Ese archivo no es una imagen.');
      return;
    }

    setSubiendo(true);
    setError(null);
    try {
      const optimizada = await prepararImagen(archivo);
      const cuerpo = new FormData();
      cuerpo.append('archivo', new File([optimizada], 'foto.webp', { type: 'image/webp' }));

      const respuesta = await fetch('/api/admin/imagenes', { method: 'POST', body: cuerpo });
      const datos = (await respuesta.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!respuesta.ok || !datos?.url) {
        setError(datos?.error ?? 'No se pudo subir la foto.');
        return;
      }
      onCambiar(datos.url);
    } catch {
      setError('No se pudo procesar la imagen. Prueba con otra.');
    } finally {
      setSubiendo(false);
    }
  }

  const tieneFoto = valor.trim().length > 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
        {/* Vista previa */}
        <Box
          sx={{
            position: 'relative',
            width: 96,
            height: 96,
            flexShrink: 0,
            borderRadius: `${radii.md}px`,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: '#FBF9F5',
            overflow: 'hidden',
          }}
        >
          {/* <img> y no next/image: la fuente cambia al vuelo tras cada subida */}
          <Box
            component="img"
            src={tieneFoto ? valor : fallback}
            alt=""
            sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.75 }}
          />
        </Box>

        {/* Zona de arrastre / botón */}
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
            flex: 1,
            minWidth: 220,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            px: 2,
            py: 1.5,
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
            ) : encima ? (
              <Upload size={20} />
            ) : (
              <ImagePlus size={20} />
            )}
          </Box>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: subiendo ? colors.teal : 'text.primary' }}>
            {subiendo ? 'Procesando la foto…' : tieneFoto ? 'Cambiar foto' : 'Subir una foto'}
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', lineHeight: 1.4 }}>
            Arrastra la imagen o haz clic. JPG, PNG o WebP; ideal cuadrada de 900×900. Nosotros la
            ajustamos y comprimimos.
          </Typography>
        </Box>

        {tieneFoto && (
          <Box
            component="button"
            type="button"
            onClick={() => onCambiar('')}
            title="Usar la foto estándar del panel"
            aria-label="Quitar la foto"
            sx={{
              alignSelf: 'center',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: `${radii.sm}px`,
              width: 36,
              height: 36,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'transparent',
              color: colors.muted,
              cursor: 'pointer',
              flexShrink: 0,
              transition: `color 0.2s ${motionTokens.easeCss}`,
              '&:hover': { color: '#B4472E' },
            }}
          >
            <Trash2 size={16} />
          </Box>
        )}
      </Box>

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

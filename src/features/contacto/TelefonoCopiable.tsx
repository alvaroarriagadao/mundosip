'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Check, Copy, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';

import { colors, motionTokens, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

interface TelefonoCopiableProps {
  /** Número tal como se muestra: "+56 9 4036 7867" */
  numero: string;
  detalle: string;
}

const cajaSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  p: 2,
  width: '100%',
  borderRadius: `${radii.md}px`,
  bgcolor: 'rgba(246, 241, 234, 0.05)',
  border: '1px solid rgba(246, 241, 234, 0.12)',
  color: 'inherit',
  textAlign: 'left',
  textDecoration: 'none',
  transition: `transform 0.3s ${motionTokens.easeCss}, background-color 0.3s ${motionTokens.easeCss}`,
  '&:hover': { transform: 'translateX(6px)', bgcolor: 'rgba(246, 241, 234, 0.09)' },
  '&:focus-visible': { outline: `2px solid ${colors.tan}`, outlineOffset: 3 },
} as const;

function Contenido({ numero, detalle }: TelefonoCopiableProps) {
  return (
    <>
      <Box
        aria-hidden
        sx={{
          flexShrink: 0,
          width: 42,
          height: 42,
          borderRadius: `${radii.sm}px`,
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'rgba(246, 241, 234, 0.1)',
          color: colors.cream,
        }}
      >
        <Phone size={20} strokeWidth={2} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.3 }}>{numero}</Typography>
        <Typography
          sx={{ fontFamily: monoFamily, fontSize: '0.72rem', letterSpacing: '0.06em', color: 'rgba(246, 241, 234, 0.6)' }}
        >
          Teléfono · {detalle}
        </Typography>
      </Box>
    </>
  );
}

/**
 * Tarjeta del teléfono.
 *
 * En escritorio un enlace `tel:` abre Skype o FaceTime, que casi nadie usa
 * en Chile: ahí el número se copia al portapapeles. En pantallas táctiles,
 * donde `tel:` sí marca, la tarjeta actúa como enlace. La distinción se
 * hace por CSS (`hover: none`) para no depender de JS ni romper el SSR.
 */
export default function TelefonoCopiable({ numero, detalle }: TelefonoCopiableProps) {
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!copiado) return;
    const t = setTimeout(() => setCopiado(false), 2200);
    return () => clearTimeout(t);
  }, [copiado]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(numero.replace(/\s/g, ''));
      setCopiado(true);
    } catch {
      // Si el navegador bloquea el portapapeles, el número sigue visible
      // y se puede seleccionar a mano.
    }
  };

  return (
    <>
      {/* Táctil: marcar directo */}
      <Box
        component="a"
        href={`tel:${numero.replace(/\s/g, '')}`}
        sx={{
          ...cajaSx,
          display: 'none',
          '@media (hover: none) and (pointer: coarse)': { display: 'flex' },
        }}
      >
        <Contenido numero={numero} detalle={detalle} />
      </Box>

      {/* Escritorio: copiar al portapapeles */}
      <Box
        component="button"
        type="button"
        onClick={copiar}
        aria-label={`Copiar el teléfono ${numero}`}
        sx={{
          ...cajaSx,
          cursor: 'pointer',
          font: 'inherit',
          appearance: 'none',
          '@media (hover: none) and (pointer: coarse)': { display: 'none' },
        }}
      >
        <Contenido numero={numero} detalle={detalle} />
        <Box
          aria-hidden
          sx={{
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            fontFamily: monoFamily,
            fontSize: '0.68rem',
            letterSpacing: '0.12em',
            color: copiado ? colors.tanLight : 'rgba(246, 241, 234, 0.5)',
            transition: `color 0.25s ${motionTokens.easeCss}`,
          }}
        >
          {copiado ? <Check size={14} /> : <Copy size={14} />}
          {copiado ? 'COPIADO' : 'COPIAR'}
        </Box>
      </Box>
    </>
  );
}

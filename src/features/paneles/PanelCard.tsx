'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Check, Minus, Plus } from 'lucide-react';

import { formatCLP } from '@/lib/format';
import { colors, motionTokens, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

import type { PanelProducto } from './panel.types';

/** Imagen estándar cuando el producto no trae la suya */
export const IMAGEN_DEFECTO = '/images/paneles/panel-sip.png';

/** Control − cantidad + */
function Stepper({
  cantidad,
  onCambiar,
  etiqueta,
}: {
  cantidad: number;
  onCambiar: (nueva: number) => void;
  etiqueta: string;
}) {
  const botonSx = {
    width: 32,
    height: 32,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: `${radii.sm}px`,
    bgcolor: 'background.paper',
    color: colors.teal,
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    transition: `all 0.2s ${motionTokens.easeCss}`,
    '&:hover': { borderColor: colors.teal, bgcolor: 'rgba(32, 78, 95, 0.06)' },
  } as const;

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
      <Box component="button" type="button" aria-label={`Quitar uno de ${etiqueta}`} onClick={() => onCambiar(cantidad - 1)} sx={botonSx}>
        <Minus size={14} strokeWidth={2.5} />
      </Box>
      <Typography
        component="span"
        aria-live="polite"
        sx={{ fontFamily: monoFamily, fontWeight: 700, fontSize: '1rem', minWidth: 28, textAlign: 'center' }}
      >
        {cantidad}
      </Typography>
      <Box component="button" type="button" aria-label={`Agregar uno de ${etiqueta}`} onClick={() => onCambiar(cantidad + 1)} sx={botonSx}>
        <Plus size={14} strokeWidth={2.5} />
      </Box>
    </Box>
  );
}

interface PanelCardProps {
  panel: PanelProducto;
  cantidad: number;
  onCambiar: (nueva: number) => void;
  onVerCaracteristicas: () => void;
}

/**
 * Card de producto de la tienda.
 *
 * Layout horizontal: foto cuadrada a la izquierda, datos a la derecha.
 * Es lo que mejor aprovecha el ancho disponible cuando el carrito ocupa
 * una columna — en vertical las cards quedaban altas y flacas. Las
 * características van a un modal para que abrirlas no descuadre la
 * grilla ni cambie el alto de la card.
 */
export default function PanelCard({ panel, cantidad, onCambiar, onVerCaracteristicas }: PanelCardProps) {
  const elegido = cantidad > 0;

  return (
    <Box
      sx={{
        display: 'flex',
        // width al 100%: el Reveal que la envuelve es flex y sin esto la
        // card se encoge a su contenido en vez de llenar la columna
        width: '100%',
        height: '100%',
        borderRadius: `${radii.md}px`,
        border: '1px solid',
        borderColor: elegido ? colors.teal : 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        transition: `border-color 0.25s ${motionTokens.easeCss}, box-shadow 0.25s ${motionTokens.easeCss}`,
        boxShadow: elegido ? '0 10px 30px -18px rgba(32, 78, 95, 0.5)' : 'none',
        '&:hover': { boxShadow: '0 10px 30px -18px rgba(13, 33, 41, 0.35)' },
      }}
    >
      {/* Foto cuadrada, ancho fijo: todas las cards se ven parejas */}
      <Box
        sx={{
          position: 'relative',
          width: { xs: 108, sm: 132 },
          flexShrink: 0,
          bgcolor: '#FBF9F5',
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Box
          component="img"
          src={panel.imagenUrl || IMAGEN_DEFECTO}
          alt={panel.nombre}
          loading="lazy"
          sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 1.25 }}
        />
        {elegido && (
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              width: 22,
              height: 22,
              borderRadius: '50%',
              bgcolor: colors.teal,
              color: colors.cream,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Check size={13} strokeWidth={3} />
          </Box>
        )}
      </Box>

      {/* Datos y acción */}
      <Box sx={{ flex: 1, minWidth: 0, p: { xs: 1.75, sm: 2 }, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.02rem', lineHeight: 1.25 }}>{panel.nombre}</Typography>
          {panel.dimensiones && (
            <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', mt: 0.25 }}>
              {panel.dimensiones}
            </Typography>
          )}
        </Box>

        <Typography sx={{ fontFamily: monoFamily, fontWeight: 700, fontSize: '1.15rem', color: 'text.primary' }}>
          {formatCLP(panel.precioClp)}
        </Typography>

        <Box
          component="button"
          type="button"
          onClick={onVerCaracteristicas}
          sx={{
            alignSelf: 'flex-start',
            border: 0,
            bgcolor: 'transparent',
            p: 0,
            cursor: 'pointer',
            color: colors.teal,
            fontSize: '0.85rem',
            fontWeight: 600,
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            '&:hover': { color: colors.tanDark },
          }}
        >
          Ver características
        </Box>

        {/* Acción al fondo: la fila de compra queda alineada en todas las cards */}
        <Box sx={{ mt: 'auto', pt: 1 }}>
          {elegido ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
              <Stepper cantidad={cantidad} onCambiar={onCambiar} etiqueta={panel.nombre} />
              <Typography sx={{ fontFamily: monoFamily, fontWeight: 700, fontSize: '0.95rem', color: colors.teal }}>
                {formatCLP(panel.precioClp * cantidad)}
              </Typography>
            </Box>
          ) : (
            <Box
              component="button"
              type="button"
              onClick={() => onCambiar(1)}
              sx={{
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                px: 2,
                py: 1,
                borderRadius: `${radii.pill}px`,
                border: '1.5px solid',
                borderColor: colors.teal,
                bgcolor: 'transparent',
                color: colors.teal,
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: `all 0.2s ${motionTokens.easeCss}`,
                '&:hover': { bgcolor: colors.teal, color: colors.cream },
              }}
            >
              <Plus size={16} strokeWidth={2.5} /> Agregar
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

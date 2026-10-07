'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Tag } from 'lucide-react';

import { formatCLP } from '@/lib/format';
import { colors, radii } from '@/theme/tokens';
import { displayFamily, monoFamily } from '@/theme/typography';

import { NOTA_IVA, formatPct, precioConPromocion, promocionVigente, type Promocion } from './precio';

interface PrecioKitProps {
  precio: number;
  promocion?: Promocion | null;
  /** card: sobre fondo claro, compacto · hero: sobre fondo oscuro, grande */
  variante: 'card' | 'hero';
}

/**
 * El precio del kit en una sola pieza reutilizable: con promoción
 * vigente muestra el precio original tachado, el rebajado destacado y
 * una etiqueta con el nombre de la promo; sin promoción, el precio y
 * la leyenda del IVA. Así card y ficha nunca dicen cosas distintas.
 */
export default function PrecioKit({ precio, promocion, variante }: PrecioKitProps) {
  const hero = variante === 'hero';
  const hayPromo = promocionVigente(promocion);
  const precioFinal = hayPromo ? precioConPromocion(precio, promocion) : precio;

  const colorPrecio = hero ? colors.cream : colors.tanDark;
  const colorSuave = hero ? 'rgba(246, 241, 234, 0.6)' : 'text.secondary';

  return (
    <Box>
      {hayPromo && (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.6,
            mb: hero ? 1.5 : 1,
            px: 1.25,
            py: 0.45,
            borderRadius: `${radii.pill}px`,
            bgcolor: hero ? colors.tan : 'rgba(185, 138, 78, 0.16)',
            color: hero ? colors.tealNight : colors.tanDark,
            fontSize: hero ? '0.8rem' : '0.74rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
          }}
        >
          <Tag size={hero ? 13 : 12} />
          {promocion.nombre || 'Descuento'} · -{formatPct(promocion.descuentoPct)}
        </Box>
      )}

      {hayPromo && (
        <Typography
          component="p"
          aria-label={`Precio normal ${formatCLP(precio)}`}
          sx={{
            fontFamily: displayFamily,
            fontWeight: 600,
            fontSize: hero ? '1.15rem' : '0.95rem',
            lineHeight: 1.1,
            color: colorSuave,
            textDecoration: 'line-through',
            textDecorationThickness: '1.5px',
            mb: 0.5,
          }}
        >
          {formatCLP(precio)}
        </Typography>
      )}

      <Typography
        component="p"
        sx={{
          fontFamily: displayFamily,
          fontWeight: 800,
          fontSize: hero ? 'clamp(2.2rem, 4vw, 2.9rem)' : '1.45rem',
          lineHeight: 1,
          letterSpacing: '-0.01em',
          color: colorPrecio,
        }}
      >
        {formatCLP(precioFinal)}
      </Typography>

      <Typography
        component="p"
        sx={{
          mt: 0.6,
          fontFamily: monoFamily,
          fontSize: hero ? '0.74rem' : '0.66rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: colorSuave,
        }}
      >
        {NOTA_IVA}
      </Typography>
    </Box>
  );
}

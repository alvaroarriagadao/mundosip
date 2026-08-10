'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { colors, motionTokens } from '@/theme/tokens';

interface ToggleProps {
  activo: boolean;
  onCambiar: (activo: boolean) => void;
  /** Texto a la derecha; cambia según el estado */
  etiqueta: string;
  /** Descripción para lectores de pantalla si la etiqueta no basta */
  ariaLabel?: string;
  disabled?: boolean;
}

/**
 * Interruptor clásico (switch). Es un checkbox nativo estilizado, así
 * que hereda teclado y lectores de pantalla; la forma de riel + perilla
 * comunica "esto se prende y se apaga" mejor que cualquier chip.
 */
export default function Toggle({ activo, onCambiar, etiqueta, ariaLabel, disabled = false }: ToggleProps) {
  return (
    <Box
      component="label"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        cursor: disabled ? 'default' : 'pointer',
        userSelect: 'none',
      }}
    >
      <Box sx={{ position: 'relative', width: 40, height: 23, flexShrink: 0 }}>
        <Box
          component="input"
          type="checkbox"
          role="switch"
          checked={activo}
          disabled={disabled}
          aria-label={ariaLabel ?? etiqueta}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onCambiar(e.target.checked)}
          sx={{
            appearance: 'none',
            WebkitAppearance: 'none',
            width: 40,
            height: 23,
            m: 0,
            borderRadius: 999,
            bgcolor: activo ? colors.teal : colors.muted,
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'default' : 'pointer',
            transition: `background-color 0.25s ${motionTokens.easeCss}`,
            '&:focus-visible': { outline: `3px solid ${colors.tanLight}`, outlineOffset: '2px' },
          }}
        />
        {/* Perilla */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: 3,
            left: activo ? 20 : 3,
            width: 17,
            height: 17,
            borderRadius: '50%',
            bgcolor: colors.cream,
            boxShadow: '0 1px 3px rgba(13, 33, 41, 0.3)',
            pointerEvents: 'none',
            transition: `left 0.25s ${motionTokens.easeCss}`,
          }}
        />
      </Box>
      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: activo ? 'text.primary' : 'text.secondary', whiteSpace: 'nowrap' }}>
        {etiqueta}
      </Typography>
    </Box>
  );
}

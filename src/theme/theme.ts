'use client';

import { createTheme } from '@mui/material/styles';
import type { Shadows } from '@mui/material/styles';

import { components } from './components';
import { palette } from './palette';
import { radii } from './tokens';
import { typography } from './typography';

/**
 * Sombras propias: suaves y difusas, nunca las elevaciones duras
 * de Material. Se generan en una escala continua.
 */
const softShadows: Shadows = [
  'none',
  ...Array.from({ length: 24 }, (_, i) => {
    const n = i + 1;
    const y = Math.round(4 + n * 2.2);
    const blur = Math.round(16 + n * 3.4);
    const alpha = Math.min(0.05 + n * 0.006, 0.2);
    return `0 ${y}px ${blur}px -${Math.round(n * 1.4)}px rgba(19, 46, 56, ${alpha.toFixed(3)})`;
  }),
] as Shadows;

export const theme = createTheme({
  cssVariables: true,
  palette,
  typography,
  components,
  shape: { borderRadius: radii.md },
  spacing: 8,
  shadows: softShadows,
});

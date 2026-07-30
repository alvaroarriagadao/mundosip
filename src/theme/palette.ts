import type { PaletteOptions } from '@mui/material/styles';

import { colors } from './tokens';

export const palette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: colors.teal,
    dark: colors.tealDeep,
    light: '#3A6B7E',
    contrastText: colors.cream,
  },
  secondary: {
    main: colors.tan,
    dark: colors.tanDark,
    light: colors.tanLight,
    contrastText: colors.ink,
  },
  background: {
    default: colors.cream,
    paper: colors.paper,
  },
  text: {
    primary: colors.ink,
    secondary: colors.muted,
  },
  divider: colors.line,
};

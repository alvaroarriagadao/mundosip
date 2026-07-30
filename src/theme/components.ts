import type { ThemeOptions } from '@mui/material/styles';

import { colors, motionTokens, radii } from './tokens';

/**
 * Overrides globales de MUI: el objetivo es que nada se lea como
 * Material Design de Google — sombras suaves, radios propios,
 * sin ripple, sin mayúsculas forzadas.
 */
export const components: ThemeOptions['components'] = {
  MuiButtonBase: {
    defaultProps: {
      disableRipple: true,
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: radii.pill,
        padding: '13px 28px',
        transition: `background-color ${motionTokens.dur.hover}s ${motionTokens.easeCss}, border-color ${motionTokens.dur.hover}s ${motionTokens.easeCss}, color ${motionTokens.dur.hover}s ${motionTokens.easeCss}, transform ${motionTokens.dur.hover}s ${motionTokens.easeCss}`,
        '&:focus-visible': {
          outline: `2px solid ${colors.tan}`,
          outlineOffset: 3,
        },
      },
    },
    variants: [
      {
        props: { size: 'small' },
        style: { padding: '9px 20px', fontSize: '0.875rem' },
      },
      {
        props: { size: 'large' },
        style: { padding: '16px 34px', fontSize: '1rem' },
      },
      {
        props: { variant: 'contained', color: 'primary' },
        style: {
          backgroundColor: colors.teal,
          '&:hover': { backgroundColor: colors.tealDeep },
        },
      },
      {
        props: { variant: 'contained', color: 'secondary' },
        style: {
          backgroundColor: colors.tan,
          color: colors.tealNight,
          '&:hover': { backgroundColor: colors.tanLight },
        },
      },
      {
        props: { variant: 'outlined' },
        style: { borderWidth: 1.5, '&:hover': { borderWidth: 1.5 } },
      },
      {
        props: { variant: 'outlined', color: 'primary' },
        style: {
          borderColor: colors.ink,
          color: colors.ink,
          '&:hover': {
            borderColor: colors.teal,
            backgroundColor: 'rgba(32, 78, 95, 0.06)',
          },
        },
      },
    ],
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: radii.sm,
        '&:focus-visible': {
          outline: `2px solid ${colors.tan}`,
          outlineOffset: 3,
        },
      },
    },
  },
  MuiLink: {
    defaultProps: {
      underline: 'none',
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: colors.line,
      },
    },
  },
};

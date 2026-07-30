import type { ThemeOptions } from '@mui/material/styles';

export const displayFamily = 'var(--font-display), Montserrat, Helvetica, Arial, sans-serif';
export const bodyFamily = 'var(--font-sans), Lato, Helvetica, Arial, sans-serif';
export const monoFamily = 'var(--font-mono), "Space Mono", ui-monospace, monospace';

export const typography: ThemeOptions['typography'] = {
  fontFamily: bodyFamily,
  h1: {
    fontFamily: displayFamily,
    fontWeight: 800,
    fontSize: 'clamp(2.8rem, 6.4vw, 5.4rem)',
    lineHeight: 1.06,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontFamily: displayFamily,
    fontWeight: 800,
    fontSize: 'clamp(2rem, 4vw, 3.2rem)',
    lineHeight: 1.1,
    letterSpacing: '-0.015em',
  },
  h3: {
    fontFamily: displayFamily,
    fontWeight: 700,
    fontSize: 'clamp(1.5rem, 2.6vw, 2.1rem)',
    lineHeight: 1.15,
    letterSpacing: '-0.005em',
  },
  h4: {
    fontFamily: displayFamily,
    fontWeight: 700,
    fontSize: '1.35rem',
    lineHeight: 1.2,
  },
  h5: {
    fontFamily: displayFamily,
    fontWeight: 700,
    fontSize: '1.15rem',
    lineHeight: 1.3,
  },
  h6: {
    fontFamily: displayFamily,
    fontWeight: 700,
    fontSize: '1rem',
    lineHeight: 1.35,
  },
  subtitle1: {
    fontSize: '1.2rem',
    lineHeight: 1.65,
    fontWeight: 400,
  },
  body1: {
    fontSize: '1.125rem',
    lineHeight: 1.7,
  },
  body2: {
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  button: {
    fontFamily: bodyFamily,
    fontWeight: 600,
    fontSize: '0.95rem',
    letterSpacing: '0.01em',
    textTransform: 'none',
  },
  overline: {
    fontFamily: monoFamily,
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.3em',
    textTransform: 'uppercase',
    lineHeight: 1.6,
  },
  caption: {
    fontFamily: monoFamily,
    fontSize: '0.85rem',
    letterSpacing: '0.04em',
    lineHeight: 1.5,
  },
};

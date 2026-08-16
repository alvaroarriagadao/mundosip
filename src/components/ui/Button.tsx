'use client';

import MuiButton from '@mui/material/Button';
import type { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import Box from '@mui/material/Box';
import { ArrowUpRight } from 'lucide-react';
import NextLink from 'next/link';

import { colors, motionTokens } from '@/theme/tokens';

interface ButtonProps extends MuiButtonProps {
  /** Flecha con micro-interacción de barrido en hover */
  arrow?: boolean;
  /** Ajusta bordes/texto para fondos oscuros (hero, footer) */
  onDark?: boolean;
  /** Para links externos (se usa <a> nativo en vez de next/link) */
  target?: string;
  rel?: string;
}

/** Flecha doble: la visible sale y entra la segunda en diagonal */
function ArrowSwap() {
  return (
    <Box
      component="span"
      aria-hidden
      sx={{
        position: 'relative',
        display: 'inline-flex',
        width: 18,
        height: 18,
        overflow: 'hidden',
        '& svg': {
          position: 'absolute',
          inset: 0,
          transition: `transform 0.35s ${motionTokens.easeCss}`,
        },
        '& svg:last-of-type': {
          transform: 'translate(-120%, 120%)',
        },
        '.MuiButton-root:hover & svg:first-of-type': {
          transform: 'translate(120%, -120%)',
        },
        '.MuiButton-root:hover & svg:last-of-type': {
          transform: 'translate(0, 0)',
        },
      }}
    >
      <ArrowUpRight size={18} strokeWidth={2} />
      <ArrowUpRight size={18} strokeWidth={2} />
    </Box>
  );
}

/**
 * Botón de marca: envuelve MUI Button con flecha animada,
 * soporte para fondos oscuros y next/link automático vía `href`.
 */
export default function Button({ arrow = false, onDark = false, sx, children, href, target, rel, ...rest }: ButtonProps) {
  const isExternal = href?.startsWith('http') || href?.startsWith('mailto:') || href?.startsWith('tel:');
  const darkStyles =
    onDark && rest.variant === 'outlined'
      ? {
          borderColor: 'rgba(246, 241, 234, 0.45)',
          color: colors.cream,
          '&:hover': {
            borderColor: colors.cream,
            backgroundColor: 'rgba(246, 241, 234, 0.08)',
          },
        }
      : {};

  return (
    <MuiButton
      {...rest}
      {...(href
        ? isExternal
          ? { component: 'a' as const, href, target, rel }
          : // NextLink también respeta target/rel: sin esto, "abrir en otra
            // pestaña" se perdía y el link navegaba en la misma
            { component: NextLink, href, target, rel }
        : {})}
      endIcon={arrow ? <ArrowSwap /> : rest.endIcon}
      sx={[darkStyles, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {children}
    </MuiButton>
  );
}

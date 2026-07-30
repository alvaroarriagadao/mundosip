'use client';

import Box from '@mui/material/Box';
import Image from 'next/image';
import NextLink from 'next/link';

interface LogoProps {
  /** `light` para fondos oscuros (hero, footer, menú móvil), `dark` para fondos claros */
  variant?: 'light' | 'dark';
  /** Alto en px; el ancho se deriva del aspecto del PNG (312×160) */
  height?: number;
}

/** Logotipo oficial MundoSIP (PNG en public/brand, generado desde assets/logo.png) */
export default function Logo({ variant = 'dark', height = 44 }: LogoProps) {
  const width = Math.round((312 / 160) * height);

  return (
    <Box
      component={NextLink}
      href="/"
      aria-label="MundoSIP — Inicio"
      sx={{ display: 'inline-flex', alignItems: 'center', lineHeight: 0 }}
    >
      <Image
        src={variant === 'light' ? '/brand/logo-light.png' : '/brand/logo-dark.png'}
        alt="MundoSIP"
        width={width}
        height={height}
        priority
        style={{ height, width: 'auto' }}
      />
    </Box>
  );
}

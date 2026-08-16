'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ArrowUpRight, HardHat } from 'lucide-react';
import Image from 'next/image';
import NextLink from 'next/link';

import type { Proyecto } from '@/features/proyectos/proyecto.types';
import { colors, motionTokens, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

interface ProjectCardProps {
  proyecto: Proyecto;
  /** Card ancha (grilla editorial) o angosta */
  wide?: boolean;
}

/** Card clickeable de proyecto: foto protagonista + datos esenciales */
export default function ProjectCard({ proyecto, wide = false }: ProjectCardProps) {
  return (
    <Box
      component={NextLink}
      href={`/proyecto/${proyecto.slug}`}
      aria-label={`Ver proyecto ${proyecto.nombre}`}
      sx={{
        position: 'relative',
        display: 'block',
        borderRadius: `${radii.lg}px`,
        overflow: 'hidden',
        textDecoration: 'none',
        aspectRatio: { xs: '4 / 3', md: wide ? '16 / 10.5' : '4 / 3.4' },
        isolation: 'isolate',
        '&:hover img': { transform: 'scale(1.05)' },
        '&:hover .card-arrow': { opacity: 1, transform: 'translate(0, 0)' },
        '&:hover .card-veil': { opacity: 0.92 },
        '&:focus-visible': { outline: `2px solid ${colors.tan}`, outlineOffset: 3 },
      }}
    >
      <Image
        src={proyecto.portada.url}
        alt={proyecto.portada.alt}
        fill
        sizes={wide ? '(max-width: 900px) 100vw, 58vw' : '(max-width: 900px) 100vw, 42vw'}
        style={{ objectFit: 'cover', transition: `transform 0.8s ${motionTokens.easeCss}` }}
      />
      <Box
        className="card-veil"
        sx={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(185deg, rgba(13, 33, 41, 0.16) 0%, rgba(13, 33, 41, 0.02) 42%, rgba(13, 33, 41, 0.86) 100%)`,
          opacity: 0.8,
          transition: `opacity 0.4s ${motionTokens.easeCss}`,
        }}
      />
      {/* Obras en proceso: el visitante lo sabe antes de entrar */}
      {proyecto.estado === 'en_proceso' && (
        <Box
          sx={{
            position: 'absolute',
            top: 18,
            left: 18,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.6,
            px: 1.4,
            py: 0.55,
            borderRadius: `${radii.pill}px`,
            bgcolor: colors.tan,
            color: colors.tealNight,
            fontSize: '0.76rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        >
          <HardHat size={13} /> En construcción
        </Box>
      )}
      <Box
        className="card-arrow"
        aria-hidden
        sx={{
          position: 'absolute',
          top: 18,
          right: 18,
          width: 42,
          height: 42,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: colors.cream,
          color: colors.ink,
          opacity: { xs: 1, md: 0 },
          transform: { xs: 'none', md: 'translate(-6px, 6px)' },
          transition: `opacity 0.35s ${motionTokens.easeCss}, transform 0.35s ${motionTokens.easeCss}`,
        }}
      >
        <ArrowUpRight size={20} />
      </Box>
      <Box sx={{ position: 'absolute', inset: 'auto 0 0 0', p: { xs: 2.5, md: 3 } }}>
        <Typography
          component="p"
          sx={{
            fontFamily: monoFamily,
            fontSize: '0.78rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: colors.tanLight,
            mb: 0.75,
          }}
        >
          {proyecto.superficieM2} m² · {proyecto.ubicacion}
        </Typography>
        <Typography variant="h4" sx={{ color: colors.cream, mb: 0.5 }}>
          {proyecto.nombre}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.92rem',
            lineHeight: 1.5,
            color: 'rgba(246, 241, 234, 0.75)',
            maxWidth: 520,
            display: { xs: 'none', sm: 'block' },
          }}
        >
          {proyecto.resumen}
        </Typography>
      </Box>
    </Box>
  );
}

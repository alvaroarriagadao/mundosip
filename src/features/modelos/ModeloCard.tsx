'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ArrowUpRight, Bath, BedDouble, Ruler } from 'lucide-react';
import Image from 'next/image';
import NextLink from 'next/link';

import { formatCLP } from '@/lib/format';
import type { Modelo } from '@/features/modelos/modelo.types';
import { colors, motionTokens, radii } from '@/theme/tokens';
import { displayFamily, monoFamily } from '@/theme/typography';

/** Chip de especificación con ícono (m², dormitorios, baños) */
function Spec({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
      {icon}
      <Typography component="span" sx={{ fontFamily: monoFamily, fontSize: '0.85rem', letterSpacing: '0.04em' }}>
        {label}
      </Typography>
    </Box>
  );
}

/** Card de modelo para el listado: render + specs + precio como oferta */
export default function ModeloCard({ modelo }: { modelo: Modelo }) {
  return (
    <Box
      component={NextLink}
      href={`/modelos/${modelo.slug}`}
      aria-label={`Ver ficha del modelo ${modelo.nombre}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        bgcolor: 'background.paper',
        borderRadius: `${radii.lg}px`,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        transition: `transform 0.4s ${motionTokens.easeCss}, box-shadow 0.4s ${motionTokens.easeCss}`,
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 32px 70px -28px rgba(19, 46, 56, 0.35)',
        },
        '&:hover img': { transform: 'scale(1.05)' },
        '&:hover .modelo-arrow': { opacity: 1, transform: 'translate(0,0)' },
        '&:focus-visible': { outline: `2px solid ${colors.tan}`, outlineOffset: 3 },
      }}
    >
      <Box sx={{ position: 'relative', aspectRatio: '16 / 10', overflow: 'hidden' }}>
        <Image
          src={modelo.portada.url}
          alt={modelo.portada.alt}
          fill
          sizes="(max-width: 900px) 100vw, 33vw"
          style={{ objectFit: 'cover', transition: `transform 0.8s ${motionTokens.easeCss}` }}
        />
        <Box
          className="modelo-arrow"
          aria-hidden
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 40,
            height: 40,
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
          <ArrowUpRight size={19} />
        </Box>
      </Box>

      <Box sx={{ p: { xs: 3, md: 3.5 }, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="h3" component="h2" sx={{ color: 'text.primary' }}>
            {modelo.nombre}
          </Typography>
          <Typography
            component="span"
            sx={{
              fontFamily: displayFamily,
              fontWeight: 700,
              fontSize: '1.05rem',
              color: 'text.secondary',
              whiteSpace: 'nowrap',
            }}
          >
            {modelo.superficieM2} m²
          </Typography>
        </Box>

        {/* Altura fija a 3 líneas: todas las cards miden lo mismo sin importar
            el largo del resumen que escriba el admin */}
        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: '1rem',
            lineHeight: 1.6,
            height: '4.8em',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
            overflow: 'hidden',
          }}
        >
          {modelo.resumen}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 2.5, rowGap: 1 }}>
          <Spec icon={<Ruler size={16} />} label={`${modelo.superficieM2} m²`} />
          <Spec icon={<BedDouble size={16} />} label={`${modelo.habitaciones} dorm`} />
          <Spec icon={<Bath size={16} />} label={`${modelo.banos} baños`} />
        </Box>

        <Box
          sx={{
            mt: 'auto',
            borderTop: '1px solid',
            borderColor: 'divider',
            pt: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box>
            <Typography
              component="p"
              sx={{ fontFamily: monoFamily, fontSize: '0.7rem', letterSpacing: '0.2em', color: 'text.secondary', mb: 0.25 }}
            >
              KIT DESDE
            </Typography>
            <Typography
              component="p"
              sx={{
                fontFamily: displayFamily,
                fontWeight: 800,
                fontSize: '1.45rem',
                lineHeight: 1,
                color: colors.tanDark,
                letterSpacing: '-0.01em',
              }}
            >
              {formatCLP(modelo.precioDesdeCLP)}
            </Typography>
          </Box>
          <Typography
            component="span"
            sx={{
              fontFamily: displayFamily,
              fontWeight: 600,
              fontSize: '0.78rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'primary.main',
            }}
          >
            Ver modelo →
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

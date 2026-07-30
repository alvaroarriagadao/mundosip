'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import useEmblaCarousel from 'embla-carousel-react';
import { Bath, BedDouble, ChevronLeft, ChevronRight, Ruler } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import { formatCLP } from '@/lib/format';
import type { Modelo } from '@/features/modelos/modelo.types';
import { colors, layout, motionTokens, radii } from '@/theme/tokens';
import { displayFamily, monoFamily } from '@/theme/typography';

function SpecChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: 1.75,
        py: 0.75,
        borderRadius: `${radii.pill}px`,
        border: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      {icon}
      <Typography component="span" sx={{ fontFamily: monoFamily, fontSize: '0.85rem', letterSpacing: '0.03em' }}>
        {label}
      </Typography>
    </Box>
  );
}

/**
 * Hero de la ficha de modelo: carrusel de renders + panel de compra.
 * Toda la información llega del repositorio; nada hardcodeado.
 */
export default function ModeloHero({ modelo }: { modelo: Modelo }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <Box component="header" sx={{ pt: `${layout.headerHeight.desktop + 56}px`, pb: { xs: 8, md: 11 } }}>
      <Container>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' },
            gap: { xs: 4, md: 6 },
            alignItems: 'start',
          }}
        >
          {/* Carrusel de renders */}
          <Box sx={{ position: 'relative', borderRadius: `${radii.lg}px`, overflow: 'hidden' }}>
            <Box ref={emblaRef} sx={{ overflow: 'hidden' }}>
              <Box sx={{ display: 'flex' }}>
                {modelo.galeria.map((imagen, i) => (
                  <Box key={imagen.url} sx={{ position: 'relative', flex: '0 0 100%', aspectRatio: '16 / 10.5' }}>
                    <Image
                      src={imagen.url}
                      alt={imagen.alt}
                      fill
                      priority={i === 0}
                      sizes="(max-width: 900px) 100vw, 58vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>

            <IconButton
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Render anterior"
              sx={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(246, 241, 234, 0.9)',
                color: colors.ink,
                '&:hover': { bgcolor: colors.cream },
              }}
            >
              <ChevronLeft size={22} />
            </IconButton>
            <IconButton
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Render siguiente"
              sx={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(246, 241, 234, 0.9)',
                color: colors.ink,
                '&:hover': { bgcolor: colors.cream },
              }}
            >
              <ChevronRight size={22} />
            </IconButton>

            <Typography
              component="span"
              sx={{
                position: 'absolute',
                right: 16,
                bottom: 14,
                fontFamily: monoFamily,
                fontSize: '0.8rem',
                letterSpacing: '0.15em',
                color: colors.cream,
                bgcolor: 'rgba(13, 33, 41, 0.55)',
                px: 1.5,
                py: 0.5,
                borderRadius: `${radii.sm}px`,
              }}
            >
              {String(selected + 1).padStart(2, '0')} / {String(modelo.galeria.length).padStart(2, '0')}
            </Typography>
          </Box>

          {/* Panel de información y precio */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Eyebrow>Modelo · Kit autoconstrucción</Eyebrow>
              <Typography variant="h1" component="h1" sx={{ mt: 1.5 }}>
                {modelo.nombre}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
              <SpecChip icon={<Ruler size={15} />} label={`${modelo.superficieM2} m²`} />
              <SpecChip icon={<BedDouble size={15} />} label={`${modelo.habitaciones} dormitorios`} />
              <SpecChip icon={<Bath size={15} />} label={`${modelo.banos} baños`} />
            </Box>

            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {modelo.descripcion}
            </Typography>

            {/* Precio como oferta */}
            <Box
              sx={{
                bgcolor: colors.tealDeep,
                color: colors.cream,
                borderRadius: `${radii.lg}px`,
                p: { xs: 3, md: 3.5 },
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: `radial-gradient(120% 120% at 100% 0%, rgba(185, 138, 78, 0.22) 0%, transparent 55%)`,
                }}
              />
              <Box sx={{ position: 'relative' }}>
                <Typography
                  component="p"
                  sx={{
                    fontFamily: monoFamily,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    letterSpacing: '0.24em',
                    color: colors.tanLight,
                    mb: 1,
                  }}
                >
                  KIT AUTOCONSTRUCCIÓN · DESDE
                </Typography>
                <Typography
                  component="p"
                  sx={{
                    fontFamily: displayFamily,
                    fontWeight: 800,
                    fontSize: 'clamp(2.2rem, 4vw, 2.9rem)',
                    lineHeight: 1,
                    letterSpacing: '-0.01em',
                    mb: 1.5,
                  }}
                >
                  {formatCLP(modelo.precioDesdeCLP)}
                </Typography>
                <Typography sx={{ fontSize: '0.95rem', color: 'rgba(246, 241, 234, 0.75)', mb: 3 }}>
                  Incluye planos, paneles dimensionados, fijaciones y capacitación en terreno.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <Button variant="contained" color="secondary" arrow href="/contacto">
                    Cotizar este modelo
                  </Button>
                  <Button
                    variant="outlined"
                    onDark
                    href="https://wa.me/56940367867"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </Button>
                </Box>
              </Box>
            </Box>

            <Typography
              component="p"
              sx={{
                fontFamily: monoFamily,
                fontSize: '0.8rem',
                letterSpacing: `0.06em`,
                color: 'text.secondary',
                transition: `color ${motionTokens.dur.hover}s`,
              }}
            >
              Despacho a todo Chile · Montaje en semanas, no meses
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

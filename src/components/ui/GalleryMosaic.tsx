'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Reveal from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';
import { EASE } from '@/lib/motion';
import { colors, motionTokens, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

interface ImagenGaleria {
  url: string;
  alt: string;
}

interface GalleryMosaicProps {
  /** Nombre de la obra/modelo, para el aria-label del lightbox */
  nombre: string;
  imagenes: ImagenGaleria[];
  /** Título de la sección */
  titulo?: string;
}

/** Patrón del mosaico: se repite cada 6 imágenes (span en grilla de 12) */
const MOSAIC_PATTERN = [
  { col: 'span 7', aspect: '16 / 10' },
  { col: 'span 5', aspect: '4 / 3.45' },
  { col: 'span 4', aspect: '4 / 3.6' },
  { col: 'span 4', aspect: '4 / 3.6' },
  { col: 'span 4', aspect: '4 / 3.6' },
  { col: 'span 12', aspect: '21 / 9' },
];

/** Mosaico de imágenes con lightbox navegable (flechas, teclado, contador) */
export default function GalleryMosaic({ nombre, imagenes, titulo = 'Recorre el proyecto.' }: GalleryMosaicProps) {
  const [abierta, setAbierta] = useState<number | null>(null);

  const cerrar = useCallback(() => setAbierta(null), []);
  const siguiente = useCallback(
    () => setAbierta((i) => (i === null ? null : (i + 1) % imagenes.length)),
    [imagenes.length],
  );
  const anterior = useCallback(
    () => setAbierta((i) => (i === null ? null : (i - 1 + imagenes.length) % imagenes.length)),
    [imagenes.length],
  );

  useEffect(() => {
    if (abierta === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar();
      if (e.key === 'ArrowRight') siguiente();
      if (e.key === 'ArrowLeft') anterior();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [abierta, cerrar, siguiente, anterior]);

  return (
    <Section tone="cream">
      <Container>
        <Reveal>
          <Eyebrow>Galería</Eyebrow>
          <Typography variant="h2" sx={{ mt: 2, mb: { xs: 4, md: 6 } }}>
            {titulo}
          </Typography>
        </Reveal>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(12, 1fr)' },
            gap: { xs: 2, md: 2.5 },
          }}
        >
          {imagenes.map((imagen, i) => {
            const patron = MOSAIC_PATTERN[i % MOSAIC_PATTERN.length];
            return (
              <Box key={`${imagen.url}-${i}`} sx={{ gridColumn: { xs: 'auto', sm: patron.col } }}>
                <Reveal delay={(i % 3) * 0.07}>
                <Box
                  component="button"
                  type="button"
                  onClick={() => setAbierta(i)}
                  aria-label={`Ampliar imagen ${i + 1} de ${imagenes.length}: ${imagen.alt}`}
                  sx={{
                    all: 'unset',
                    cursor: 'zoom-in',
                    display: 'block',
                    position: 'relative',
                    width: '100%',
                    aspectRatio: patron.aspect,
                    borderRadius: `${radii.md}px`,
                    overflow: 'hidden',
                    isolation: 'isolate',
                    '&:hover img': { transform: 'scale(1.04)' },
                    '&:focus-visible': { outline: `2px solid ${colors.tan}`, outlineOffset: 3 },
                  }}
                >
                  <Image
                    src={imagen.url}
                    alt={imagen.alt}
                    fill
                    sizes="(max-width: 600px) 100vw, 50vw"
                    style={{ objectFit: 'cover', transition: `transform 0.7s ${motionTokens.easeCss}` }}
                  />
                </Box>
                </Reveal>
              </Box>
            );
          })}
        </Box>
      </Container>

      <AnimatePresence>
        {abierta !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Galería de ${nombre}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1450,
              background: 'rgba(13, 33, 41, 0.96)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={cerrar}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: { xs: 2.5, md: 4 },
                height: 76,
                flexShrink: 0,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Typography sx={{ fontFamily: monoFamily, fontSize: '0.8rem', letterSpacing: '0.2em', color: 'rgba(246,241,234,0.7)' }}>
                {String(abierta + 1).padStart(2, '0')} / {String(imagenes.length).padStart(2, '0')}
              </Typography>
              <IconButton onClick={cerrar} aria-label="Cerrar galería" sx={{ color: colors.cream }}>
                <X size={26} />
              </IconButton>
            </Box>

            <Box
              sx={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <IconButton
                onClick={anterior}
                aria-label="Imagen anterior"
                sx={{
                  position: { xs: 'absolute', md: 'static' },
                  left: 8,
                  zIndex: 2,
                  color: colors.cream,
                  mx: { md: 3 },
                  bgcolor: 'rgba(246,241,234,0.08)',
                  '&:hover': { bgcolor: 'rgba(246,241,234,0.16)' },
                }}
              >
                <ChevronLeft size={30} />
              </IconButton>

              <Box sx={{ position: 'relative', flex: 1, alignSelf: 'stretch', mx: { xs: 1, md: 0 } }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={abierta}
                    initial={{ opacity: 0, x: 26 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -26 }}
                    transition={{ duration: 0.32, ease: EASE }}
                    style={{ position: 'absolute', inset: 0 }}
                  >
                    <Image
                      src={imagenes[abierta].url}
                      alt={imagenes[abierta].alt}
                      fill
                      sizes="92vw"
                      style={{ objectFit: 'contain' }}
                    />
                  </motion.div>
                </AnimatePresence>
              </Box>

              <IconButton
                onClick={siguiente}
                aria-label="Imagen siguiente"
                sx={{
                  position: { xs: 'absolute', md: 'static' },
                  right: 8,
                  zIndex: 2,
                  color: colors.cream,
                  mx: { md: 3 },
                  bgcolor: 'rgba(246,241,234,0.08)',
                  '&:hover': { bgcolor: 'rgba(246,241,234,0.16)' },
                }}
              >
                <ChevronRight size={30} />
              </IconButton>
            </Box>

            <Box sx={{ height: 76, flexShrink: 0, display: 'flex', alignItems: 'center', px: { xs: 2.5, md: 4 } }} onClick={(e) => e.stopPropagation()}>
              <Typography sx={{ fontSize: '0.85rem', color: 'rgba(246,241,234,0.6)' }}>
                {imagenes[abierta].alt}
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Image from 'next/image';

import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Reveal from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';
import type { Proyecto } from '@/features/proyectos/proyecto.types';
import { radii } from '@/theme/tokens';

import { medioVideo } from './video';

/**
 * Reseña breve del proyecto: párrafo destacado elegante + una pieza de
 * apoyo que puede ser la foto vertical o, si el equipo lo prefiere, el
 * video del proyecto embebido.
 *
 * Los textos son opcionales: si no hay ninguno, la sección no se
 * muestra — la página sigue funcionando solo con fotos.
 */
export default function ProjectResena({ proyecto }: { proyecto: Proyecto }) {
  const hayTextos = proyecto.resenaDestacada.trim() !== '' || proyecto.resena.trim() !== '';
  if (!hayTextos) return null;

  const medio = proyecto.videoEnResena ? medioVideo(proyecto.videoUrl) : null;

  return (
    <Section tone="paper">
      <Container>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' },
            gap: { xs: 5, md: 10 },
            alignItems: 'center',
          }}
        >
          <Box>
            <Reveal>
              <Eyebrow>La casa</Eyebrow>
              {proyecto.resenaDestacada.trim() !== '' && (
                <Typography
                  component="p"
                  sx={{
                    mt: 2.5,
                    mb: 3,
                    fontWeight: 700,
                    fontSize: 'clamp(1.35rem, 2.4vw, 1.9rem)',
                    lineHeight: 1.45,
                    letterSpacing: '-0.005em',
                    color: 'text.primary',
                  }}
                >
                  {proyecto.resenaDestacada}
                </Typography>
              )}
            </Reveal>
            {proyecto.resena.trim() !== '' && (
              <Reveal delay={0.1}>
                <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 560 }}>
                  {proyecto.resena}
                </Typography>
              </Reveal>
            )}
          </Box>
          <Reveal delay={0.15}>
            {medio ? (
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: `${radii.lg}px`,
                  overflow: 'hidden',
                  aspectRatio: '16 / 9',
                  bgcolor: 'rgba(13, 33, 41, 0.06)',
                }}
              >
                {medio.tipo === 'archivo' ? (
                  <Box
                    component="video"
                    src={medio.src}
                    controls
                    playsInline
                    preload="metadata"
                    aria-label={`Video del proyecto ${proyecto.nombre}`}
                    sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Box
                    component="iframe"
                    src={medio.src}
                    title={`Video del proyecto ${proyecto.nombre}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                  />
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: `${radii.lg}px`,
                  overflow: 'hidden',
                  aspectRatio: '4 / 4.6',
                }}
              >
                <Image
                  src={proyecto.imagenResena.url}
                  alt={proyecto.imagenResena.alt}
                  fill
                  sizes="(max-width: 900px) 100vw, 40vw"
                  style={{ objectFit: 'cover' }}
                />
              </Box>
            )}
          </Reveal>
        </Box>
      </Container>
    </Section>
  );
}

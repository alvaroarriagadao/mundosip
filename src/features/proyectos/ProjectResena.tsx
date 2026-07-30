import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Image from 'next/image';

import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Reveal from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';
import type { Proyecto } from '@/features/proyectos/proyecto.types';
import { radii } from '@/theme/tokens';

/** Reseña breve del proyecto: párrafo destacado elegante + imagen de apoyo */
export default function ProjectResena({ proyecto }: { proyecto: Proyecto }) {
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
            </Reveal>
            <Reveal delay={0.1}>
              <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 560 }}>
                {proyecto.resena}
              </Typography>
            </Reveal>
          </Box>
          <Reveal delay={0.15}>
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
          </Reveal>
        </Box>
      </Container>
    </Section>
  );
}

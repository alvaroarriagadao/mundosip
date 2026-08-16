import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Reveal from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';
import { radii } from '@/theme/tokens';

import { urlEmbedVideo } from './video';

/**
 * Video del proyecto (opcional): el equipo pega un link de YouTube o
 * Vimeo en el admin y aquí se muestra embebido. Si el link no es
 * reconocible, la sección simplemente no se renderiza.
 */
export default function ProjectVideo({ nombre, videoUrl }: { nombre: string; videoUrl: string | null }) {
  if (!videoUrl) return null;
  const embed = urlEmbedVideo(videoUrl);
  if (!embed) return null;

  return (
    <Section tone="paper" sx={{ pt: 0 }}>
      <Container>
        <Reveal>
          <Eyebrow>El recorrido</Eyebrow>
          <Typography variant="h2" sx={{ mt: 2, mb: 4, maxWidth: '18ch' }}>
            Míralo en movimiento.
          </Typography>
        </Reveal>
        <Reveal delay={0.1}>
          <Box
            sx={{
              position: 'relative',
              aspectRatio: '16 / 9',
              borderRadius: `${radii.lg}px`,
              overflow: 'hidden',
              bgcolor: 'rgba(13, 33, 41, 0.06)',
            }}
          >
            <Box
              component="iframe"
              src={embed}
              title={`Video del proyecto ${nombre}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
            />
          </Box>
        </Reveal>
      </Container>
    </Section>
  );
}

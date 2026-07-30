import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Image from 'next/image';

import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Reveal from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';
import ModeloCard from '@/features/modelos/ModeloCard';
import { getModelos } from '@/data/repository';
import { colors } from '@/theme/tokens';

export const metadata: Metadata = {
  title: 'Modelos',
  description:
    'Modelos de casas MundoSIP en kit de autoconstrucción: diseños propios en panel SIP con planos, dimensionado y capacitación incluidos.',
};

export default async function ModelosPage() {
  const modelos = await getModelos();
  const portadaHero = modelos[0]?.portada;

  return (
    <>
      {/* Hero con render difuminado de fondo */}
      <Box
        component="header"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          bgcolor: colors.tealDeep,
          color: colors.cream,
          pt: { xs: 22, md: 28 },
          pb: { xs: 10, md: 13 },
        }}
      >
        {portadaHero && (
          <Image
            src={portadaHero.url}
            alt=""
            aria-hidden
            fill
            priority
            sizes="100vw"
            style={{
              objectFit: 'cover',
              filter: 'blur(10px) brightness(0.9)',
              transform: 'scale(1.08)',
            }}
          />
        )}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(13, 33, 41, 0.82) 0%, rgba(13, 33, 41, 0.6) 55%, rgba(13, 33, 41, 0.86) 100%)',
          }}
        />
        <Container sx={{ position: 'relative' }}>
          <Eyebrow sx={{ color: colors.tanLight }}>Kit de autoconstrucción</Eyebrow>
          <Typography variant="h1" component="h1" sx={{ mt: 2, maxWidth: '13ch' }}>
            Nuestros Modelos
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 3, maxWidth: 560, color: 'rgba(246, 241, 234, 0.8)' }}>
            Diseños propios en panel SIP, vendidos como kit listo para armar: planos, paneles
            dimensionados, fijaciones y capacitación en terreno incluidos.
          </Typography>
        </Container>
      </Box>

      <Section tone="cream">
        <Container>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' },
              gap: { xs: 3, md: 4 },
            }}
          >
            {modelos.map((modelo, i) => (
              <Reveal key={modelo.slug} delay={i * 0.1}>
                <ModeloCard modelo={modelo} />
              </Reveal>
            ))}
          </Box>
        </Container>
      </Section>
    </>
  );
}

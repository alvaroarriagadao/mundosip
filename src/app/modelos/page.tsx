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
import { layout } from '@/theme/tokens';

export const metadata: Metadata = {
  title: 'Modelos',
  description:
    'Modelos de casas MundoSIP en kit de autoconstrucción: diseños propios en panel SIP con planos, dimensionado y capacitación incluidos.',
};

export default async function ModelosPage() {
  const modelos = await getModelos();

  return (
    <Section tone="paper" belowHeader sx={{ position: 'relative', overflow: 'hidden' }}>
      {/* Croquis arquitectónico como boceto de fondo, detrás del titular */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: { md: `${layout.headerHeight.desktop}px` },
          right: { md: '-4%', lg: '-1%' },
          width: { md: '58%', lg: '52%' },
          aspectRatio: '1136 / 825',
          display: { xs: 'none', md: 'block' },
          opacity: 0.16,
          pointerEvents: 'none',
          maskImage: 'linear-gradient(100deg, transparent 0%, black 38%, black 78%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(100deg, transparent 0%, black 38%, black 78%, transparent 100%)',
        }}
      >
        <Image
          src="/images/croquis.jpg"
          alt=""
          fill
          priority
          sizes="55vw"
          style={{ objectFit: 'contain', objectPosition: 'top right' }}
        />
      </Box>

      <Container sx={{ position: 'relative' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' },
            gap: { xs: 3, md: 10 },
            alignItems: 'start',
            // Más aire que en otras páginas: deja respirar el croquis del fondo
            mb: { xs: 6, md: 14 },
          }}
        >
          <Box>
            <Eyebrow>Kit de autoconstrucción</Eyebrow>
            <Typography variant="h1" component="h1" sx={{ mt: 2, maxWidth: '14ch' }}>
              Casas listas para armar.
            </Typography>
          </Box>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary', maxWidth: 460, alignSelf: 'end' }}>
            Diseños propios en panel SIP, vendidos como kit listo para armar: planos, paneles
            dimensionados, fijaciones y capacitación en terreno incluidos.
          </Typography>
        </Box>

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
  );
}

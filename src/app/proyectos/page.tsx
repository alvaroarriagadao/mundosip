import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Section from '@/components/ui/Section';
import ProjectsGallery from '@/features/proyectos/ProjectsGallery';
import { getProyectos, getRegionesProyectos } from '@/data/repository';
import { layout } from '@/theme/tokens';

export const metadata: Metadata = {
  title: 'Proyectos',
  description:
    'Casas construidas con kits MundoSIP a lo largo de Chile: recorre los proyectos por región y conoce sus características.',
};

export default async function ProyectosPage() {
  const [proyectos, regiones] = await Promise.all([getProyectos(), getRegionesProyectos()]);

  return (
    <Section tone="paper" sx={{ pt: `${layout.headerHeight.desktop + 80}px` }}>
      <Container>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' },
            gap: { xs: 3, md: 10 },
            alignItems: 'end',
            mb: { xs: 4, md: 6 },
          }}
        >
          <Box>
            <Eyebrow>Proyectos</Eyebrow>
            <Typography variant="h1" component="h1" sx={{ mt: 2, maxWidth: '14ch' }}>
              Casas que ya se viven.
            </Typography>
          </Box>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary', maxWidth: 460 }}>
            Cada proyecto partió como un kit MundoSIP y hoy es el refugio de una familia. Filtra por
            región y entra a conocerlos.
          </Typography>
        </Box>

        <ProjectsGallery proyectos={proyectos} regiones={regiones} />
      </Container>
    </Section>
  );
}

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Reveal from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';
import ProjectCard from '@/features/proyectos/ProjectCard';
import { getProyectos } from '@/data/repository';

/**
 * Teaser de proyectos en el home: solo los destacados.
 * El catálogo completo (y filtrable) vive en /proyectos — así el home
 * no crece aunque haya 40 obras publicadas.
 */
export default async function FeaturedProjects() {
  const proyectos = await getProyectos();
  const destacados = proyectos.filter((p) => p.destacado).slice(0, 2);

  if (destacados.length === 0) return null;

  return (
    <Section tone="paper">
      <Container>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 3,
            mb: { xs: 4, md: 6 },
          }}
        >
          <Reveal>
            <Eyebrow>Proyectos</Eyebrow>
            <Typography variant="h2" sx={{ mt: 2, maxWidth: '14ch' }}>
              Casas que ya se habitan.
            </Typography>
          </Reveal>
          <Reveal delay={0.1}>
            <Button variant="outlined" arrow href="/proyectos">
              Ver todos los proyectos
            </Button>
          </Reveal>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 2.5, md: 3 },
          }}
        >
          {destacados.map((proyecto, i) => (
            <Reveal key={proyecto.slug} delay={i * 0.1}>
              <ProjectCard proyecto={proyecto} />
            </Reveal>
          ))}
        </Box>
      </Container>
    </Section>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Reveal from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';
import GalleryMosaic from '@/components/ui/GalleryMosaic';
import ProjectHero from '@/features/proyectos/ProjectHero';
import ProjectResena from '@/features/proyectos/ProjectResena';
import { getProyectoBySlug, getProyectos } from '@/data/repository';

interface ProyectoPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const proyectos = await getProyectos();
  return proyectos.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: ProyectoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const proyecto = await getProyectoBySlug(slug);
  if (!proyecto) return {};
  return {
    title: proyecto.nombre,
    description: proyecto.resumen,
  };
}

export default async function ProyectoPage({ params }: ProyectoPageProps) {
  const { slug } = await params;
  const proyecto = await getProyectoBySlug(slug);

  if (!proyecto) notFound();

  return (
    <>
      <ProjectHero proyecto={proyecto} />
      <ProjectResena proyecto={proyecto} />
      <GalleryMosaic nombre={proyecto.nombre} imagenes={proyecto.galeria} />

      {/* Cierre: invitación a cotizar */}
      <Section tone="dark" sx={{ py: { xs: 8, md: 11 } }}>
        <Container sx={{ textAlign: 'center' }}>
          <Reveal>
            <Eyebrow sx={{ '&::before': { display: 'none' } }}>¿Te imaginas viviendo aquí?</Eyebrow>
            <Typography variant="h2" sx={{ mt: 2, mb: 4 }}>
              Construyamos la tuya.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" color="secondary" size="large" arrow href="/contacto">
                Cotizar mi proyecto
              </Button>
              <Button variant="outlined" size="large" onDark href="/proyectos">
                Ver más proyectos
              </Button>
            </Box>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}

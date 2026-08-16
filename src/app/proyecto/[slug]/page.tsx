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
import { esAdmin } from '@/features/admin/auth';
import ProjectHero from '@/features/proyectos/ProjectHero';
import ProjectResena from '@/features/proyectos/ProjectResena';
import ProjectVideo from '@/features/proyectos/ProjectVideo';
import { getProyectoPorSlug } from '@/features/proyectos/proyectos.db';
import { colors, radii } from '@/theme/tokens';

interface ProyectoPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

// El contenido lo edita el equipo en /admin/proyectos: siempre fresco
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: ProyectoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const proyecto = await getProyectoPorSlug(slug);
  if (!proyecto) return {};
  return {
    title: proyecto.nombre,
    description: proyecto.resumen,
  };
}

/**
 * Plantilla FIJA de página de proyecto. Todo el contenido viene de la
 * base de datos: un proyecto nuevo aparece aquí sin tocar código.
 *
 * Con `?preview=1` y sesión de admin también muestra borradores, para
 * revisar la página real antes de publicarla.
 */
export default async function ProyectoPage({ params, searchParams }: ProyectoPageProps) {
  const [{ slug }, { preview }] = await Promise.all([params, searchParams]);

  // El borrador solo se revela a alguien con sesión abierta en el panel
  const quierePreview = preview === '1';
  const puedeVerBorradores = quierePreview && (await esAdmin());
  const proyecto = await getProyectoPorSlug(slug, puedeVerBorradores);

  if (!proyecto) notFound();

  return (
    <>
      {!proyecto.publicado && (
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1200,
            bgcolor: colors.tan,
            color: colors.tealNight,
            px: 2,
            py: 1.25,
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>
            Vista previa · este proyecto aún no está publicado
          </Typography>
          <Box
            component="a"
            href={`/admin/proyectos/${proyecto.id}`}
            sx={{
              display: 'inline-block',
              mt: 0.25,
              fontSize: '0.85rem',
              color: colors.tealNight,
              borderRadius: `${radii.sm}px`,
            }}
          >
            Volver a editarlo
          </Box>
        </Box>
      )}

      <ProjectHero proyecto={proyecto} />
      <ProjectResena proyecto={proyecto} />
      <ProjectVideo nombre={proyecto.nombre} videoUrl={proyecto.videoUrl} />
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

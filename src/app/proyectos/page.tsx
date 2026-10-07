import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Section from '@/components/ui/Section';
import ProjectsGallery from '@/features/proyectos/ProjectsGallery';
import { getProyectos, getRegionesProyectos } from '@/data/repository';
import JsonLd from '@/components/seo/JsonLd';
import { schemaMigas } from '@/features/seo/schema';
import { OG_BASE } from '@/lib/site';

const TITULO = 'Proyectos · casas en panel SIP construidas en Chile';
const DESCRIPCION =
  'Casas construidas con kits MundoSIP a lo largo de Chile: recorre las obras terminadas y en construcción por región, con fotos, superficie y reseña de cada proyecto.';

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: '/proyectos' },
  openGraph: { ...OG_BASE, title: TITULO, description: DESCRIPCION, url: '/proyectos' },
};

// La galería la edita el equipo en /admin/proyectos: publicar u ocultar
// una obra debe verse de inmediato, no en el próximo build
export const dynamic = 'force-dynamic';

export default async function ProyectosPage() {
  const [proyectos, regiones] = await Promise.all([getProyectos(), getRegionesProyectos()]);

  return (
    <>
      <JsonLd data={schemaMigas([{ nombre: 'Inicio', ruta: '/' }, { nombre: 'Proyectos', ruta: '/proyectos' }])} />
        <Section tone="paper" belowHeader>
        <Container>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' },
              gap: { xs: 3, md: 10 },
              alignItems: 'start',
              mb: { xs: 4, md: 6 },
            }}
          >
            <Box>
              <Eyebrow>Proyectos</Eyebrow>
              <Typography variant="h1" component="h1" sx={{ mt: 2, maxWidth: '14ch' }}>
                Casas que ya se habitan.
              </Typography>
            </Box>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', maxWidth: 460, alignSelf: 'end' }}>
              Cada proyecto partió como un kit MundoSIP y hoy es el refugio de una familia. Filtra por
              región, entra a conocerlos y mira más abajo las casas que están en obra.
            </Typography>
          </Box>

          <ProjectsGallery proyectos={proyectos} regiones={regiones} />
        </Container>
      </Section>
    </>
  );
}

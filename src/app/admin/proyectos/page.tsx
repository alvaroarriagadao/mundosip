import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ArrowLeft } from 'lucide-react';

import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Section from '@/components/ui/Section';
import BotonSalir from '@/features/admin/BotonSalir';
import ListadoProyectos from '@/features/admin/ListadoProyectos';
import { exigirAdmin } from '@/features/admin/auth';
import { getProyectosAdmin } from '@/features/proyectos/proyectos.db';
import { colors } from '@/theme/tokens';

export const metadata: Metadata = {
  title: 'Proyectos · Panel MundoSIP',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/** Galería de proyectos construidos: crear, publicar y editar. */
export default async function AdminProyectosPage() {
  await exigirAdmin();
  const proyectos = await getProyectosAdmin();

  return (
    <Section tone="paper" belowHeader>
      <Container>
        <Box
          component="a"
          href="/admin"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            textDecoration: 'none',
            color: colors.muted,
            fontSize: '0.9rem',
            fontWeight: 600,
            mb: 3,
            '&:hover': { color: colors.teal },
          }}
        >
          <ArrowLeft size={15} /> Volver al panel
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2, mb: { xs: 4, md: 5 } }}>
          <Box>
            <Eyebrow>Panel · Proyectos construidos</Eyebrow>
            <Typography variant="h1" component="h1" sx={{ mt: 2 }}>
              Proyectos.
            </Typography>
          </Box>
          <BotonSalir />
        </Box>

        <ListadoProyectos proyectos={proyectos} />
      </Container>
    </Section>
  );
}

import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ArrowLeft } from 'lucide-react';

import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Section from '@/components/ui/Section';
import BotonSalir from '@/features/admin/BotonSalir';
import ListadoModelos from '@/features/admin/ListadoModelos';
import { exigirAdmin } from '@/features/admin/auth';
import { getModelosAdmin } from '@/features/modelos/modelos.db';
import { colors } from '@/theme/tokens';

export const metadata: Metadata = {
  title: 'Modelos · Panel MundoSIP',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/** Catálogo de modelos de casa: crear, publicar y editar. */
export default async function AdminModelosPage() {
  await exigirAdmin();
  const modelos = await getModelosAdmin();

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
            <Eyebrow>Panel · Modelos de casa</Eyebrow>
            <Typography variant="h1" component="h1" sx={{ mt: 2 }}>
              Modelos.
            </Typography>
          </Box>
          <BotonSalir />
        </Box>

        <ListadoModelos modelos={modelos} />
      </Container>
    </Section>
  );
}

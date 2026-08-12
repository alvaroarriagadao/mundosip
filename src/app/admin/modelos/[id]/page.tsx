import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ArrowLeft } from 'lucide-react';

import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Section from '@/components/ui/Section';
import EditorModelo from '@/features/admin/EditorModelo';
import { exigirAdmin } from '@/features/admin/auth';
import { getKitsCotizablesDeModelo, getModeloPorId } from '@/features/modelos/modelos.db';
import { colors } from '@/theme/tokens';

export const metadata: Metadata = {
  title: 'Editar modelo · Panel MundoSIP',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface EditarModeloPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarModeloPage({ params }: EditarModeloPageProps) {
  await exigirAdmin();
  const { id } = await params;
  const modelo = await getModeloPorId(id).catch(() => undefined);
  if (!modelo) notFound();

  const kitsCotizables = await getKitsCotizablesDeModelo(modelo.slug).catch(() => []);

  return (
    <Section tone="paper" belowHeader>
      <Container>
        <Box
          component="a"
          href="/admin/modelos"
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
          <ArrowLeft size={15} /> Volver a Modelos
        </Box>

        <Box sx={{ mb: { xs: 4, md: 5 } }}>
          <Eyebrow>Modelo</Eyebrow>
          <Typography variant="h1" component="h1" sx={{ mt: 2 }}>
            {modelo.nombre}
          </Typography>
          <Typography sx={{ mt: 1, color: 'text.secondary' }}>/modelos/{modelo.slug}</Typography>
        </Box>

        <EditorModelo modelo={modelo} kitsCotizables={kitsCotizables} />
      </Container>
    </Section>
  );
}

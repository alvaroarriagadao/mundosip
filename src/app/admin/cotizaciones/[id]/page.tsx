import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ArrowLeft } from 'lucide-react';

import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Section from '@/components/ui/Section';
import EditorPlantilla from '@/features/admin/EditorPlantilla';
import { exigirAdmin } from '@/features/admin/auth';
import { KIT_LABEL } from '@/features/cotizador/cotizacion.types';
import { getPlantillaPorId } from '@/features/cotizador/cotizador.db';
import { colors } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

export const metadata: Metadata = {
  title: 'Editar plantilla · Panel MundoSIP',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface EditarPlantillaPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarPlantillaPage({ params }: EditarPlantillaPageProps) {
  await exigirAdmin();
  const { id } = await params;
  const plantilla = await getPlantillaPorId(id).catch(() => null);
  if (!plantilla) notFound();

  return (
    <Section tone="paper" belowHeader>
      <Container>
        <Box
          component="a"
          href="/admin/cotizaciones"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            textDecoration: 'none',
            color: colors.muted,
            fontFamily: monoFamily,
            fontWeight: 700,
            fontSize: '0.75rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            mb: 3,
            '&:hover': { color: colors.teal },
          }}
        >
          <ArrowLeft size={15} /> Volver al listado
        </Box>

        <Box sx={{ mb: { xs: 4, md: 5 } }}>
          <Eyebrow>
            Plantilla · {KIT_LABEL[plantilla.kit]}
          </Eyebrow>
          <Typography variant="h1" component="h1" sx={{ mt: 2, textTransform: 'capitalize' }}>
            {plantilla.modeloSlug}
          </Typography>
          <Typography sx={{ mt: 1, color: 'text.secondary' }}>{plantilla.titulo}</Typography>
        </Box>

        <EditorPlantilla plantilla={plantilla} />
      </Container>
    </Section>
  );
}

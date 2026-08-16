import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ArrowLeft } from 'lucide-react';

import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Section from '@/components/ui/Section';
import EditorProyecto from '@/features/admin/EditorProyecto';
import { exigirAdmin } from '@/features/admin/auth';
import { getProyectoPorId } from '@/features/proyectos/proyectos.db';
import { colors } from '@/theme/tokens';

export const metadata: Metadata = {
  title: 'Editar proyecto · Panel MundoSIP',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface EditarProyectoPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarProyectoPage({ params }: EditarProyectoPageProps) {
  await exigirAdmin();
  const { id } = await params;
  const proyecto = await getProyectoPorId(id).catch(() => undefined);
  if (!proyecto) notFound();

  return (
    <Section tone="paper" belowHeader>
      <Container>
        <Box
          component="a"
          href="/admin/proyectos"
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
          <ArrowLeft size={15} /> Volver a Proyectos
        </Box>

        <Box sx={{ mb: { xs: 4, md: 5 } }}>
          <Eyebrow>Proyecto</Eyebrow>
          <Typography variant="h1" component="h1" sx={{ mt: 2 }}>
            {proyecto.nombre}
          </Typography>
          <Typography sx={{ mt: 1, color: 'text.secondary' }}>/proyecto/{proyecto.slug}</Typography>
        </Box>

        <EditorProyecto proyecto={proyecto} />
      </Container>
    </Section>
  );
}

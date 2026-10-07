import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ArrowLeft, ExternalLink } from 'lucide-react';

import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Section from '@/components/ui/Section';
import BotonSalir from '@/features/admin/BotonSalir';
import GestorFaqs from '@/features/admin/GestorFaqs';
import { exigirAdmin } from '@/features/admin/auth';
import { getFaqsAdmin } from '@/features/faqs/faqs.db';
import { colors } from '@/theme/tokens';

export const metadata: Metadata = {
  title: 'Preguntas frecuentes · Panel MundoSIP',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/** Gestión de /preguntas-frecuentes: crear, editar, ordenar y ocultar. */
export default async function AdminPreguntasPage() {
  await exigirAdmin();
  const faqs = await getFaqsAdmin();

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
            <Eyebrow>Panel · Preguntas frecuentes</Eyebrow>
            <Typography variant="h1" component="h1" sx={{ mt: 2 }}>
              Preguntas.
            </Typography>
            <Box
              component="a"
              href="/preguntas-frecuentes"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, mt: 1.5, color: colors.teal, fontWeight: 600, fontSize: '0.9rem', '&:hover': { color: colors.tanDark } }}
            >
              Ver cómo se ven en el sitio <ExternalLink size={14} />
            </Box>
          </Box>
          <BotonSalir />
        </Box>

        <Box sx={{ maxWidth: 980 }}>
          <GestorFaqs faqs={faqs} />
        </Box>
      </Container>
    </Section>
  );
}

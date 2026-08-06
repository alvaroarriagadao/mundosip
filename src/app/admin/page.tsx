import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Box from '@mui/material/Box';

import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import LoginForm from '@/features/admin/LoginForm';
import { esAdmin } from '@/features/admin/auth';

export const metadata: Metadata = {
  title: 'Panel MundoSIP',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/** Puerta de entrada al panel: con sesión pasa directo, sin sesión login. */
export default async function AdminPage() {
  if (await esAdmin()) redirect('/admin/cotizaciones');

  return (
    <Section tone="paper" belowHeader>
      <Container>
        <Box sx={{ py: { xs: 4, md: 8 } }}>
          <LoginForm />
        </Box>
      </Container>
    </Section>
  );
}

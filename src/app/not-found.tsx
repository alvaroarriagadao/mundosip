import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Section from '@/components/ui/Section';

export const metadata: Metadata = {
  title: 'Página no encontrada',
  robots: { index: false, follow: true },
};

const ATAJOS = [
  { href: '/modelos', texto: 'Modelos de casas' },
  { href: '/paneles', texto: 'Paneles SIP' },
  { href: '/proyectos', texto: 'Proyectos construidos' },
  { href: '/contacto', texto: 'Contacto' },
];

/**
 * 404 con salidas claras. Muchos llegan desde links del sitio anterior
 * (Google, redes, WhatsApp viejo): mejor ofrecer el camino correcto que
 * una página en blanco.
 */
export default function NotFound() {
  return (
    <Section tone="paper" belowHeader sx={{ minHeight: '70svh', display: 'flex', alignItems: 'center' }}>
      <Container>
        <Box sx={{ maxWidth: 620 }}>
          <Eyebrow>Error 404</Eyebrow>
          <Typography variant="h1" component="h1" sx={{ mt: 2, mb: 2.5, maxWidth: '12ch' }}>
            Esta página no existe.
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 4, fontSize: '1.05rem' }}>
            Puede que el enlace sea del sitio anterior de MundoSIP o que esté mal escrito. Lo que buscas
            seguramente está en una de estas secciones:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {ATAJOS.map((a, i) => (
              <Button key={a.href} href={a.href} variant={i === 0 ? 'contained' : 'outlined'} color={i === 0 ? 'secondary' : 'primary'}>
                {a.texto}
              </Button>
            ))}
          </Box>
        </Box>
      </Container>
    </Section>
  );
}

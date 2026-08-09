import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ArrowRight, FileText, Package } from 'lucide-react';

import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Section from '@/components/ui/Section';
import BotonSalir from '@/features/admin/BotonSalir';
import LoginForm from '@/features/admin/LoginForm';
import { esAdmin } from '@/features/admin/auth';
import { colors, motionTokens, radii } from '@/theme/tokens';

export const metadata: Metadata = {
  title: 'Panel MundoSIP',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/** Las secciones del panel: esta lista crece a medida que el CMS propio crece */
const SECCIONES = [
  {
    href: '/admin/cotizaciones',
    icono: <FileText size={22} strokeWidth={2} />,
    titulo: 'Cotizaciones de casas',
    descripcion: 'Plantillas llave en mano por modelo y kit: partidas, precios, descuento y las cotizaciones emitidas por clientes.',
  },
  {
    href: '/admin/paneles',
    icono: <Package size={22} strokeWidth={2} />,
    titulo: 'Tienda de paneles',
    descripcion: 'Los productos de /paneles: crear, editar precios y fichas, publicar u ocultar, y los pedidos cotizados.',
  },
];

/** Puerta del panel: login sin sesión; con sesión, el hub de secciones. */
export default async function AdminPage() {
  const logueado = await esAdmin();

  if (!logueado) {
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

  return (
    <Section tone="paper" belowHeader>
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2, mb: { xs: 4, md: 5 } }}>
          <Box>
            <Eyebrow>Panel MundoSIP</Eyebrow>
            <Typography variant="h1" component="h1" sx={{ mt: 2 }}>
              Hola, equipo.
            </Typography>
          </Box>
          <BotonSalir />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5, maxWidth: 900 }}>
          {SECCIONES.map((seccion) => (
            <Box
              key={seccion.href}
              component="a"
              href={seccion.href}
              sx={{
                display: 'flex',
                gap: 2,
                p: 3,
                borderRadius: `${radii.lg}px`,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                textDecoration: 'none',
                color: 'inherit',
                transition: `all 0.25s ${motionTokens.easeCss}`,
                '&:hover': { borderColor: colors.teal, transform: 'translateY(-2px)' },
                '&:hover .flecha': { transform: 'translateX(4px)', color: colors.teal },
              }}
            >
              <Box
                aria-hidden
                sx={{
                  flexShrink: 0,
                  width: 48,
                  height: 48,
                  borderRadius: `${radii.md}px`,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'rgba(32, 78, 95, 0.09)',
                  color: colors.teal,
                }}
              >
                {seccion.icono}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 0.5 }}>{seccion.titulo}</Typography>
                <Typography sx={{ fontSize: '0.92rem', color: 'text.secondary', lineHeight: 1.5 }}>
                  {seccion.descripcion}
                </Typography>
              </Box>
              <Box
                className="flecha"
                aria-hidden
                sx={{ alignSelf: 'center', color: colors.muted, display: 'grid', transition: `all 0.25s ${motionTokens.easeCss}` }}
              >
                <ArrowRight size={20} />
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Section>
  );
}

import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ArrowRight, Calculator, House, Layers, MapPinned } from 'lucide-react';

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

/**
 * Las secciones del panel. Cada una con su color e ícono propios: con
 * tres tarjetas iguales en gris cuesta distinguirlas de un vistazo, y
 * el color es lo primero que el ojo reconoce.
 */
const SECCIONES = [
  {
    href: '/admin/modelos',
    icono: <House size={26} strokeWidth={1.75} />,
    color: colors.teal,
    fondo: 'rgba(32, 78, 95, 0.12)',
    titulo: 'Modelos de casa',
    descripcion: 'El catálogo de /modelos: ficha, fotos, características y kits. Se crean como borrador y se publican cuando estén listos.',
  },
  {
    href: '/admin/cotizaciones',
    icono: <Calculator size={26} strokeWidth={1.75} />,
    color: colors.tanDark,
    fondo: 'rgba(185, 138, 78, 0.16)',
    titulo: 'Cotizaciones de casas',
    descripcion: 'Plantillas llave en mano por modelo y kit: partidas, precios, descuento y las cotizaciones emitidas por clientes.',
  },
  {
    href: '/admin/paneles',
    icono: <Layers size={26} strokeWidth={1.75} />,
    color: '#4E7A5E',
    fondo: 'rgba(78, 122, 94, 0.14)',
    titulo: 'Tienda de paneles',
    descripcion: 'Los productos de /paneles: crear, editar precios y fichas, publicar u ocultar, y los pedidos cotizados.',
  },
  {
    href: '/admin/proyectos',
    icono: <MapPinned size={26} strokeWidth={1.75} />,
    color: '#A5583A',
    fondo: 'rgba(165, 88, 58, 0.12)',
    titulo: 'Proyectos construidos',
    descripcion: 'Las obras de /proyectos: fotos, textos, región y video. Se previsualizan como borrador antes de publicarlas.',
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
                  width: 54,
                  height: 54,
                  borderRadius: `${radii.md}px`,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: seccion.fondo,
                  color: seccion.color,
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

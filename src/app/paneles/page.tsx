import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PackageCheck, Ruler, Truck } from 'lucide-react';

import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Reveal from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';
import PanelesShop from '@/features/paneles/PanelesShop';
import { getPanelesPublicados } from '@/features/paneles/paneles.db';
import { colors, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

export const metadata: Metadata = {
  title: 'Paneles SIP',
  description:
    'Venta de paneles SIP por unidad: elige espesores, arma tu pedido y descarga tu cotización en PDF al instante. Despacho a todo Chile.',
};

// El catálogo vive en la DB y lo edita el equipo en /admin/paneles
export const dynamic = 'force-dynamic';

const PASOS = [
  {
    icono: <Ruler size={22} strokeWidth={2} />,
    titulo: 'Arma tu pedido',
    texto: 'Agrega los paneles y cantidades que necesitas; el total se calcula al instante y descargas tu cotización en PDF.',
  },
  {
    icono: <PackageCheck size={22} strokeWidth={2} />,
    titulo: 'Confirmamos contigo',
    texto: 'Te contactamos para confirmar stock y, si lo prefieres, dimensionar los paneles según tu proyecto.',
  },
  {
    icono: <Truck size={22} strokeWidth={2} />,
    titulo: 'Despacho a todo Chile',
    texto: 'Coordinamos el flete según destino y volumen. También puedes retirarlos en fábrica, en Purranque.',
  },
];

/**
 * Tienda de paneles por unidad. Hero compacto a propósito: los
 * productos deben verse sin scrollear (feedback del usuario).
 */
export default async function PanelesPage() {
  const paneles = await getPanelesPublicados().catch((error) => {
    console.error('[paneles] no se pudo cargar el catálogo', error);
    return [];
  });

  return (
    <>
      <Section tone="paper" belowHeader sx={{ pb: { xs: 6, md: 8 } }}>
        <Container>
          {/* Cabecera en una franja: título contenido + bajada al lado */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' },
              gap: { xs: 2, md: 8 },
              alignItems: 'end',
              mb: { xs: 3, md: 4 },
            }}
          >
            <Box>
              <Eyebrow>Paneles SIP</Eyebrow>
              <Typography
                variant="h1"
                component="h1"
                sx={{ mt: 1.5, fontSize: 'clamp(2rem, 3.6vw, 2.9rem)' }}
              >
                El material, por unidad.
              </Typography>
            </Box>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', maxWidth: 560, fontSize: '1.02rem' }}>
              La misma calidad con la que fabricamos nuestros kits. Agrega lo que necesitas y
              descarga tu cotización al instante.
            </Typography>
          </Box>

          {paneles.length > 0 ? (
            <PanelesShop paneles={paneles} />
          ) : (
            <Box sx={{ py: { xs: 4, md: 6 }, maxWidth: 560 }}>
              <Typography variant="h3" component="p" sx={{ mb: 2 }}>
                El catálogo está tomando un descanso.
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 3 }}>
                Escríbenos y te cotizamos los paneles que necesitas de inmediato.
              </Typography>
              <Button variant="contained" color="secondary" arrow href="/contacto">
                Cotizar por contacto
              </Button>
            </Box>
          )}

          <Reveal y={16} delay={0.15}>
            <Typography sx={{ mt: { xs: 3, md: 4 }, fontSize: '0.95rem', color: 'text.secondary', maxWidth: 760 }}>
              ¿Necesitas un espesor especial o paneles dimensionados según tus planos?{' '}
              <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
                Escríbenos y lo cotizamos.
              </Box>
            </Typography>
          </Reveal>
        </Container>
      </Section>

      {/* Cómo comprar */}
      <Section tone="cream" sx={{ py: { xs: 8, md: 11 } }}>
        <Container>
          <Reveal>
            <Eyebrow>Cómo comprar</Eyebrow>
            <Typography variant="h2" sx={{ mt: 2, mb: { xs: 4, md: 6 }, maxWidth: '18ch' }}>
              Del pedido a tu obra.
            </Typography>
          </Reveal>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: { xs: 2.5, md: 4 },
            }}
          >
            {PASOS.map((paso, i) => (
              <Reveal key={paso.titulo} x={i === 0 ? -32 : i === 2 ? 32 : 0} y={i === 1 ? 24 : 0} delay={i * 0.08}>
                <Box
                  sx={{
                    height: '100%',
                    p: { xs: 3, md: 3.5 },
                    borderRadius: `${radii.lg}px`,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    aria-hidden
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: `${radii.sm}px`,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: 'rgba(185, 138, 78, 0.16)',
                      color: colors.tanDark,
                      mb: 2.5,
                    }}
                  >
                    {paso.icono}
                  </Box>
                  <Typography
                    component="span"
                    sx={{ fontFamily: monoFamily, fontSize: '0.7rem', letterSpacing: '0.2em', color: 'text.secondary', display: 'block', mb: 1 }}
                  >
                    0{i + 1}
                  </Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 1 }}>
                    {paso.titulo}
                  </Typography>
                  <Typography sx={{ fontSize: '0.98rem', lineHeight: 1.6, color: 'text.secondary' }}>
                    {paso.texto}
                  </Typography>
                </Box>
              </Reveal>
            ))}
          </Box>
        </Container>
      </Section>

      {/* CTA final */}
      <Section tone="dark" sx={{ py: { xs: 8, md: 11 } }}>
        <Container sx={{ textAlign: 'center' }}>
          <Reveal>
            <Typography
              component="p"
              sx={{ fontFamily: monoFamily, fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.24em', color: colors.tanLight, mb: 1.5 }}
            >
              ¿UN PROYECTO COMPLETO?
            </Typography>
            <Typography variant="h2" sx={{ mb: 4, mx: 'auto', maxWidth: '20ch' }}>
              También panelizamos tus planos.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" color="secondary" size="large" arrow href="/contacto?interes=panelizado">
                Panelizar mis planos
              </Button>
              <Button
                variant="outlined"
                size="large"
                onDark
                href="https://wa.me/56940367867"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </Button>
            </Box>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}

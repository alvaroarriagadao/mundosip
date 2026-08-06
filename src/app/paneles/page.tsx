import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PackageCheck, Ruler, Truck } from 'lucide-react';

import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Reveal from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';
import PanelCard from '@/features/paneles/PanelCard';
import { formatCLP } from '@/lib/format';
import { getPaneles } from '@/data/repository';
import { colors, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

export const metadata: Metadata = {
  title: 'Paneles SIP',
  description:
    'Venta de paneles SIP por unidad: 94, 119 y 122,2 mm. Ficha técnica, precios y despacho a todo Chile.',
};

const PASOS = [
  {
    icono: <Ruler size={22} strokeWidth={2} />,
    titulo: 'Dinos cuántos necesitas',
    texto: 'Con tu metraje o tus planos calculamos la cantidad exacta de paneles y evitamos que sobre material.',
  },
  {
    icono: <PackageCheck size={22} strokeWidth={2} />,
    titulo: 'Los preparamos dimensionados',
    texto: 'Si lo prefieres, cortamos y rotulamos cada panel según tu proyecto para que lleguen listos a la obra.',
  },
  {
    icono: <Truck size={22} strokeWidth={2} />,
    titulo: 'Despachamos a todo Chile',
    texto: 'Coordinamos el flete según destino y volumen. También puedes retirarlos en fábrica, en Purranque.',
  },
];

export default async function PanelesPage() {
  const paneles = await getPaneles();
  const desde = Math.min(...paneles.map((p) => p.precioCLP));

  return (
    <>
      <Section tone="paper" belowHeader sx={{ pb: { xs: 6, md: 8 } }}>
        <Container>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' },
              gap: { xs: 3, md: 10 },
              alignItems: 'start',
              mb: { xs: 5, md: 8 },
            }}
          >
            <Box>
              <Eyebrow>Paneles SIP</Eyebrow>
              <Typography variant="h1" component="h1" sx={{ mt: 2, maxWidth: '15ch' }}>
                El material, por unidad.
              </Typography>
            </Box>
            <Box sx={{ alignSelf: 'end' }}>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary', maxWidth: 460, mb: 2.5 }}>
                ¿Ya tienes tu proyecto y solo necesitas los paneles? Los vendemos sueltos, con la
                misma calidad con la que fabricamos nuestros kits.
              </Typography>
              <Typography
                component="p"
                sx={{ fontFamily: monoFamily, fontSize: '0.82rem', letterSpacing: '0.12em', color: colors.tanDark }}
              >
                DESDE {formatCLP(desde)} POR PANEL
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' },
              gap: { xs: 3, md: 4 },
            }}
          >
            {paneles.map((panel, i) => (
              <Reveal key={panel.slug} delay={i * 0.1}>
                <PanelCard panel={panel} />
              </Reveal>
            ))}
          </Box>

          <Reveal y={16} delay={0.15}>
            <Typography
              sx={{ mt: { xs: 3, md: 4 }, fontSize: '0.95rem', color: 'text.secondary', maxWidth: 760 }}
            >
              ¿Necesitas otro espesor? Fabricamos también paneles de 169 mm para cubiertas y pisos, y
              medidas especiales a pedido.{' '}
              <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
                Escríbenos y lo cotizamos.
              </Box>
            </Typography>
          </Reveal>
        </Container>
      </Section>

      {/* Comparador de specs */}
      <Section tone="cream" sx={{ py: { xs: 8, md: 11 } }}>
        <Container>
          <Reveal>
            <Eyebrow>Comparar</Eyebrow>
            <Typography variant="h2" sx={{ mt: 2, mb: { xs: 3, md: 5 }, maxWidth: '16ch' }}>
              Cuál te conviene.
            </Typography>
          </Reveal>

          <Reveal y={20}>
            <Box sx={{ overflowX: 'auto', borderRadius: `${radii.lg}px`, border: '1px solid', borderColor: 'divider' }}>
              <Box component="table" sx={{ width: '100%', minWidth: 640, borderCollapse: 'collapse', bgcolor: 'background.paper' }}>
                <Box component="thead">
                  <Box component="tr">
                    {['', ...paneles.map((p) => p.nombre)].map((h, i) => (
                      <Box
                        key={h || 'x'}
                        component="th"
                        sx={{
                          textAlign: i === 0 ? 'left' : 'center',
                          p: 2.25,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          bgcolor: i === 1 ? 'rgba(185, 138, 78, 0.08)' : 'transparent',
                          fontFamily: monoFamily,
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          letterSpacing: '0.08em',
                        }}
                      >
                        {h}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {[
                    { label: 'Espesor total', get: (p: (typeof paneles)[number]) => `${String(p.espesorTotalMM).replace('.', ',')} mm` },
                    { label: 'Espesor OSB', get: (p: (typeof paneles)[number]) => `${String(p.espesorOSBMM).replace('.', ',')} mm` },
                    { label: 'Núcleo EPS', get: (p: (typeof paneles)[number]) => `${p.espesorEPSMM} mm` },
                    { label: 'Densidad EPS', get: (p: (typeof paneles)[number]) => p.densidadEPS },
                    { label: 'Apto para madera', get: (p: (typeof paneles)[number]) => p.aptoParaMadera },
                    { label: 'Uso principal', get: (p: (typeof paneles)[number]) => p.usos[0] },
                    { label: 'Precio por panel', get: (p: (typeof paneles)[number]) => formatCLP(p.precioCLP) },
                  ].map((fila) => (
                    <Box component="tr" key={fila.label}>
                      <Box
                        component="th"
                        scope="row"
                        sx={{
                          textAlign: 'left',
                          p: 2.25,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          fontFamily: monoFamily,
                          fontWeight: 400,
                          fontSize: '0.78rem',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: 'text.secondary',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {fila.label}
                      </Box>
                      {paneles.map((p, i) => (
                        <Box
                          key={p.slug}
                          component="td"
                          sx={{
                            textAlign: 'center',
                            p: 2.25,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            bgcolor: i === 0 ? 'rgba(185, 138, 78, 0.05)' : 'transparent',
                            fontSize: '0.98rem',
                            fontWeight: fila.label === 'Precio por panel' ? 700 : 400,
                            color: fila.label === 'Precio por panel' ? colors.tanDark : 'text.primary',
                          }}
                        >
                          {fila.get(p)}
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Reveal>
        </Container>
      </Section>

      {/* Cómo comprar */}
      <Section tone="paper" sx={{ py: { xs: 8, md: 11 } }}>
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
                    bgcolor: 'background.default',
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
              COTIZACIÓN SIN COMPROMISO
            </Typography>
            <Typography variant="h2" sx={{ mb: 4, mx: 'auto', maxWidth: '20ch' }}>
              Dinos cuántos metros necesitas cubrir.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" color="secondary" size="large" arrow href="/contacto">
                Cotizar paneles
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

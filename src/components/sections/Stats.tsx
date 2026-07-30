import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Container from '@/components/ui/Container';
import CountUp from '@/components/ui/CountUp';
import Eyebrow from '@/components/ui/Eyebrow';
import Reveal from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';
import { displayFamily, monoFamily } from '@/theme/typography';

interface Stat {
  value: number;
  prefix?: string;
  /** Unidad renderizada más pequeña junto al número, estilo ficha técnica */
  unit?: string;
  label: string;
}

const stats: Stat[] = [
  { value: 12, label: 'Años construyendo en SIP' },
  { value: 350, prefix: '+', label: 'Proyectos panelizados' },
  { value: 48000, unit: 'm²', label: 'De paneles fabricados' },
  { value: 16, label: 'Regiones con despacho' },
];

export default function Stats() {
  return (
    <Section tone="cream">
      <Container>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' },
            gap: { xs: 3, md: 10 },
            mb: { xs: 6, md: 10 },
            alignItems: 'end',
          }}
        >
          <Reveal>
            <Eyebrow>MundoSIP en números</Eyebrow>
            <Typography variant="h2" sx={{ mt: 2 }}>
              La experiencia se mide en obras.
            </Typography>
          </Reveal>
          <Reveal delay={0.12}>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 520 }}>
              Más de una década panelizando casas a lo largo de Chile nos enseñó algo simple: la
              precisión en fábrica ahorra semanas en obra. Cada kit sale dimensionado, rotulado y
              listo para armar.
            </Typography>
          </Reveal>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: { xs: 4, md: 5 },
          }}
        >
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08}>
              <Box sx={{ borderTop: '1.5px solid', borderColor: 'secondary.main', pt: 2.5 }}>
                <Typography
                  component="p"
                  sx={{
                    fontFamily: displayFamily,
                    fontWeight: 900,
                    fontSize: 'clamp(2.4rem, 4.4vw, 3.6rem)',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    mb: 1.25,
                  }}
                >
                  <CountUp to={stat.value} prefix={stat.prefix} />
                  {stat.unit && (
                    <Box component="span" sx={{ fontSize: '0.48em', fontWeight: 700, ml: 0.75, color: 'secondary.dark' }}>
                      {stat.unit}
                    </Box>
                  )}
                </Typography>
                <Typography
                  component="p"
                  sx={{
                    fontFamily: monoFamily,
                    fontSize: '0.85rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            </Reveal>
          ))}
        </Box>
      </Container>
    </Section>
  );
}

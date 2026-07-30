import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Check } from 'lucide-react';

import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Reveal from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';
import { colors, radii } from '@/theme/tokens';

interface ModeloCaracteristicasProps {
  nombre: string;
  caracteristicas: string[];
}

/** Puntos fuertes del diseño, entrando alternadamente desde los costados */
export default function ModeloCaracteristicas({ nombre, caracteristicas }: ModeloCaracteristicasProps) {
  return (
    <Section tone="paper">
      <Container>
        <Reveal>
          <Eyebrow>El diseño</Eyebrow>
          <Typography variant="h2" sx={{ mt: 2, mb: { xs: 4, md: 6 }, maxWidth: '18ch' }}>
            Lo que hace especial a {nombre}.
          </Typography>
        </Reveal>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 2, md: 2.5 },
          }}
        >
          {caracteristicas.map((texto, i) => (
            <Reveal key={texto} x={i % 2 === 0 ? -36 : 36} delay={(i % 2) * 0.06}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  p: { xs: 2.5, md: 3 },
                  bgcolor: 'background.default',
                  borderRadius: `${radii.md}px`,
                  border: '1px solid',
                  borderColor: 'divider',
                  height: '100%',
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    flexShrink: 0,
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'rgba(185, 138, 78, 0.16)',
                    color: colors.tanDark,
                    mt: 0.25,
                  }}
                >
                  <Check size={16} strokeWidth={2.5} />
                </Box>
                <Typography sx={{ fontSize: '1.05rem', lineHeight: 1.55, color: 'text.primary' }}>
                  {texto}
                </Typography>
              </Box>
            </Reveal>
          ))}
        </Box>
      </Container>
    </Section>
  );
}

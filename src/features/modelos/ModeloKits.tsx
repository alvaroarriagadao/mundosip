import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Check } from 'lucide-react';

import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Reveal from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';
import { colors, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

interface ModeloKitsProps {
  kitBasico: string[];
  kitFull: string[];
}

interface KitCardProps {
  titulo: string;
  subtitulo: string;
  items: string[];
  dark?: boolean;
  badge?: string;
}

function KitCard({ titulo, subtitulo, items, dark = false, badge }: KitCardProps) {
  const textMuted = dark ? 'rgba(246, 241, 234, 0.8)' : 'text.secondary';

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        p: { xs: 3, md: 4 },
        borderRadius: `${radii.lg}px`,
        bgcolor: dark ? colors.tealDeep : 'background.paper',
        color: dark ? colors.cream : 'text.primary',
        border: '1px solid',
        borderColor: dark ? 'transparent' : 'divider',
        boxShadow: dark ? '0 34px 80px -34px rgba(13, 33, 41, 0.5)' : 'none',
      }}
    >
      {badge && (
        <Typography
          component="span"
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            fontFamily: monoFamily,
            fontWeight: 700,
            fontSize: '0.7rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: colors.tealNight,
            bgcolor: colors.tan,
            px: 1.5,
            py: 0.6,
            borderRadius: `${radii.pill}px`,
          }}
        >
          {badge}
        </Typography>
      )}

      <Box>
        <Typography variant="h3" component="h3" sx={{ mb: 0.75 }}>
          {titulo}
        </Typography>
        <Typography sx={{ fontSize: '0.98rem', color: textMuted }}>{subtitulo}</Typography>
      </Box>

      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
        {items.map((item) => (
          <Box key={item} component="li" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Box aria-hidden sx={{ color: dark ? colors.tanLight : colors.tanDark, mt: 0.4, flexShrink: 0 }}>
              <Check size={17} strokeWidth={2.5} />
            </Box>
            <Typography sx={{ fontSize: '1rem', lineHeight: 1.55, color: dark ? 'rgba(246, 241, 234, 0.9)' : 'text.primary' }}>
              {item}
            </Typography>
          </Box>
        ))}
      </Box>

      <Button
        variant={dark ? 'contained' : 'outlined'}
        color={dark ? 'secondary' : 'primary'}
        arrow
        href="/contacto"
        sx={{ alignSelf: 'flex-start' }}
      >
        Cotizar {titulo}
      </Button>
    </Box>
  );
}

/** Comparación Kit Básico vs Kit Full, entrando desde ambos costados */
export default function ModeloKits({ kitBasico, kitFull }: ModeloKitsProps) {
  return (
    <Section tone="cream">
      <Container>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '6fr 6fr' },
            gap: { xs: 3, md: 10 },
            alignItems: 'end',
            mb: { xs: 4, md: 6 },
          }}
        >
          <Reveal>
            <Eyebrow>Qué incluye</Eyebrow>
            <Typography variant="h2" sx={{ mt: 2, maxWidth: '12ch' }}>
              Elige tu kit.
            </Typography>
          </Reveal>
          <Reveal delay={0.1}>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', maxWidth: 460 }}>
              Ambos kits llegan dimensionados y rotulados, listos para armar. El Kit Full suma el
              piso estructural en panel SIP y sus maderas.
            </Typography>
          </Reveal>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 3, md: 4 },
            alignItems: 'stretch',
          }}
        >
          <Reveal x={-40}>
            <KitCard
              titulo="Kit Básico"
              subtitulo="La estructura completa de tu casa, sin el piso."
              items={kitBasico}
            />
          </Reveal>
          <Reveal x={40} delay={0.08}>
            <KitCard
              titulo="Kit Full"
              subtitulo="Todo lo del Básico, más piso estructural en panel SIP."
              items={kitFull}
              dark
              badge="Más completo"
            />
          </Reveal>
        </Box>
      </Container>
    </Section>
  );
}

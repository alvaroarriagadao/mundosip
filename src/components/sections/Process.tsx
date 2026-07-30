import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Image from 'next/image';

import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Reveal from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';
import { colors, motionTokens, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

interface Step {
  title: string;
  description: string;
  /** Fotos temporales extraídas del video institucional; se reemplazan por fotos de equipo/proceso */
  image: string;
  alt: string;
}

const steps: Step[] = [
  {
    title: 'Asesoría y cotización',
    description: 'Revisamos tus planos, te asesoramos y cotizamos tu proyecto sin costo.',
    image: '/images/proceso-3.jpg',
    alt: 'Casa MundoSIP terminada entre bosque nativo',
  },
  {
    title: 'Panelización eficiente',
    description: 'Optimizamos cada muro y cubierta para usar el material justo.',
    image: '/images/proceso-7.jpg',
    alt: 'Vista aérea de proyecto panelizado MundoSIP',
  },
  {
    title: 'Fabricación dimensionada',
    description: 'Elaboramos los paneles dimensionados, rotulados y listos para armar.',
    image: '/images/proceso-11.jpg',
    alt: 'Obra MundoSIP con paneles dimensionados en terreno',
  },
  {
    title: 'Despacho a todo Chile',
    description: 'Tu kit llega a la obra, estés donde estés, listo para el montaje.',
    image: '/images/proceso-15.jpg',
    alt: 'Casa MundoSIP en construcción junto al lago',
  },
];

/** Proceso de panelizado a medida: 4 pasos con fotografía protagonista */
export default function Process() {
  return (
    <Section tone="dark">
      <Container>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' },
            gap: { xs: 3, md: 10 },
            alignItems: 'end',
            mb: { xs: 6, md: 9 },
          }}
        >
          <Reveal>
            <Eyebrow>Panelizado a medida</Eyebrow>
            <Typography variant="h2" sx={{ mt: 2, maxWidth: '18ch' }}>
              ¿Tienes tus planos y quieres construir?
            </Typography>
          </Reveal>
          <Reveal delay={0.12}>
            <Typography variant="subtitle1" sx={{ color: 'rgba(246, 241, 234, 0.75)', maxWidth: 440 }}>
              Hazlo realidad en cuatro pasos: tú traes el proyecto, nosotros lo convertimos en
              paneles listos para armar.
            </Typography>
          </Reveal>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
            gap: { xs: 2.5, md: 3 },
          }}
        >
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: `${radii.lg}px`,
                  overflow: 'hidden',
                  aspectRatio: '3 / 4.1',
                  isolation: 'isolate',
                  '&:hover img': { transform: 'scale(1.06)' },
                  '&:hover .step-veil': { opacity: 0.55 },
                }}
              >
                <Image
                  src={step.image}
                  alt={step.alt}
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  style={{
                    objectFit: 'cover',
                    transition: `transform 0.7s ${motionTokens.easeCss}`,
                  }}
                />
                {/* Velo para legibilidad del texto sobre la foto */}
                <Box
                  className="step-veil"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(180deg, rgba(13, 33, 41, 0.32) 0%, rgba(13, 33, 41, 0.05) 40%, rgba(13, 33, 41, 0.88) 100%)`,
                    opacity: 0.75,
                    transition: `opacity 0.4s ${motionTokens.easeCss}`,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      fontFamily: monoFamily,
                      fontSize: '0.8rem',
                      letterSpacing: '0.2em',
                      color: colors.tanLight,
                    }}
                  >
                    0{i + 1}
                  </Typography>
                  <Box>
                    <Typography variant="h5" sx={{ color: colors.cream, mb: 1 }}>
                      {step.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem', lineHeight: 1.55, color: 'rgba(246, 241, 234, 0.78)' }}>
                      {step.description}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Reveal>
          ))}
        </Box>

        <Reveal delay={0.15}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 5, md: 8 } }}>
            <Button variant="contained" color="secondary" size="large" arrow href="/contacto">
              Cotizar mi panelizado
            </Button>
          </Box>
        </Reveal>
      </Container>
    </Section>
  );
}

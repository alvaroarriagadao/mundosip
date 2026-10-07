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
  image: string;
  alt: string;
}

const steps: Step[] = [
  {
    title: 'Definimos el proyecto',
    description:
      'Partimos desde uno de nuestros modelos, desarrollamos una propuesta a medida o panelizamos tus propios planos. La arquitectura se define antes de entrar a obra.',
    image: '/images/proceso/paso-1.jpg',
    alt: 'Oficina de MundoSIP donde se define cada proyecto',
  },
  {
    title: 'Construimos desde sus bases',
    description: 'Fundaciones, apoyos y radier se resuelven según el proyecto y las condiciones de cada terreno.',
    image: '/images/proceso/paso-2.jpg',
    alt: 'Fundaciones con pilares de acero sobre dados de hormigón',
  },
  {
    title: 'La arquitectura toma carácter',
    description:
      'Levantamos la estructura SIP y avanzamos con cubiertas, ventanas, instalaciones, revestimientos y terminaciones. Es aquí donde cada casa comienza a expresar una identidad propia.',
    image: '/images/proceso/paso-3.jpg',
    alt: 'Muros de paneles SIP levantados sobre una plataforma de acero',
  },
  {
    title: 'Lista para habitar',
    description:
      'Coordinamos cada etapa hasta la entrega final, acompañando el proyecto de principio a fin con un mismo equipo.',
    image: '/images/proceso/paso-4.jpg',
    alt: 'Casa en panel SIP terminada en medio del campo al atardecer',
  },
];

/** Cómo trabajamos: 4 etapas del proyecto con fotografía de fondo */
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
            <Eyebrow>Proceso llave en mano</Eyebrow>
            <Typography variant="h2" sx={{ mt: 2, maxWidth: '18ch' }}>
              Una casa,
              <Box component="br" />
              un mismo equipo
            </Typography>
          </Reveal>
          <Reveal delay={0.12}>
            <Typography variant="subtitle1" sx={{ color: 'rgba(246, 241, 234, 0.75)', maxWidth: 480 }}>
              Desde las primeras decisiones hasta la entrega, Mundo SIP y Lacustre Construcciones
              trabajan como un mismo equipo. Proyecto, estructura y construcción se coordinan bajo
              una sola mirada para que cada etapa funcione como parte de un todo.
            </Typography>
          </Reveal>
        </Box>

        {/*
          Cada tarjeta ocupa 3 filas de la grilla (foto libre · título ·
          descripción) con `subgrid`: las tarjetas de una misma fila
          comparten esas alturas, así todos los títulos arrancan a la misma
          altura aunque un texto sea más largo que otro.
        */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
            columnGap: { xs: 2.5, md: 3 },
            rowGap: 0,
          }}
        >
          {steps.map((step, i) => (
            <Reveal
              key={step.title}
              delay={(i % 4) * 0.08}
              style={{ gridRow: 'span 3', display: 'grid', gridTemplateRows: 'subgrid', rowGap: 0 }}
            >
              <Box
                sx={{
                  position: 'relative',
                  gridRow: 'span 3',
                  display: 'grid',
                  gridTemplateRows: 'subgrid',
                  rowGap: 0,
                  // Separación vertical entre tarjetas cuando se apilan (xs/sm)
                  mb: { xs: 2.5, lg: 0 },
                  borderRadius: `${radii.lg}px`,
                  overflow: 'hidden',
                  isolation: 'isolate',
                  '&:hover img': { transform: 'scale(1.06)' },
                  '&:hover .step-veil': { opacity: 0.9 },
                }}
              >
                <Image
                  src={step.image}
                  alt={step.alt}
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  style={{
                    objectFit: 'cover',
                    zIndex: -2,
                    transition: `transform 0.7s ${motionTokens.easeCss}`,
                  }}
                />
                {/* Velo: casi transparente arriba (foto a la vista), oscuro donde va el texto */}
                <Box
                  className="step-veil"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: -1,
                    background:
                      'linear-gradient(180deg, rgba(13, 33, 41, 0.38) 0%, rgba(13, 33, 41, 0.04) 26%, rgba(13, 33, 41, 0.55) 52%, rgba(13, 33, 41, 0.94) 100%)',
                    opacity: 1,
                    transition: `opacity 0.4s ${motionTokens.easeCss}`,
                  }}
                />

                {/* Fila 1: número arriba y aire para la foto */}
                <Box sx={{ px: { xs: 3, md: 3.5 }, pt: { xs: 3, md: 3.5 }, minHeight: { xs: 240, sm: 280, lg: 300 } }}>
                  <Typography
                    component="span"
                    sx={{
                      fontFamily: monoFamily,
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      letterSpacing: '0.2em',
                      color: colors.tanLight,
                      textShadow: '0 1px 10px rgba(13, 33, 41, 0.6)',
                    }}
                  >
                    0{i + 1}
                  </Typography>
                </Box>

                {/* Fila 2: título, alineado arriba en todas las tarjetas */}
                <Typography
                  variant="h5"
                  component="h3"
                  sx={{ px: { xs: 3, md: 3.5 }, color: colors.cream, mb: 1.25, alignSelf: 'start' }}
                >
                  {step.title}
                </Typography>

                {/* Fila 3: descripción */}
                <Typography
                  sx={{
                    px: { xs: 3, md: 3.5 },
                    pb: { xs: 3, md: 3.5 },
                    fontSize: '0.92rem',
                    lineHeight: 1.6,
                    color: 'rgba(246, 241, 234, 0.82)',
                  }}
                >
                  {step.description}
                </Typography>
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

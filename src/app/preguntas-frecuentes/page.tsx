import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Image from 'next/image';

import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Reveal from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';
import FaqAccordion from '@/features/faqs/FaqAccordion';
import { getFaqs } from '@/data/repository';
import { colors, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';
import { enlaceWhatsApp } from '@/lib/contacto';
import JsonLd from '@/components/seo/JsonLd';
import { schemaFaqs, schemaMigas } from '@/features/seo/schema';
import { OG_BASE } from '@/lib/site';

const TITULO = 'Preguntas frecuentes sobre construir en panel SIP';
const DESCRIPCION =
  'Ventajas del panel SIP, qué espesor usar, cuánto demora una casa, si es más caro que la construcción tradicional, resistencia a termitas y más, respondido por MundoSIP.';

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: '/preguntas-frecuentes' },
  openGraph: { ...OG_BASE, title: TITULO, description: DESCRIPCION, url: '/preguntas-frecuentes' },
};

// Las preguntas las edita el equipo en /admin/preguntas: sin caché
export const dynamic = 'force-dynamic';

const TRUST_CHIPS = ['Respuestas claras', 'Sin tecnicismos', 'Respondemos rápido'];

export default async function PreguntasFrecuentesPage() {
  const faqs = await getFaqs();

  return (
    <>
      <JsonLd data={[schemaFaqs(faqs), schemaMigas([{ nombre: 'Inicio', ruta: '/' }, { nombre: 'Preguntas frecuentes', ruta: '/preguntas-frecuentes' }])]} />
        <Section tone="paper" belowHeader sx={{ pb: { xs: 8, md: 12 } }}>
        <Container>
          {/* ── Header: título a la izquierda, imagen a la derecha ── */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
              gap: { xs: 4, md: 8 },
              // 'start' y no 'center': centrado, la imagen (más alta) empuja el
              // titular hacia abajo y deja de coincidir con las otras páginas
              alignItems: 'start',
              mb: { xs: 6, md: 10 },
            }}
          >
            <Reveal x={-44} y={0}>
              <Eyebrow>Preguntas frecuentes</Eyebrow>
              <Typography
                variant="h1"
                component="h1"
                sx={{ mt: 2, mb: 3, fontSize: 'clamp(2.6rem, 5vw, 4.2rem)' }}
              >
                Construir en SIP,
                <br />
                sin letra chica.
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary', maxWidth: 500, mb: 3.5 }}>
                Las respuestas a lo que más nos preguntan antes de partir un proyecto. Si tu duda no
                está aquí, escríbenos: respondemos rápido.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
                {TRUST_CHIPS.map((chip) => (
                  <Box
                    key={chip}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 1.75,
                      py: 0.85,
                      borderRadius: `${radii.pill}px`,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box aria-hidden sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: colors.tan }} />
                    <Typography
                      component="span"
                      sx={{ fontFamily: monoFamily, fontSize: '0.76rem', letterSpacing: '0.08em', color: 'text.secondary' }}
                    >
                      {chip}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Reveal>

            <Reveal x={44} y={0} delay={0.12}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: `${radii.lg}px`,
                  overflow: 'hidden',
                  aspectRatio: { xs: '4 / 3.2', md: '4 / 3.5' },
                }}
              >
                {/* Foto vertical en recuadro casi cuadrado: el encuadre sube para que
                    el vano de la ventana y el volcán queden sobre la tarjeta de contacto */}
                <Image
                  src="/images/faq-ventana.jpg"
                  alt="Paisaje del sur de Chile con volcán visto a través del vano de una ventana en muro de paneles SIP"
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 46vw"
                  style={{ objectFit: 'cover', objectPosition: 'center 38%' }}
                />
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(205deg, rgba(13, 33, 41, 0.02) 42%, rgba(13, 33, 41, 0.72) 100%)',
                  }}
                />
                {/* Card de contacto flotante */}
                <Box sx={{ position: 'absolute', inset: 'auto 0 0 0', p: { xs: 2, md: 2.5 } }}>
                  <Box
                    sx={{
                      bgcolor: 'rgba(246, 241, 234, 0.95)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: `${radii.md}px`,
                      p: { xs: 2.25, md: 2.75 },
                    }}
                  >
                    <Typography
                      component="p"
                      sx={{
                        fontFamily: monoFamily,
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        letterSpacing: '0.2em',
                        color: colors.tanDark,
                        mb: 1,
                      }}
                    >
                      ¿TU DUDA NO ESTÁ AQUÍ?
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 2, color: 'text.primary' }}>
                      Hablemos de tu proyecto.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                      <Button variant="contained" color="primary" size="small" arrow href="/contacto">
                        Escríbenos
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        href={enlaceWhatsApp('Hola MundoSIP, tengo una pregunta que no está en las preguntas frecuentes.')}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        WhatsApp
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Reveal>
          </Box>

          {/* ── Índice de preguntas, debajo del header ── */}
          <Reveal y={20}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 2,
                mb: { xs: 1, md: 2 },
              }}
            >
              <Typography variant="h4" component="h2" sx={{ color: 'text.primary' }}>
                Todas las preguntas
              </Typography>
              <Typography
                component="span"
                sx={{ fontFamily: monoFamily, fontSize: '0.8rem', letterSpacing: '0.16em', color: 'text.secondary' }}
              >
                {String(faqs.length).padStart(2, '0')} EN TOTAL
              </Typography>
            </Box>
          </Reveal>

          <FaqAccordion faqs={faqs} />
        </Container>
      </Section>
    </>
  );
}

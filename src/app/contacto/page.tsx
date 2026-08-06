import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Clock, Mail, MapPin, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { Suspense } from 'react';

import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Reveal from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';
import ContactForm from '@/features/contacto/ContactForm';
import TelefonoCopiable from '@/features/contacto/TelefonoCopiable';
import { colors, layout, radii, scrims } from '@/theme/tokens';
import { displayFamily, monoFamily } from '@/theme/typography';

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Cotiza tu casa en panel SIP, tu panelizado a medida o la compra de paneles. Respondemos dentro de 24 horas hábiles.',
};

const CANALES = [
  {
    icono: <MessageCircle size={20} strokeWidth={2} />,
    titulo: 'WhatsApp',
    valor: '+56 9 4036 7867',
    detalle: 'La vía más rápida',
    href: 'https://wa.me/56940367867',
    externo: true,
    destacado: true,
  },
  {
    icono: <Mail size={20} strokeWidth={2} />,
    titulo: 'Correo',
    valor: 'contacto@mundosip.cl',
    detalle: 'Para planos y documentos',
    href: 'mailto:contacto@mundosip.cl',
    externo: false,
    destacado: false,
  },
];

const PASOS = [
  {
    numero: '01',
    titulo: 'Recibimos tu mensaje',
    texto: 'Te confirmamos la recepción y, si falta algo, te preguntamos lo justo para cotizar bien.',
  },
  {
    numero: '02',
    titulo: 'Preparamos tu cotización',
    texto: 'Calculamos paneles, maderas y fijaciones según tu proyecto. Sin costo y sin compromiso.',
  },
  {
    numero: '03',
    titulo: 'Coordinamos la fabricación',
    texto: 'Aprobada la cotización, dimensionamos tus paneles y agendamos el despacho a tu obra.',
  },
];

export default function ContactoPage() {
  return (
    <>
      {/* ── Hero + formulario ── */}
      <Box
        component="section"
        sx={{
          position: 'relative',
          bgcolor: colors.tealNight,
          color: colors.cream,
          overflow: 'hidden',
          pt: {
            xs: `${layout.headerHeight.mobile + 40}px`,
            md: `${layout.headerHeight.desktop + 80}px`,
          },
          pb: { xs: 8, md: 12 },
        }}
      >
        {/* Foto real de una casa MundoSIP al atardecer */}
        <Image
          src="/images/contacto.jpg"
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center 52%' }}
        />
        {/* Velo para legibilidad: más denso donde va el texto */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            background: scrims.heroFoto,
            pointerEvents: 'none',
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(246, 241, 234, 0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(246, 241, 234, 0.04) 1px, transparent 1px)
            `,
            backgroundSize: '88px 88px',
            maskImage: 'radial-gradient(110% 90% at 50% 30%, black 20%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(110% 90% at 50% 30%, black 20%, transparent 75%)',
            pointerEvents: 'none',
          }}
        />

        <Container sx={{ position: 'relative' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' },
              gap: { xs: 6, md: 8 },
              alignItems: 'start',
            }}
          >
            {/* Columna izquierda: mensaje + canales directos */}
            <Reveal x={-44} y={0}>
              <Eyebrow sx={{ color: colors.tanLight }}>Contacto</Eyebrow>
              <Typography
                variant="h1"
                component="h1"
                sx={{ mt: 2, mb: 3, fontSize: 'clamp(2.6rem, 5vw, 4rem)' }}
              >
                Cuéntanos tu
                <br />
                proyecto.
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'rgba(246, 241, 234, 0.78)', maxWidth: 420, mb: 4.5 }}>
                Ya sea un modelo del catálogo, tus propios planos o solo los paneles: escríbenos y te
                cotizamos sin costo.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {CANALES.map((canal) => (
                  <Box
                    key={canal.titulo}
                    component="a"
                    href={canal.href}
                    {...(canal.externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: `${radii.md}px`,
                      textDecoration: 'none',
                      color: 'inherit',
                      bgcolor: canal.destacado ? 'rgba(185, 138, 78, 0.16)' : 'rgba(246, 241, 234, 0.05)',
                      border: '1px solid',
                      borderColor: canal.destacado ? colors.tan : 'rgba(246, 241, 234, 0.12)',
                      transition: 'transform 0.3s cubic-bezier(.2,.7,.2,1), background-color 0.3s',
                      '&:hover': {
                        transform: 'translateX(6px)',
                        bgcolor: canal.destacado ? 'rgba(185, 138, 78, 0.24)' : 'rgba(246, 241, 234, 0.09)',
                      },
                      '&:focus-visible': { outline: `2px solid ${colors.tan}`, outlineOffset: 3 },
                    }}
                  >
                    <Box
                      aria-hidden
                      sx={{
                        flexShrink: 0,
                        width: 42,
                        height: 42,
                        borderRadius: `${radii.sm}px`,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: canal.destacado ? colors.tan : 'rgba(246, 241, 234, 0.1)',
                        color: canal.destacado ? colors.tealNight : colors.cream,
                      }}
                    >
                      {canal.icono}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.3 }}>
                        {canal.valor}
                      </Typography>
                      <Typography
                        sx={{ fontFamily: monoFamily, fontSize: '0.72rem', letterSpacing: '0.06em', color: 'rgba(246, 241, 234, 0.6)' }}
                      >
                        {canal.titulo} · {canal.detalle}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                <TelefonoCopiable numero="+56 9 4036 7867" detalle="Lun a vie, 9:00 a 18:00" />
              </Box>

              {/* Dirección y horario */}
              <Box sx={{ mt: 3.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box
                  component="a"
                  href="https://maps.google.com/?q=Arturo+Prat+742,+Purranque,+Chile"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    textDecoration: 'none',
                    color: 'rgba(246, 241, 234, 0.75)',
                    transition: 'color 0.25s',
                    '&:hover': { color: colors.cream },
                  }}
                >
                  <Box aria-hidden sx={{ mt: 0.3, flexShrink: 0, color: colors.tan }}>
                    <MapPin size={17} />
                  </Box>
                  <Typography sx={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
                    Arturo Prat 742, Purranque, Los Lagos
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, color: 'rgba(246, 241, 234, 0.6)' }}>
                  <Box aria-hidden sx={{ mt: 0.3, flexShrink: 0, color: colors.tan }}>
                    <Clock size={17} />
                  </Box>
                  <Typography sx={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
                    Lunes a viernes, 9:00 a 18:00 h
                  </Typography>
                </Box>
              </Box>
            </Reveal>

            {/* Columna derecha: el formulario, protagonista */}
            <Reveal x={44} y={0} delay={0.12}>
              <Box
                sx={{
                  position: 'relative',
                  p: { xs: 3, md: 5 },
                  borderRadius: `${radii.lg}px`,
                  // opaca sobre la foto: los campos necesitan contraste propio
                  bgcolor: 'rgba(13, 33, 41, 0.86)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(246, 241, 234, 0.14)',
                  boxShadow: '0 40px 90px -40px rgba(0, 0, 0, 0.6)',
                }}
              >
                <Typography
                  component="p"
                  sx={{
                    fontFamily: monoFamily,
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    letterSpacing: '0.22em',
                    color: colors.tanLight,
                    mb: 1,
                  }}
                >
                  COTIZACIÓN SIN COSTO
                </Typography>
                <Typography
                  component="h2"
                  sx={{
                    fontFamily: displayFamily,
                    fontWeight: 800,
                    fontSize: 'clamp(1.5rem, 2.4vw, 1.9rem)',
                    letterSpacing: '-0.01em',
                    mb: 4,
                  }}
                >
                  Escríbenos
                </Typography>

                <Suspense fallback={<Box sx={{ minHeight: 420 }} />}>
                  <ContactForm />
                </Suspense>
              </Box>
            </Reveal>
          </Box>
        </Container>
      </Box>

      {/* ── Qué pasa después ── */}
      <Section tone="paper" sx={{ py: { xs: 8, md: 11 } }}>
        <Container>
          <Reveal>
            <Eyebrow>Qué pasa después</Eyebrow>
            <Typography variant="h2" sx={{ mt: 2, mb: { xs: 4, md: 6 }, maxWidth: '20ch' }}>
              De tu mensaje a tu casa.
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
              <Reveal key={paso.numero} y={24} delay={i * 0.1}>
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
                  <Typography
                    component="span"
                    sx={{
                      fontFamily: monoFamily,
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      letterSpacing: '0.2em',
                      color: colors.tanDark,
                      display: 'block',
                      mb: 2,
                    }}
                  >
                    {paso.numero}
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

          <Reveal y={16} delay={0.2}>
            <Box
              sx={{
                mt: { xs: 4, md: 6 },
                p: { xs: 3, md: 4 },
                borderRadius: `${radii.lg}px`,
                bgcolor: 'background.default',
                border: '1px dashed',
                borderColor: 'divider',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 3,
              }}
            >
              <Box>
                <Typography variant="h5" component="p" sx={{ mb: 0.75 }}>
                  ¿Prefieres revisar antes los modelos?
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.98rem' }}>
                  Mira el catálogo con precios y decide con calma.
                </Typography>
              </Box>
              <Button variant="outlined" color="primary" arrow href="/modelos">
                Ver modelos
              </Button>
            </Box>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}

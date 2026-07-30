'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion, useReducedMotion } from 'framer-motion';

import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import { EASE, lineReveal, stagger } from '@/lib/motion';
import { colors, layout } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

interface HeroProps {
  /**
   * Video-ready: cuando exista el video institucional (Cloudinary/Mux),
   * pasar la URL aquí y el fondo generativo queda como poster/fallback.
   */
  videoSrc?: string;
  posterSrc?: string;
}

const headlineLines = ['Tu próxima casa,', 'lista para armar.'];

const specs = ['Kits de autoconstrucción', 'Panelizado a medida', 'Despacho a todo Chile'];

/** Capa de fondo: gradiente arquitectónico + retícula + barras de marca, con Ken Burns */
function HeroBackdrop({ videoSrc, posterSrc }: HeroProps) {
  const reduced = useReducedMotion();

  return (
    <Box aria-hidden sx={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {videoSrc ? (
        <Box
          component="video"
          autoPlay
          muted
          loop
          playsInline
          poster={posterSrc}
          src={videoSrc}
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <motion.div
          initial={false}
          animate={reduced ? {} : { scale: [1, 1.07], x: [0, -14] }}
          transition={{ duration: 22, ease: 'linear', repeat: Infinity, repeatType: 'mirror' }}
          style={{ position: 'absolute', inset: '-4%' }}
        >
          {/* Base: teal profundo con luz cálida entrando desde arriba a la derecha */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: `
                radial-gradient(120% 90% at 82% 8%, rgba(185, 138, 78, 0.34) 0%, rgba(185, 138, 78, 0) 46%),
                radial-gradient(90% 70% at 12% 100%, rgba(13, 33, 41, 0.9) 0%, rgba(13, 33, 41, 0) 60%),
                linear-gradient(158deg, ${colors.tealNight} 0%, ${colors.tealDeep} 42%, ${colors.teal} 100%)
              `,
            }}
          />
          {/* Retícula de plano técnico */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(rgba(246, 241, 234, 0.045) 1px, transparent 1px),
                linear-gradient(90deg, rgba(246, 241, 234, 0.045) 1px, transparent 1px)
              `,
              backgroundSize: '88px 88px',
              maskImage: 'radial-gradient(110% 100% at 50% 40%, black 30%, transparent 78%)',
            }}
          />
          {/* Barras de marca gigantes, como paneles en elevación */}
          <Box
            component="svg"
            viewBox="0 0 24 24"
            sx={{
              position: 'absolute',
              right: { xs: '-18%', md: '4%' },
              bottom: '-12%',
              width: { xs: '78%', md: '46%' },
              opacity: 0.1,
            }}
          >
            <rect x="0" y="9" width="5" height="15" rx="1" fill={colors.cream} />
            <rect x="8" y="4.5" width="5" height="19.5" rx="1" fill={colors.tan} />
            <rect x="16" y="0" width="5" height="24" rx="1" fill={colors.cream} />
          </Box>
        </motion.div>
      )}

      {/* Oscurecido para legibilidad: más denso arriba/abajo y hacia la izquierda (zona de texto) */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(180deg, rgba(13, 33, 41, 0.55) 0%, rgba(13, 33, 41, 0.2) 34%, rgba(13, 33, 41, 0.62) 100%),
            linear-gradient(90deg, rgba(13, 33, 41, 0.42) 0%, rgba(13, 33, 41, 0.1) 58%, rgba(13, 33, 41, 0.02) 100%)
          `,
        }}
      />
    </Box>
  );
}

export default function Hero({ videoSrc, posterSrc }: HeroProps) {
  const reduced = useReducedMotion();

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'flex-end',
        bgcolor: colors.tealDeep,
        color: colors.cream,
      }}
    >
      <HeroBackdrop videoSrc={videoSrc} posterSrc={posterSrc} />

      <Container sx={{ position: 'relative', zIndex: 1, pb: { xs: 6, md: 8 }, pt: `${layout.headerHeight.desktop + 48}px` }}>
        <motion.div
          initial={reduced ? false : 'hidden'}
          animate="visible"
          variants={stagger(0.12, 0.2)}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 14 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
            }}
          >
            <Eyebrow
              sx={{
                color: colors.cream,
                textShadow: '0 1px 14px rgba(13, 33, 41, 0.55)',
                '&::before': { bgcolor: colors.tan, opacity: 1 },
              }}
            >
              Casas en paneles SIP · Chile
            </Eyebrow>
          </motion.div>

          <Typography component="h1" variant="h1" sx={{ mt: 2.5, mb: 3.5, maxWidth: '13ch' }}>
            {headlineLines.map((line, i) => (
              <Box key={line} component="span" sx={{ display: 'block', overflow: 'hidden', pb: '0.08em', mb: '-0.08em' }}>
                <motion.span variants={lineReveal} style={{ display: 'block' }}>
                  {i === 1 ? (
                    <Box component="span" sx={{ color: colors.tanLight }}>
                      {line}
                    </Box>
                  ) : (
                    line
                  )}
                </motion.span>
              </Box>
            ))}
          </Typography>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 22 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ maxWidth: 560, color: 'rgba(246, 241, 234, 0.82)', mb: 5 }}
            >
              Diseñamos modelos propios y los convertimos en kits de autoconstrucción en panel SIP:
              precisos, térmicamente eficientes y listos para montar en semanas, no meses.
            </Typography>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 22 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" color="secondary" size="large" arrow href="/modelos">
                Ver modelos
              </Button>
              <Button variant="outlined" size="large" onDark href="/contacto">
                Cotizar mi proyecto
              </Button>
            </Box>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.9, ease: EASE } },
            }}
          >
            <Box
              sx={{
                mt: { xs: 6, md: 9 },
                pt: 3,
                borderTop: '1px solid rgba(246, 241, 234, 0.18)',
                display: 'flex',
                flexWrap: 'wrap',
                columnGap: 4,
                rowGap: 1.5,
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 4, rowGap: 1 }}>
                {specs.map((spec) => (
                  <Typography
                    key={spec}
                    component="span"
                    sx={{
                      fontFamily: monoFamily,
                      fontSize: '0.82rem',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'rgba(246, 241, 234, 0.75)',
                    }}
                  >
                    {spec}
                  </Typography>
                ))}
              </Box>
              <Typography
                component="span"
                aria-hidden
                sx={{
                  fontFamily: monoFamily,
                  fontSize: '0.82rem',
                  letterSpacing: '0.2em',
                  color: 'rgba(246, 241, 234, 0.55)',
                  display: { xs: 'none', md: 'block' },
                }}
              >
                SCROLL ↓
              </Typography>
            </Box>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
}

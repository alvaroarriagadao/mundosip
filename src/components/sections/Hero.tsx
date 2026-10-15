'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';

import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import { EASE, lineReveal, stagger } from '@/lib/motion';
import { colors, layout, scrims } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

interface HeroProps {
  /**
   * Video-ready: cuando exista el video institucional (Cloudinary/Mux),
   * pasar la URL aquí y el fondo generativo queda como poster/fallback.
   */
  videoSrc?: string;
  posterSrc?: string;
}

const headlineLines = ['Tus ideas,', 'una estructura que las sostiene.'];

const specs = ['Kits de autoconstrucción', 'Panelizado a medida', 'Despacho a todo Chile'];

/**
 * Video de fondo que también arranca en iPhone.
 *
 * iOS solo reproduce solo un video si está en silencio, dentro de la
 * página y sin controles. Aun así, en modo de bajo consumo o dentro del
 * navegador de Instagram lo bloquea y muestra un botón de play encima.
 * Por eso: (1) se fuerza `muted` también como PROPIEDAD (React a veces
 * solo pone el atributo y iOS mira la propiedad), (2) se intenta `play()`
 * al montar y, si iOS lo rechaza, en el primer toque de la persona, que
 * sí cuenta como permiso, y (3) el video queda INVISIBLE hasta que de
 * verdad se está reproduciendo, con la foto de portada como fondo fijo
 * detrás: si iOS lo bloquea, se ve la foto, nunca un botón de play.
 */
function VideoFondo({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const intentar = () => {
      if (!video.paused) return;
      video.play().catch(() => {
        /* iOS lo bloqueó (bajo consumo / Instagram): queda la portada */
      });
    };
    // Recién cuando hay imagen en movimiento se muestra el video. Se
    // comprueba que avance de verdad: 'timeupdate' también se dispara al
    // pausar, y un video detenido visible deja ver el botón de play de iOS
    const mostrar = () => {
      if (!video.paused && video.currentTime > 0) video.style.opacity = '1';
    };
    // Al volver a la pestaña o a la app, Safari pausa el video: se reanuda
    const alVolver = () => {
      if (document.visibilityState === 'visible') intentar();
    };
    // El primer toque desbloquea la reproducción en iOS
    const eventos = ['touchend', 'click', 'keydown'] as const;

    video.addEventListener('playing', mostrar);
    // Respaldo: si el autoplay arrancó antes de que este efecto escuchara
    // 'playing', el avance del tiempo igual lo delata
    video.addEventListener('timeupdate', mostrar);
    video.addEventListener('canplay', intentar);
    eventos.forEach((e) => window.addEventListener(e, intentar, { passive: true }));
    document.addEventListener('visibilitychange', alVolver);
    mostrar();
    intentar();

    return () => {
      video.removeEventListener('playing', mostrar);
      video.removeEventListener('timeupdate', mostrar);
      video.removeEventListener('canplay', intentar);
      eventos.forEach((e) => window.removeEventListener(e, intentar));
      document.removeEventListener('visibilitychange', alVolver);
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        // La portada vive aquí y no solo en `poster`: así se ve aunque el
        // video siga oculto porque iOS no lo dejó arrancar
        backgroundImage: poster ? `url(${poster})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Box
        component="video"
        ref={ref}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        controls={false}
        poster={poster}
        src={src}
        // iOS antiguos solo respetan la versión con prefijo
        {...{ 'webkit-playsinline': 'true', 'x5-playsinline': 'true' }}
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 0.6s ease',
          // Sin botón de play ni controles nativos, por si el video se muestra
          '&::-webkit-media-controls, &::-webkit-media-controls-panel, &::-webkit-media-controls-play-button, &::-webkit-media-controls-overlay-play-button':
            { display: 'none !important' },
          '&::-webkit-media-controls-start-playback-button': { display: 'none !important', WebkitAppearance: 'none' },
        }}
      />
    </Box>
  );
}

/** Capa de fondo: gradiente arquitectónico + retícula + barras de marca, con Ken Burns */
function HeroBackdrop({ videoSrc, posterSrc }: HeroProps) {
  const reduced = useReducedMotion();

  return (
    <Box aria-hidden sx={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {videoSrc ? (
        <VideoFondo src={videoSrc} poster={posterSrc} />
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
          background: scrims.heroVideo,
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

          <Typography component="h1" variant="h1" sx={{ mt: 2.5, mb: 3.5, maxWidth: '15ch' }}>
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
              sx={{ maxWidth: 620, color: 'rgba(246, 241, 234, 0.82)', mb: 5 }}
            >
              Fabricamos paneles SIP que permiten construir de forma eficiente, rápida y precisa.
              Una estructura que se adapta a distintas formas de habitar, donde la piel exterior
              puede ser tan diversa como cada proyecto.
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
                Ver diseños
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

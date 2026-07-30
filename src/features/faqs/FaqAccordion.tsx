'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';

import Reveal from '@/components/ui/Reveal';
import { EASE } from '@/lib/motion';
import type { Faq } from '@/features/faqs/faq.types';
import { colors, motionTokens } from '@/theme/tokens';
import { displayFamily, monoFamily } from '@/theme/typography';

/**
 * Acordeón de preguntas frecuentes: numeración mono, pregunta en
 * Montserrat, chevron que gira al abrir y despliegue animado.
 * Todas cerradas por defecto: invitan a explorar sin abrumar.
 */
export default function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [abierta, setAbierta] = useState<string | null>(null);
  const reduced = useReducedMotion();

  return (
    <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
      {faqs.map((faq, i) => {
        const open = abierta === faq.id;
        const contentId = `faq-panel-${faq.id}`;

        return (
          <Reveal key={faq.id} y={22} delay={Math.min(i * 0.05, 0.4)}>
            <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box
                component="button"
                type="button"
                onClick={() => setAbierta(open ? null : faq.id)}
                aria-expanded={open}
                aria-controls={contentId}
                sx={{
                  all: 'unset',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: { xs: 2, md: 3 },
                  width: '100%',
                  py: { xs: 2.5, md: 3 },
                  transition: `color ${motionTokens.dur.hover}s ${motionTokens.easeCss}`,
                  '&:hover .faq-num': { color: colors.tanDark },
                  '&:hover .faq-q': { color: colors.teal },
                  '&:hover .faq-chevron': { borderColor: colors.tan, color: colors.tanDark },
                  '&:focus-visible': { outline: `2px solid ${colors.tan}`, outlineOffset: 3 },
                }}
              >
                <Typography
                  className="faq-num"
                  component="span"
                  sx={{
                    fontFamily: monoFamily,
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    letterSpacing: '0.1em',
                    color: open ? colors.tanDark : 'text.secondary',
                    transition: `color ${motionTokens.dur.hover}s ${motionTokens.easeCss}`,
                    flexShrink: 0,
                    width: 34,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </Typography>

                <Typography
                  className="faq-q"
                  component="h3"
                  sx={{
                    flex: 1,
                    fontFamily: displayFamily,
                    fontWeight: 700,
                    fontSize: { xs: '1.05rem', md: '1.18rem' },
                    lineHeight: 1.35,
                    letterSpacing: '-0.005em',
                    color: open ? colors.teal : 'text.primary',
                    transition: `color ${motionTokens.dur.hover}s ${motionTokens.easeCss}`,
                  }}
                >
                  {faq.pregunta}
                </Typography>

                <Box
                  className="faq-chevron"
                  aria-hidden
                  sx={{
                    alignSelf: 'center',
                    flexShrink: 0,
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    border: '1.5px solid',
                    borderColor: open ? colors.tan : 'divider',
                    bgcolor: open ? colors.tan : 'transparent',
                    color: open ? colors.tealNight : 'text.secondary',
                    transform: open ? 'rotate(-180deg)' : 'rotate(0deg)',
                    transition: `all 0.4s ${motionTokens.easeCss}`,
                  }}
                >
                  <ChevronDown size={19} strokeWidth={2.25} />
                </Box>
              </Box>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    id={contentId}
                    initial={reduced ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={reduced ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    style={{ overflow: 'hidden' }}
                  >
                    <Box sx={{ pb: { xs: 3, md: 4 }, pl: { xs: 0, md: '58px' }, pr: { md: 7 }, maxWidth: 860 }}>
                      {faq.respuesta && (
                        <Typography sx={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'text.secondary' }}>
                          {faq.respuesta}
                        </Typography>
                      )}
                      {faq.puntos && (
                        <Box
                          component="ul"
                          sx={{
                            listStyle: 'none',
                            m: 0,
                            mt: faq.respuesta ? 2.5 : 0,
                            p: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.75,
                          }}
                        >
                          {faq.puntos.map((punto) => (
                            <Box key={punto.titulo} component="li" sx={{ display: 'flex', gap: 1.75, alignItems: 'flex-start' }}>
                              {/* Check positivo: cada punto es un beneficio */}
                              <Box
                                aria-hidden
                                sx={{
                                  flexShrink: 0,
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  display: 'grid',
                                  placeItems: 'center',
                                  bgcolor: 'rgba(185, 138, 78, 0.16)',
                                  color: colors.tanDark,
                                  mt: 0.35,
                                }}
                              >
                                <Check size={14} strokeWidth={2.75} />
                              </Box>
                              <Typography sx={{ fontSize: '1.02rem', lineHeight: 1.65, color: 'text.secondary' }}>
                                <Box component="strong" sx={{ color: 'text.primary', fontWeight: 700 }}>
                                  {punto.titulo}:
                                </Box>{' '}
                                {punto.texto}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
          </Reveal>
        );
      })}
    </Box>
  );
}

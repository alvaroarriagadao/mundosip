import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Check, Info, Layers, Plus } from 'lucide-react';

import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Reveal from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';
import { colors, radii } from '@/theme/tokens';
import { displayFamily, monoFamily } from '@/theme/typography';

interface ModeloKitsProps {
  /** Slug del modelo: los CTA llevan a su cotizador llave en mano */
  modeloSlug: string;
  kitInicial: string[];
  /** Solo los extras del Full; el primero es el diferenciador destacado */
  kitFullExtras: string[];
}

/** Separa "Piso – panel SIP 169 mm: descripción" en título y bajada */
function partirExtra(texto: string): { titulo: string; detalle?: string } {
  const i = texto.indexOf(':');
  if (i === -1) return { titulo: texto };
  return { titulo: texto.slice(0, i), detalle: texto.slice(i + 1).trim() };
}

const kickerSx = {
  fontFamily: monoFamily,
  fontWeight: 700,
  fontSize: '0.7rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
} as const;

/** Lista de ítems incluidos, con check. Compacta: son 14 líneas por card. */
function ItemsIncluidos({ items, dark = false }: { items: string[]; dark?: boolean }) {
  return (
    <Box
      component="ul"
      sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 0.85 }}
    >
      {items.map((item) => (
        <Box key={item} component="li" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
          <Box
            aria-hidden
            sx={{ color: dark ? 'rgba(246, 241, 234, 0.5)' : colors.tanDark, mt: 0.3, flexShrink: 0 }}
          >
            <Check size={15} strokeWidth={2.5} />
          </Box>
          <Typography
            sx={{
              fontSize: '0.92rem',
              lineHeight: 1.4,
              color: dark ? 'rgba(246, 241, 234, 0.88)' : 'text.primary',
            }}
          >
            {item}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

/**
 * Kit Inicial vs Kit Full.
 *
 * Cada tarjeta lista completo lo que incluye (así se lee autónoma) y el
 * Full cierra con un bloque destacado con lo único que agrega: el piso.
 * El radier no va en ningún kit — se cotiza aparte.
 */
export default function ModeloKits({ modeloSlug, kitInicial, kitFullExtras }: ModeloKitsProps) {
  const [principal, ...otrosExtras] = kitFullExtras;
  const destacado = principal ? partirExtra(principal) : null;

  return (
    // id="kits": destino del botón "Cotizar este modelo" del hero
    <Section tone="cream" id="kits" sx={{ pt: { xs: 8, md: 11 }, pb: { xs: 8, md: 11 } }}>
      <Container>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '6fr 6fr' },
            gap: { xs: 3, md: 10 },
            alignItems: 'end',
            mb: { xs: 3, md: 4 },
          }}
        >
          <Reveal>
            <Eyebrow>Qué incluye</Eyebrow>
            <Typography variant="h2" sx={{ mt: 2, maxWidth: '12ch' }}>
              Elige tu kit.
            </Typography>
          </Reveal>
          <Reveal delay={0.1}>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', maxWidth: 470 }}>
              Los dos kits llegan dimensionados y rotulados, listos para armar. La única diferencia:{' '}
              <Box component="strong" sx={{ color: 'text.primary', fontWeight: 700 }}>
                el Kit Full incluye el piso
              </Box>
              .
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
          {/* ── Kit Inicial ── */}
          <Reveal x={-40}>
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2.25,
                p: { xs: 2.5, md: 3 },
                borderRadius: `${radii.lg}px`,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box>
                <Typography variant="h3" component="h3" sx={{ mb: 0.75 }}>
                  Kit Inicial
                </Typography>
                <Typography sx={{ fontSize: '0.98rem', color: 'text.secondary' }}>
                  La estructura completa de tu casa. Ideal si ya tienes el piso resuelto.
                </Typography>
              </Box>

              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.25 }}>
                <ItemsIncluidos items={kitInicial} />
              </Box>

              <Button
                variant="outlined"
                color="primary"
                arrow
                href={`/modelos/${modeloSlug}/cotizar?kit=inicial`}
                sx={{ alignSelf: 'flex-start' }}
              >
                Cotizar Kit Inicial
              </Button>
            </Box>
          </Reveal>

          {/* ── Kit Full: misma base + bloque destacado del piso ── */}
          <Reveal x={40} delay={0.08}>
            <Box
              sx={{
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2.25,
                p: { xs: 2.5, md: 3 },
                borderRadius: `${radii.lg}px`,
                bgcolor: colors.tealDeep,
                color: colors.cream,
                boxShadow: '0 34px 80px -34px rgba(13, 33, 41, 0.5)',
                overflow: 'hidden',
              }}
            >
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: `radial-gradient(120% 80% at 100% 0%, rgba(185, 138, 78, 0.2) 0%, transparent 55%)`,
                  pointerEvents: 'none',
                }}
              />

              <Box sx={{ position: 'relative' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 0.75 }}>
                  <Typography variant="h3" component="h3">
                    Kit Full
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      ...kickerSx,
                      fontSize: '0.68rem',
                      letterSpacing: '0.18em',
                      color: colors.tealNight,
                      bgcolor: colors.tan,
                      px: 1.5,
                      py: 0.6,
                      borderRadius: `${radii.pill}px`,
                    }}
                  >
                    Más completo
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.98rem', color: 'rgba(246, 241, 234, 0.8)' }}>
                  Todo lo del Kit Inicial y, además, el piso estructural.
                </Typography>
              </Box>

              <Box sx={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', gap: 2.25 }}>
                <ItemsIncluidos items={kitInicial} dark />

                {/* Lo único que agrega el Full, visualmente separado */}
                {destacado && (
                  <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, mb: 1.5 }}>
                      <Typography component="p" sx={{ ...kickerSx, color: colors.tanLight, whiteSpace: 'nowrap' }}>
                        Incluye
                      </Typography>
                      <Box aria-hidden sx={{ flex: 1, height: '1px', bgcolor: 'rgba(246, 241, 234, 0.18)' }} />
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        p: 2.5,
                        borderRadius: `${radii.md}px`,
                        bgcolor: 'rgba(185, 138, 78, 0.17)',
                        border: `1.5px solid ${colors.tan}`,
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
                          bgcolor: colors.tan,
                          color: colors.tealNight,
                        }}
                      >
                        <Layers size={21} strokeWidth={2.25} />
                      </Box>
                      <Box>
                        <Typography
                          component="p"
                          sx={{
                            fontFamily: displayFamily,
                            fontWeight: 800,
                            fontSize: '1.15rem',
                            lineHeight: 1.25,
                            letterSpacing: '-0.01em',
                            mb: destacado.detalle ? 0.4 : 0,
                          }}
                        >
                          {destacado.titulo}
                        </Typography>
                        {destacado.detalle && (
                          <Typography sx={{ fontSize: '0.93rem', lineHeight: 1.5, color: 'rgba(246, 241, 234, 0.85)' }}>
                            {destacado.detalle}
                          </Typography>
                        )}
                        {otrosExtras.length > 0 && (
                          <Box
                            component="ul"
                            sx={{ listStyle: 'none', m: 0, mt: 1, p: 0, display: 'flex', flexDirection: 'column', gap: 0.7 }}
                          >
                            {otrosExtras.map((item) => (
                              <Box key={item} component="li" sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                <Box aria-hidden sx={{ color: colors.tanLight, flexShrink: 0, display: 'grid' }}>
                                  <Plus size={14} strokeWidth={3} />
                                </Box>
                                <Typography sx={{ fontSize: '0.95rem', fontWeight: 700 }}>{item}</Typography>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>

              <Button
                variant="contained"
                color="secondary"
                arrow
                href={`/modelos/${modeloSlug}/cotizar?kit=full`}
                sx={{ position: 'relative', alignSelf: 'flex-start' }}
              >
                Cotizar Kit Full
              </Button>
            </Box>
          </Reveal>
        </Box>

        {/* Aclaración: el radier no va en ningún kit */}
        <Reveal y={16} delay={0.12}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mt: { xs: 3, md: 4 }, px: 0.5 }}>
            <Box aria-hidden sx={{ color: colors.muted, mt: 0.25, flexShrink: 0 }}>
              <Info size={17} strokeWidth={2} />
            </Box>
            <Typography sx={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'text.secondary', maxWidth: 720 }}>
              El radier no está incluido en ninguno de los dos kits: se cotiza aparte, porque depende
              del terreno y del tipo de fundación que necesite tu proyecto.
            </Typography>
          </Box>
        </Reveal>
      </Container>
    </Section>
  );
}

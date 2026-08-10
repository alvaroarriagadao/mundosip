'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, FileDown, Loader2, ShoppingCart, Trash2, TriangleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import Button from '@/components/ui/Button';
import CifraAnimada from '@/components/ui/CifraAnimada';
import Reveal from '@/components/ui/Reveal';
import { formatCLP } from '@/lib/format';
import { EASE } from '@/lib/motion';
import { colors, layout, motionTokens, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

import PanelCaracteristicas from './PanelCaracteristicas';
import PanelCard from './PanelCard';
import type { PanelProducto } from './panel.types';
import { cotizarPanelesSchema } from './pedido.schema';

const datosSchema = cotizarPanelesSchema.pick({ nombre: true, email: true, telefono: true, web: true });
type DatosInput = z.infer<typeof datosSchema>;

type Estado = 'idle' | 'enviando' | 'ok' | 'error';

const campoSx = {
  width: '100%',
  bgcolor: 'rgba(246, 241, 234, 0.06)',
  border: '1px solid rgba(246, 241, 234, 0.16)',
  borderRadius: `${radii.md}px`,
  color: colors.cream,
  fontFamily: 'inherit',
  fontSize: '0.95rem',
  px: 1.75,
  py: 1.3,
  outline: 'none',
  transition: `border-color 0.25s ${motionTokens.easeCss}`,
  '&::placeholder': { color: 'rgba(246, 241, 234, 0.35)' },
  '&:hover': { borderColor: 'rgba(246, 241, 234, 0.3)' },
  '&:focus': { borderColor: colors.tan, bgcolor: 'rgba(246, 241, 234, 0.09)' },
} as const;

/**
 * Tienda de paneles: catálogo desde la DB + carrito con cantidades.
 * "Cotizar" descarga un PDF con folio y deja el pedido registrado
 * para el equipo (la compra en línea llega en una fase futura).
 */
export default function PanelesShop({ paneles }: { paneles: PanelProducto[] }) {
  /** slug → cantidad */
  const [carrito, setCarrito] = useState<ReadonlyMap<string, number>>(new Map());
  const [estado, setEstado] = useState<Estado>('idle');
  const [folio, setFolio] = useState<string | null>(null);
  /** Producto cuya ficha se está mirando en el modal */
  const [detalle, setDetalle] = useState<PanelProducto | null>(null);

  const lineas = useMemo(
    () =>
      paneles
        .filter((p) => (carrito.get(p.slug) ?? 0) > 0)
        .map((p) => ({ panel: p, cantidad: carrito.get(p.slug)! })),
    [paneles, carrito],
  );
  const total = useMemo(() => lineas.reduce((suma, l) => suma + l.panel.precioClp * l.cantidad, 0), [lineas]);
  const unidades = useMemo(() => lineas.reduce((suma, l) => suma + l.cantidad, 0), [lineas]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosInput>({
    resolver: zodResolver(datosSchema),
    defaultValues: { nombre: '', email: '', telefono: '', web: '' },
  });

  function cambiarCantidad(slug: string, nueva: number) {
    setCarrito((prev) => {
      const mapa = new Map(prev);
      if (nueva <= 0) {
        mapa.delete(slug);
      } else {
        mapa.set(slug, Math.min(nueva, 500));
      }
      return mapa;
    });
  }

  async function onSubmit(datos: DatosInput) {
    if (lineas.length === 0) return;
    setEstado('enviando');
    try {
      const respuesta = await fetch('/api/paneles/cotizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: lineas.map((l) => ({ slug: l.panel.slug, cantidad: l.cantidad })),
          ...datos,
        }),
      });

      if (!respuesta.ok) {
        setEstado('error');
        return;
      }

      const blob = await respuesta.blob();
      const nuevoFolio = respuesta.headers.get('X-Folio');

      setFolio(nuevoFolio);
      setEstado('ok');

      const urlBlob = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = urlBlob;
      enlace.download = `Cotizacion-Paneles-MundoSIP-${nuevoFolio ?? 'documento'}.pdf`;
      document.body.append(enlace);
      enlace.click();
      enlace.remove();
      setTimeout(() => URL.revokeObjectURL(urlBlob), 4000);
    } catch {
      setEstado('error');
    }
  }

  function reiniciar() {
    setCarrito(new Map());
    setFolio(null);
    setEstado('idle');
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 380px' },
        gap: { xs: 4, lg: 5 },
        alignItems: 'start',
      }}
    >
      {/* ── Catálogo: 2 columnas para que las cards respiren a lo ancho ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: { xs: 1.5, md: 2 },
          alignItems: 'stretch',
        }}
      >
        {paneles.map((panel, i) => (
          <Reveal key={panel.id} y={16} delay={Math.min(i * 0.04, 0.2)} style={{ display: 'flex' }}>
            <PanelCard
              panel={panel}
              cantidad={carrito.get(panel.slug) ?? 0}
              onCambiar={(nueva) => cambiarCantidad(panel.slug, nueva)}
              onVerCaracteristicas={() => setDetalle(panel)}
            />
          </Reveal>
        ))}
      </Box>

      <PanelCaracteristicas panel={detalle} onCerrar={() => setDetalle(null)} />

      {/* ── Carrito sticky ── */}
      <Box sx={{ position: { lg: 'sticky' }, top: { lg: `${layout.headerHeight.desktop + 24}px` } }}>
        <Reveal y={20} delay={0.1}>
          <Box
            sx={{
              position: 'relative',
              borderRadius: `${radii.lg}px`,
              bgcolor: colors.tealDeep,
              color: colors.cream,
              p: { xs: 2.5, md: 3 },
              boxShadow: '0 34px 80px -34px rgba(13, 33, 41, 0.55)',
              overflow: 'hidden',
            }}
          >
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(120% 80% at 100% 0%, rgba(185, 138, 78, 0.18) 0%, transparent 55%)',
                pointerEvents: 'none',
              }}
            />

            <Box sx={{ position: 'relative' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
                <Box aria-hidden sx={{ color: colors.tanLight, display: 'grid' }}>
                  <ShoppingCart size={18} strokeWidth={2.25} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Tu cotización</Typography>
                {unidades > 0 && (
                  <Typography component="span" sx={{ ml: 'auto', fontFamily: monoFamily, fontSize: '0.85rem', color: 'rgba(246, 241, 234, 0.7)' }}>
                    {unidades} {unidades === 1 ? 'panel' : 'paneles'}
                  </Typography>
                )}
              </Box>

              {lineas.length === 0 ? (
                <Typography sx={{ fontSize: '0.92rem', color: 'rgba(246, 241, 234, 0.7)', lineHeight: 1.55, mb: 1 }}>
                  Agrega los paneles que necesitas y descarga tu cotización en PDF al instante — sin
                  compromiso.
                </Typography>
              ) : (
                <>
                  {/* Líneas del carrito */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
                    {lineas.map(({ panel, cantidad }) => (
                      <Box
                        key={panel.slug}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          py: 1.1,
                          borderBottom: '1px solid rgba(246, 241, 234, 0.12)',
                          '&:last-of-type': { borderBottom: 0 },
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {panel.nombre}
                          </Typography>
                          <Typography sx={{ fontFamily: monoFamily, fontSize: '0.78rem', color: 'rgba(246, 241, 234, 0.6)' }}>
                            {cantidad} × {formatCLP(panel.precioClp)}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontFamily: monoFamily, fontWeight: 700, fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                          {formatCLP(panel.precioClp * cantidad)}
                        </Typography>
                        <Box
                          component="button"
                          type="button"
                          aria-label={`Quitar ${panel.nombre} de la cotización`}
                          onClick={() => cambiarCantidad(panel.slug, 0)}
                          sx={{
                            border: 0,
                            bgcolor: 'transparent',
                            color: 'rgba(246, 241, 234, 0.45)',
                            cursor: 'pointer',
                            display: 'grid',
                            p: 0.25,
                            '&:hover': { color: '#F0A98A' },
                          }}
                        >
                          <Trash2 size={14} />
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ borderTop: '1px solid rgba(246, 241, 234, 0.18)', pt: 1.75, mb: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <Typography sx={{ fontFamily: monoFamily, fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.18em', color: 'rgba(246, 241, 234, 0.6)' }}>
                      TOTAL
                    </Typography>
                    <Typography sx={{ fontFamily: monoFamily, fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.01em' }}>
                      <CifraAnimada valor={total} />
                    </Typography>
                  </Box>
                </>
              )}

              <AnimatePresence mode="wait" initial={false}>
                {estado === 'ok' ? (
                  <motion.div key="ok" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
                    <Box sx={{ display: 'flex', gap: 1.5, p: 2, borderRadius: `${radii.md}px`, bgcolor: 'rgba(185, 138, 78, 0.16)', border: `1px solid ${colors.tan}` }}>
                      <Box aria-hidden sx={{ color: colors.tanLight, mt: 0.25 }}>
                        <Check size={18} strokeWidth={2.5} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 0.5 }}>
                          Cotización {folio} descargada
                        </Typography>
                        <Typography sx={{ fontSize: '0.88rem', color: 'rgba(246, 241, 234, 0.8)', lineHeight: 1.5 }}>
                          Te contactaremos para confirmar stock, despacho y forma de pago.
                        </Typography>
                        <Box
                          component="button"
                          type="button"
                          onClick={reiniciar}
                          sx={{ mt: 1.25, border: 0, bgcolor: 'transparent', p: 0, cursor: 'pointer', color: colors.tanLight, fontSize: '0.85rem', fontWeight: 600, '&:hover': { color: colors.cream } }}
                        >
                          Armar otra cotización
                        </Box>
                      </Box>
                    </Box>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={handleSubmit(onSubmit)} noValidate exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mb: 1.75 }}>
                      <Box>
                        <Box component="input" type="text" placeholder="Tu nombre" aria-label="Nombre" sx={campoSx} {...register('nombre')} />
                        {errors.nombre && (
                          <Typography sx={{ mt: 0.5, fontSize: '0.82rem', color: '#F0A98A' }}>{errors.nombre.message}</Typography>
                        )}
                      </Box>
                      <Box>
                        <Box component="input" type="email" placeholder="tu@correo.cl" aria-label="Email" sx={campoSx} {...register('email')} />
                        {errors.email && (
                          <Typography sx={{ mt: 0.5, fontSize: '0.82rem', color: '#F0A98A' }}>{errors.email.message}</Typography>
                        )}
                      </Box>
                      <Box component="input" type="tel" placeholder="+56 9 … (opcional)" aria-label="Teléfono (opcional)" sx={campoSx} {...register('telefono')} />
                      <Box
                        component="input"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden
                        sx={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
                        {...register('web')}
                      />
                    </Box>

                    <Button
                      type="submit"
                      variant="contained"
                      color="secondary"
                      size="large"
                      fullWidth
                      disabled={estado === 'enviando' || lineas.length === 0}
                      startIcon={
                        estado === 'enviando' ? (
                          <Box component="span" aria-hidden sx={{ display: 'inline-flex', animation: 'giro 1s linear infinite', '@keyframes giro': { to: { transform: 'rotate(360deg)' } } }}>
                            <Loader2 size={18} />
                          </Box>
                        ) : (
                          <FileDown size={18} />
                        )
                      }
                    >
                      {estado === 'enviando' ? 'Generando tu PDF…' : 'Cotizar y descargar PDF'}
                    </Button>

                    {estado === 'error' && (
                      <Box sx={{ display: 'flex', gap: 1, mt: 1.5, alignItems: 'flex-start' }}>
                        <Box aria-hidden sx={{ color: '#F0A98A', mt: 0.2 }}>
                          <TriangleAlert size={15} />
                        </Box>
                        <Typography sx={{ fontSize: '0.85rem', color: '#F0A98A', lineHeight: 1.45 }}>
                          No pudimos generar tu cotización. Inténtalo de nuevo o escríbenos por WhatsApp.
                        </Typography>
                      </Box>
                    )}

                    <Typography sx={{ mt: 1.5, fontSize: '0.78rem', color: 'rgba(246, 241, 234, 0.55)', lineHeight: 1.5 }}>
                      Valores referenciales, no incluyen despacho. Validez de 7 días hábiles.
                    </Typography>
                  </motion.form>
                )}
              </AnimatePresence>
            </Box>
          </Box>
        </Reveal>
      </Box>
    </Box>
  );
}

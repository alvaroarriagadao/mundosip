'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

import { formatCLP } from '@/lib/format';
import { EASE } from '@/lib/motion';
import { colors, motionTokens, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

import { IMAGEN_DEFECTO } from './PanelCard';
import type { PanelProducto } from './panel.types';

/**
 * Ficha de características en modal.
 *
 * Va en modal y no desplegándose dentro de la card para que abrirla no
 * cambie el alto de la card ni descuadre la grilla — además acá la foto
 * se ve grande, que es lo que uno quiere al mirar el detalle.
 *
 * A propósito NO usa AnimatePresence: en este proyecto dejaba el nodo
 * montado tras la salida y, siendo un overlay `position: fixed` a
 * pantalla completa, seguía capturando todos los clics con opacity 0.
 * El modal se monta y desmonta derecho; la animación de entrada basta
 * y el cierre instantáneo es lo esperable en un diálogo.
 */
export default function PanelCaracteristicas({
  panel,
  onCerrar,
}: {
  panel: PanelProducto | null;
  onCerrar: () => void;
}) {
  // Escape cierra, y el fondo no scrollea mientras el modal está abierto
  useEffect(() => {
    if (!panel) return;
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', alPresionar);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', alPresionar);
      document.body.style.overflow = overflowPrevio;
    };
  }, [panel, onCerrar]);

  const specs = panel
    ? ([
        ['Dimensiones', panel.dimensiones],
        ['Espesor OSB', panel.espesorOsb],
        ['Núcleo EPS', panel.espesorEps],
        ['Densidad EPS', panel.densidadEps],
        ['Apto para madera', panel.aptoParaMadera],
      ].filter(([, valor]) => valor) as Array<[string, string]>)
    : [];

  if (!panel) return null;

  return (
    <motion.div
      key="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      onClick={onCerrar}
      style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1300,
            background: 'rgba(13, 33, 41, 0.62)',
            backdropFilter: 'blur(3px)',
            display: 'grid',
            placeItems: 'center',
            padding: 16,
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Características de ${panel.nombre}`}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 620,
              maxHeight: '88vh',
              overflowY: 'auto',
              borderRadius: radii.lg,
              background: colors.paper,
              boxShadow: '0 40px 90px -30px rgba(13, 33, 41, 0.6)',
              position: 'relative',
            }}
          >
            <Box
              component="button"
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar"
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: 0,
                bgcolor: 'rgba(13, 33, 41, 0.06)',
                color: colors.ink,
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                transition: `background-color 0.2s ${motionTokens.easeCss}`,
                '&:hover': { bgcolor: 'rgba(13, 33, 41, 0.12)' },
              }}
            >
              <X size={17} />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '200px 1fr' }, gap: { xs: 2, sm: 3 }, p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ bgcolor: '#FBF9F5', borderRadius: `${radii.md}px`, border: '1px solid', borderColor: 'divider', aspectRatio: '1 / 1', display: 'grid', placeItems: 'center' }}>
                <Box
                  component="img"
                  src={panel.imagenUrl || IMAGEN_DEFECTO}
                  alt={panel.nombre}
                  sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 2 }}
                />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h3" component="h2" sx={{ fontSize: '1.35rem', mb: 0.5, pr: 4 }}>
                  {panel.nombre}
                </Typography>
                <Typography sx={{ fontFamily: monoFamily, fontWeight: 700, fontSize: '1.3rem', color: colors.tanDark, mb: 2 }}>
                  {formatCLP(panel.precioClp)}
                </Typography>

                {panel.descripcion && (
                  <Typography sx={{ fontSize: '0.92rem', color: 'text.secondary', lineHeight: 1.6, mb: 2 }}>
                    {panel.descripcion}
                  </Typography>
                )}

                <Box component="dl" sx={{ m: 0 }}>
                  {specs.map(([etiqueta, valor]) => (
                    <Box
                      key={etiqueta}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 2,
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-of-type': { borderBottom: 0 },
                      }}
                    >
                      <Typography component="dt" sx={{ fontSize: '0.88rem', color: 'text.secondary' }}>
                        {etiqueta}
                      </Typography>
                      <Typography component="dd" sx={{ m: 0, fontSize: '0.88rem', fontWeight: 700, textAlign: 'right' }}>
                        {valor}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
      </motion.div>
    </motion.div>
  );
}

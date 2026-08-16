'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Check, Loader2, Save, TriangleAlert } from 'lucide-react';

import Button from '@/components/ui/Button';
import { colors, radii } from '@/theme/tokens';

/**
 * Piezas compartidas de los editores del panel (modelos, proyectos…):
 * el bloque con título y el botón de guardado con su estado.
 */

export type Estado = 'idle' | 'guardando' | 'ok' | 'error';

/** Bloque con título, para dividir el formulario en pasos legibles */
export function Seccion({ titulo, descripcion, children }: { titulo: string; descripcion?: string; children: React.ReactNode }) {
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, borderRadius: `${radii.md}px`, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', mb: 2.5 }}>
      <Typography variant="h3" component="h2" sx={{ fontSize: '1.12rem', mb: descripcion ? 0.5 : 2 }}>
        {titulo}
      </Typography>
      {descripcion && (
        <Typography sx={{ fontSize: '0.88rem', color: 'text.secondary', mb: 2, lineHeight: 1.5 }}>
          {descripcion}
        </Typography>
      )}
      {children}
    </Box>
  );
}

/** Botón de guardado con su estado; se repite en cada bloque del editor */
export function BotonGuardar({ estado, onClick, disabled = false }: { estado: Estado; onClick: () => void; disabled?: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2.5, flexWrap: 'wrap' }}>
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={onClick}
        disabled={disabled || estado === 'guardando'}
        startIcon={
          estado === 'guardando' ? (
            <Box component="span" aria-hidden sx={{ display: 'inline-flex', animation: 'giro 1s linear infinite', '@keyframes giro': { to: { transform: 'rotate(360deg)' } } }}>
              <Loader2 size={15} />
            </Box>
          ) : (
            <Save size={15} />
          )
        }
      >
        {estado === 'guardando' ? 'Guardando…' : 'Guardar'}
      </Button>
      {estado === 'ok' && (
        <Typography sx={{ fontSize: '0.86rem', color: colors.teal, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          <Check size={15} strokeWidth={2.5} /> Guardado
        </Typography>
      )}
      {estado === 'error' && (
        <Typography sx={{ fontSize: '0.86rem', color: '#B4472E', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          <TriangleAlert size={14} /> No se pudo guardar
        </Typography>
      )}
    </Box>
  );
}

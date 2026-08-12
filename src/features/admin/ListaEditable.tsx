'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';

import { colors, motionTokens, radii } from '@/theme/tokens';

import { inputSx } from './ui';

/**
 * Lista de textos editable: escribir, reordenar y borrar líneas.
 * La usan las características del modelo y los ítems de cada kit.
 * Sin arrastrar: las flechas son más predecibles en móvil y para
 * alguien no técnico.
 */
export default function ListaEditable({
  items,
  onCambiar,
  placeholder,
  textoBotón = 'Agregar',
  ayuda,
}: {
  items: string[];
  onCambiar: (items: string[]) => void;
  placeholder: string;
  textoBotón?: string;
  ayuda?: string;
}) {
  function editar(indice: number, valor: string) {
    onCambiar(items.map((t, i) => (i === indice ? valor : t)));
  }

  function mover(indice: number, delta: number) {
    const destino = indice + delta;
    if (destino < 0 || destino >= items.length) return;
    const copia = [...items];
    [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
    onCambiar(copia);
  }

  const iconoSx = {
    width: 30,
    height: 30,
    border: 0,
    borderRadius: `${radii.sm}px`,
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'transparent',
    color: colors.muted,
    cursor: 'pointer',
    flexShrink: 0,
    transition: `color 0.2s ${motionTokens.easeCss}`,
    '&:hover': { color: colors.teal },
    '&:disabled': { opacity: 0.3, cursor: 'default' },
  } as const;

  return (
    <Box>
      {ayuda && (
        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', mb: 1 }}>{ayuda}</Typography>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {items.map((texto, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              component="span"
              sx={{ width: 22, flexShrink: 0, fontSize: '0.8rem', color: colors.muted, textAlign: 'right' }}
            >
              {i + 1}
            </Typography>
            <Box
              component="input"
              value={texto}
              placeholder={placeholder}
              aria-label={`Línea ${i + 1}`}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => editar(i, e.target.value)}
              sx={{ ...inputSx, flex: 1, minWidth: 0 }}
            />
            <Box component="button" type="button" aria-label={`Subir línea ${i + 1}`} disabled={i === 0} onClick={() => mover(i, -1)} sx={iconoSx}>
              <ArrowUp size={15} />
            </Box>
            <Box component="button" type="button" aria-label={`Bajar línea ${i + 1}`} disabled={i === items.length - 1} onClick={() => mover(i, 1)} sx={iconoSx}>
              <ArrowDown size={15} />
            </Box>
            <Box
              component="button"
              type="button"
              aria-label={`Eliminar línea ${i + 1}`}
              onClick={() => onCambiar(items.filter((_, j) => j !== i))}
              sx={{ ...iconoSx, '&:hover': { color: '#B4472E' } }}
            >
              <Trash2 size={15} />
            </Box>
          </Box>
        ))}
      </Box>

      <Box
        component="button"
        type="button"
        onClick={() => onCambiar([...items, ''])}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          border: 0,
          bgcolor: 'transparent',
          p: 0,
          mt: items.length > 0 ? 1.5 : 0,
          cursor: 'pointer',
          color: colors.teal,
          fontFamily: 'inherit',
          fontSize: '0.88rem',
          fontWeight: 700,
          '&:hover': { color: colors.tanDark },
        }}
      >
        <Plus size={15} strokeWidth={2.5} /> {textoBotón}
      </Box>
    </Box>
  );
}

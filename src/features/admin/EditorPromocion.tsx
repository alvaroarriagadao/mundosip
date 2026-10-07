'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Tag } from 'lucide-react';
import { useState } from 'react';

import Toggle from '@/components/ui/Toggle';
import { formatPct, precioConPromocion, type Promocion } from '@/features/modelos/precio';
import { formatCLP } from '@/lib/format';
import { colors, radii } from '@/theme/tokens';

import { BotonGuardar, type Estado } from './Bloques';
import { etiquetaSx, inputNumeroSx, inputSx } from './ui';

/** Precio de muestra para que el equipo vea el efecto antes de guardar */
const PRECIO_EJEMPLO = 14_500_000;

/**
 * La promoción vigente del catálogo: un descuento para todos los
 * modelos. Al prenderla, /modelos y cada ficha muestran el precio
 * tachado y el rebajado con el nombre de la promo.
 */
export default function EditorPromocion({ inicial }: { inicial: Promocion }) {
  const [nombre, setNombre] = useState(inicial.nombre);
  const [pct, setPct] = useState(inicial.descuentoPct ? String(inicial.descuentoPct) : '');
  const [activa, setActiva] = useState(inicial.activa);
  const [aplicarACotizaciones, setAplicarACotizaciones] = useState(false);
  const [estado, setEstado] = useState<Estado>('idle');
  const [mensaje, setMensaje] = useState<string | null>(null);

  const pctNum = Number(pct.replace(',', '.'));
  const pctValido = Number.isFinite(pctNum) && pctNum >= 0 && pctNum < 100;
  const valido = pctValido && (!activa || pctNum > 0);
  const vista: Promocion = { nombre: nombre.trim(), descuentoPct: pctValido ? pctNum : 0, activa };

  async function guardar() {
    if (!valido) return;
    setEstado('guardando');
    setMensaje(null);
    try {
      const respuesta = await fetch('/api/admin/promocion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...vista, aplicarACotizaciones }),
      });
      const cuerpo = (await respuesta.json().catch(() => null)) as { error?: string; plantillas?: number } | null;
      if (!respuesta.ok) {
        setMensaje(cuerpo?.error ?? 'No se pudo guardar.');
        setEstado('error');
        return;
      }
      if (aplicarACotizaciones) {
        setMensaje(`Descuento copiado a ${cuerpo?.plantillas ?? 0} plantillas de cotización.`);
        setAplicarACotizaciones(false);
      }
      setEstado('ok');
      setTimeout(() => setEstado('idle'), 2500);
    } catch {
      setMensaje('No se pudo guardar. Revisa tu conexión.');
      setEstado('error');
    }
  }

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        mb: 3,
        borderRadius: `${radii.md}px`,
        border: '1px solid',
        borderColor: activa ? colors.tan : 'divider',
        bgcolor: activa ? 'rgba(185, 138, 78, 0.07)' : 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.5 }}>
        <Box aria-hidden sx={{ color: colors.tanDark, display: 'grid' }}>
          <Tag size={18} />
        </Box>
        <Typography variant="h3" component="h2" sx={{ fontSize: '1.12rem' }}>
          Promoción vigente
        </Typography>
      </Box>
      <Typography sx={{ fontSize: '0.88rem', color: 'text.secondary', mb: 2.5, lineHeight: 1.5 }}>
        Un descuento para todos los modelos. Con la promo prendida, el catálogo y cada ficha muestran
        el precio tachado y el rebajado con este nombre.
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1.4fr' }, gap: 2, alignItems: 'end', mb: 2 }}>
        <Box>
          <Typography component="label" sx={etiquetaSx}>
            Nombre de la promoción
          </Typography>
          <Box component="input" value={nombre} placeholder="Descuento primavera" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)} sx={inputSx} />
        </Box>
        <Box>
          <Typography component="label" sx={etiquetaSx}>
            Descuento %
          </Typography>
          <Box component="input" inputMode="decimal" value={pct} placeholder="3" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPct(e.target.value)} sx={inputNumeroSx} />
        </Box>
        <Box sx={{ pb: 0.9 }}>
          <Toggle activo={activa} onCambiar={setActiva} etiqueta={activa ? 'Promoción activa en el sitio' : 'Promoción apagada'} />
        </Box>
      </Box>

      {/* Vista previa: cómo se verá el precio en una card */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          p: 1.75,
          mb: 2,
          borderRadius: `${radii.sm}px`,
          bgcolor: 'rgba(32, 78, 95, 0.05)',
          border: '1px dashed',
          borderColor: 'divider',
        }}
      >
        <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>Así se verá un kit de {formatCLP(PRECIO_EJEMPLO)}:</Typography>
        {activa && pctValido && pctNum > 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', textDecoration: 'line-through' }}>{formatCLP(PRECIO_EJEMPLO)}</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: colors.tanDark }}>{formatCLP(precioConPromocion(PRECIO_EJEMPLO, vista))}</Typography>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: colors.tanDark }}>
              {vista.nombre || 'Descuento'} -{formatPct(pctNum)}
            </Typography>
          </Box>
        ) : (
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: colors.tanDark }}>{formatCLP(PRECIO_EJEMPLO)}</Typography>
        )}
      </Box>

      <Box component="label" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, cursor: 'pointer' }}>
        <Box component="input" type="checkbox" checked={aplicarACotizaciones} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAplicarACotizaciones(e.target.checked)} sx={{ mt: 0.4, width: 16, height: 16, accentColor: colors.teal }} />
        <Box>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>Aplicar también este descuento a todas las plantillas de cotización</Typography>
          <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
            Reemplaza el descuento de cada plantilla por este, para que lo cotizado coincida con el catálogo.
            {activa ? '' : ' Con la promo apagada, las deja sin descuento.'}
          </Typography>
        </Box>
      </Box>

      <BotonGuardar estado={estado} onClick={guardar} disabled={!valido} />
      {!valido && activa && <Typography sx={{ mt: 1, fontSize: '0.85rem', color: '#B4472E' }}>Para activarla, indica un porcentaje mayor a 0.</Typography>}
      {mensaje && <Typography sx={{ mt: 1, fontSize: '0.85rem', color: estado === 'error' ? '#B4472E' : colors.teal }}>{mensaje}</Typography>}
    </Box>
  );
}

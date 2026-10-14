'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Hash } from 'lucide-react';
import { useState } from 'react';

import { formatearFolio } from '@/features/cotizador/folio';
import { formatearFolioPedido } from '@/features/paneles/pedido.schema';
import { colors, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

import { BotonGuardar, type Estado } from './Bloques';
import type { EstadoFolio, TipoFolio } from './folios.db';
import { etiquetaSx, inputNumeroSx } from './ui';

const FORMATO: Record<TipoFolio, (n: number) => string> = {
  casas: formatearFolio,
  paneles: formatearFolioPedido,
};

/**
 * Número de la próxima cotización. El equipo puede ADELANTARLO (por
 * ejemplo para continuar la numeración que traían de antes), nunca
 * bajarlo por debajo del último emitido: así ningún folio se repite.
 */
export default function EditorFolio({ tipo, inicial }: { tipo: TipoFolio; inicial: EstadoFolio }) {
  const [actual, setActual] = useState(inicial);
  const [valor, setValor] = useState(String(inicial.siguiente));
  const [estado, setEstado] = useState<Estado>('idle');
  const [mensaje, setMensaje] = useState<string | null>(null);

  const formatear = FORMATO[tipo];
  const numero = Number(valor);
  const esEntero = valor.trim() !== '' && Number.isInteger(numero) && numero >= 1 && numero <= 9_999_999;
  const valido = esEntero && numero > actual.ultimoEmitido;
  const sinCambios = esEntero && numero === actual.siguiente;

  async function guardar() {
    if (!valido) return;
    setEstado('guardando');
    setMensaje(null);
    try {
      const respuesta = await fetch('/api/admin/folios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, siguiente: numero }),
      });
      const cuerpo = (await respuesta.json().catch(() => null)) as (Partial<EstadoFolio> & { error?: string }) | null;
      if (cuerpo?.siguiente != null && cuerpo.ultimoEmitido != null) {
        setActual({ siguiente: cuerpo.siguiente, ultimoEmitido: cuerpo.ultimoEmitido });
      }
      if (!respuesta.ok) {
        setMensaje(cuerpo?.error ?? 'No se pudo guardar.');
        setEstado('error');
        return;
      }
      setEstado('ok');
      setTimeout(() => setEstado('idle'), 2500);
    } catch {
      setMensaje('No se pudo guardar. Revisa tu conexión.');
      setEstado('error');
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 2.5 }, borderRadius: `${radii.md}px`, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Hash size={17} color={colors.tanDark} />
        <Typography variant="h3" component="h2" sx={{ fontSize: '1.08rem' }}>
          Número de la próxima cotización
        </Typography>
      </Box>
      <Typography sx={{ fontSize: '0.86rem', color: 'text.secondary', mb: 2, lineHeight: 1.5 }}>
        Cada cotización que se descarga desde el sitio toma este número y el contador sube solo. Puedes adelantarlo, por
        ejemplo para seguir la numeración que usaban antes. No puede ser igual o menor al último emitido, para que ningún
        folio se repita.
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ width: 160 }}>
          <Typography component="label" htmlFor={`folio-${tipo}`} sx={etiquetaSx}>
            Próximo número
          </Typography>
          <Box
            component="input"
            id={`folio-${tipo}`}
            type="number"
            inputMode="numeric"
            min={actual.ultimoEmitido + 1}
            step={1}
            value={valor}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValor(e.target.value)}
            sx={inputNumeroSx}
          />
        </Box>
        <Box sx={{ pb: 0.75 }}>
          <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>La próxima saldrá como</Typography>
          <Typography sx={{ fontFamily: monoFamily, fontWeight: 700, fontSize: '1.05rem', color: valido ? colors.teal : colors.muted }}>
            {esEntero ? formatear(numero) : '—'}
          </Typography>
        </Box>
        <Box sx={{ pb: 0.75 }}>
          <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>Última emitida</Typography>
          <Typography sx={{ fontFamily: monoFamily, fontWeight: 700, fontSize: '1.05rem', color: colors.ink }}>
            {actual.ultimoEmitido > 0 ? formatear(actual.ultimoEmitido) : 'Ninguna aún'}
          </Typography>
        </Box>
      </Box>

      {esEntero && !valido && (
        <Typography sx={{ fontSize: '0.84rem', color: '#B4472E', mt: 1.5 }}>
          Debe ser mayor a {actual.ultimoEmitido}, el último folio emitido.
        </Typography>
      )}
      {mensaje && (
        <Typography sx={{ fontSize: '0.84rem', color: estado === 'error' ? '#B4472E' : colors.teal, mt: 1.5 }}>{mensaje}</Typography>
      )}

      <BotonGuardar estado={estado} onClick={guardar} disabled={!valido || sinCambios} />
    </Box>
  );
}

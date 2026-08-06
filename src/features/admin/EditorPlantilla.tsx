'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Check, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import Button from '@/components/ui/Button';
import { formatCLP } from '@/lib/format';
import { colors, motionTokens, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

import { subtotalSeccion } from '@/features/cotizador/calcular';
import type {
  ItemCotizacion,
  PlantillaCotizacion,
  SeccionCotizacion,
} from '@/features/cotizador/cotizacion.types';

/**
 * Editor de una plantilla de cotización: partidas editables en línea,
 * alta/baja de partidas y datos generales (descuento, notas, pago).
 * Cada guardado va directo a Neon; el cotizador público lo refleja
 * en la próxima visita.
 */

type EstadoFila = 'idle' | 'guardando' | 'ok' | 'error';

const inputSx = {
  width: '100%',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: `${radii.sm}px`,
  bgcolor: 'background.paper',
  color: 'text.primary',
  fontFamily: 'inherit',
  fontSize: '0.9rem',
  px: 1.25,
  py: 0.9,
  outline: 'none',
  transition: `border-color 0.2s ${motionTokens.easeCss}`,
  '&:focus': { borderColor: colors.teal },
} as const;

const inputMonoSx = { ...inputSx, fontFamily: monoFamily, textAlign: 'right' } as const;

const etiquetaSx = {
  fontFamily: monoFamily,
  fontWeight: 700,
  fontSize: '0.64rem',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: colors.muted,
  display: 'block',
  mb: 0.5,
} as const;

function IconoEstado({ estado }: { estado: EstadoFila }) {
  if (estado === 'guardando') {
    return (
      <Box
        component="span"
        aria-hidden
        sx={{ display: 'inline-flex', animation: 'giro 1s linear infinite', '@keyframes giro': { to: { transform: 'rotate(360deg)' } } }}
      >
        <Loader2 size={16} />
      </Box>
    );
  }
  if (estado === 'ok') return <Check size={16} strokeWidth={2.5} />;
  return <Save size={16} />;
}

/** Una partida editable. Guarda con el botón cuando hay cambios. */
function FilaItem({
  item,
  onGuardado,
  onEliminado,
}: {
  item: ItemCotizacion;
  onGuardado: (item: ItemCotizacion) => void;
  onEliminado: () => void;
}) {
  const [descripcion, setDescripcion] = useState(item.descripcion);
  const [unidad, setUnidad] = useState(item.unidad);
  const [cantidad, setCantidad] = useState(String(item.cantidad));
  const [precio, setPrecio] = useState(String(item.precioUnitario));
  const [estado, setEstado] = useState<EstadoFila>('idle');

  const cantidadNum = Number(cantidad.replace(',', '.'));
  const precioNum = Number(precio);
  const valido = descripcion.trim().length >= 2 && unidad.trim().length > 0 && cantidadNum > 0 && Number.isFinite(precioNum) && precioNum >= 0;
  const cambiado =
    descripcion !== item.descripcion ||
    unidad !== item.unidad ||
    cantidadNum !== item.cantidad ||
    precioNum !== item.precioUnitario;

  async function guardar() {
    if (!valido || !cambiado) return;
    setEstado('guardando');
    try {
      const respuesta = await fetch(`/api/admin/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion: descripcion.trim(),
          unidad: unidad.trim(),
          cantidad: cantidadNum,
          precioUnitario: Math.round(precioNum),
        }),
      });
      if (!respuesta.ok) {
        setEstado('error');
        return;
      }
      setEstado('ok');
      onGuardado({ ...item, descripcion: descripcion.trim(), unidad: unidad.trim(), cantidad: cantidadNum, precioUnitario: Math.round(precioNum) });
    } catch {
      setEstado('error');
    }
  }

  async function eliminar() {
    if (!window.confirm(`¿Eliminar la partida "${item.descripcion}"?`)) return;
    setEstado('guardando');
    try {
      const respuesta = await fetch(`/api/admin/items/${item.id}`, { method: 'DELETE' });
      if (!respuesta.ok) {
        setEstado('error');
        return;
      }
      onEliminado();
    } catch {
      setEstado('error');
    }
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 76px 96px 130px 120px auto' },
        gap: 1,
        alignItems: 'center',
        py: 1,
        borderBottom: '1px dashed',
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 0 },
      }}
    >
      <Box component="input" aria-label="Descripción" value={descripcion} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescripcion(e.target.value)} sx={inputSx} />
      <Box component="input" aria-label="Unidad" value={unidad} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUnidad(e.target.value)} sx={{ ...inputSx, textAlign: 'center' }} />
      <Box component="input" aria-label="Cantidad" inputMode="decimal" value={cantidad} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCantidad(e.target.value)} sx={inputMonoSx} />
      <Box component="input" aria-label="Precio unitario" inputMode="numeric" value={precio} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrecio(e.target.value)} sx={inputMonoSx} />
      <Typography sx={{ fontFamily: monoFamily, fontWeight: 700, fontSize: '0.88rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
        {valido ? formatCLP(Math.round(cantidadNum * precioNum)) : '—'}
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
        <Box
          component="button"
          type="button"
          onClick={guardar}
          disabled={!valido || !cambiado || estado === 'guardando'}
          aria-label="Guardar partida"
          sx={{
            border: 0,
            borderRadius: `${radii.sm}px`,
            width: 34,
            height: 34,
            display: 'grid',
            placeItems: 'center',
            cursor: cambiado && valido ? 'pointer' : 'default',
            bgcolor: cambiado && valido ? colors.teal : 'transparent',
            color: cambiado && valido ? colors.cream : estado === 'ok' ? colors.teal : colors.muted,
            transition: `all 0.2s ${motionTokens.easeCss}`,
          }}
        >
          <IconoEstado estado={cambiado ? (estado === 'guardando' ? 'guardando' : 'idle') : estado} />
        </Box>
        <Box
          component="button"
          type="button"
          onClick={eliminar}
          aria-label="Eliminar partida"
          sx={{
            border: 0,
            borderRadius: `${radii.sm}px`,
            width: 34,
            height: 34,
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            bgcolor: 'transparent',
            color: colors.muted,
            transition: `color 0.2s ${motionTokens.easeCss}`,
            '&:hover': { color: '#B4472E' },
          }}
        >
          <Trash2 size={16} />
        </Box>
      </Box>
      {estado === 'error' && (
        <Typography sx={{ gridColumn: '1 / -1', fontSize: '0.8rem', color: '#B4472E' }}>
          No se pudo guardar. Reintenta.
        </Typography>
      )}
    </Box>
  );
}

/** Formulario compacto para agregar una partida a la sección. */
function NuevaPartida({ seccionId, onCreada }: { seccionId: string; onCreada: (item: ItemCotizacion) => void }) {
  const [abierto, setAbierto] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [unidad, setUnidad] = useState('uni');
  const [cantidad, setCantidad] = useState('1');
  const [precio, setPrecio] = useState('');
  const [estado, setEstado] = useState<EstadoFila>('idle');

  const cantidadNum = Number(cantidad.replace(',', '.'));
  const precioNum = Number(precio);
  const valido = descripcion.trim().length >= 2 && unidad.trim().length > 0 && cantidadNum > 0 && Number.isFinite(precioNum) && precioNum >= 0 && precio !== '';

  async function crear() {
    if (!valido) return;
    setEstado('guardando');
    try {
      const respuesta = await fetch('/api/admin/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seccionId,
          descripcion: descripcion.trim(),
          unidad: unidad.trim(),
          cantidad: cantidadNum,
          precioUnitario: Math.round(precioNum),
        }),
      });
      const cuerpo = (await respuesta.json().catch(() => null)) as { id?: string } | null;
      if (!respuesta.ok || !cuerpo?.id) {
        setEstado('error');
        return;
      }
      onCreada({
        id: cuerpo.id,
        codigo: null,
        descripcion: descripcion.trim(),
        unidad: unidad.trim(),
        cantidad: cantidadNum,
        precioUnitario: Math.round(precioNum),
      });
      setDescripcion('');
      setUnidad('uni');
      setCantidad('1');
      setPrecio('');
      setEstado('idle');
      setAbierto(false);
    } catch {
      setEstado('error');
    }
  }

  if (!abierto) {
    return (
      <Box
        component="button"
        type="button"
        onClick={() => setAbierto(true)}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          border: 0,
          bgcolor: 'transparent',
          cursor: 'pointer',
          color: colors.teal,
          fontFamily: monoFamily,
          fontWeight: 700,
          fontSize: '0.75rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          p: 0,
          mt: 1.5,
          '&:hover': { color: colors.tanDark },
        }}
      >
        <Plus size={15} strokeWidth={2.5} /> Agregar partida
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 1.5, p: 1.5, borderRadius: `${radii.sm}px`, bgcolor: 'rgba(32, 78, 95, 0.05)', border: '1px dashed', borderColor: 'divider' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 76px 96px 130px auto' },
          gap: 1,
          alignItems: 'center',
        }}
      >
        <Box component="input" aria-label="Descripción nueva" placeholder="Descripción de la partida" value={descripcion} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescripcion(e.target.value)} sx={inputSx} />
        <Box component="input" aria-label="Unidad nueva" placeholder="uni" value={unidad} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUnidad(e.target.value)} sx={{ ...inputSx, textAlign: 'center' }} />
        <Box component="input" aria-label="Cantidad nueva" inputMode="decimal" placeholder="1" value={cantidad} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCantidad(e.target.value)} sx={inputMonoSx} />
        <Box component="input" aria-label="Precio unitario nuevo" inputMode="numeric" placeholder="Precio CLP" value={precio} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrecio(e.target.value)} sx={inputMonoSx} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" color="primary" size="small" onClick={crear} disabled={!valido || estado === 'guardando'}>
            {estado === 'guardando' ? 'Creando…' : 'Crear'}
          </Button>
          <Button variant="outlined" color="primary" size="small" onClick={() => setAbierto(false)}>
            Cancelar
          </Button>
        </Box>
      </Box>
      {estado === 'error' && (
        <Typography sx={{ mt: 1, fontSize: '0.8rem', color: '#B4472E' }}>No se pudo crear la partida.</Typography>
      )}
    </Box>
  );
}

/** Datos generales: título del documento, descuento, pago y notas. */
function DatosGenerales({ plantilla }: { plantilla: PlantillaCotizacion }) {
  const [titulo, setTitulo] = useState(plantilla.titulo);
  const [descuentoNombre, setDescuentoNombre] = useState(plantilla.descuentoNombre ?? '');
  const [descuentoPct, setDescuentoPct] = useState(String(plantilla.descuentoPct));
  const [condiciones, setCondiciones] = useState(plantilla.condicionesPago ?? '');
  const [notas, setNotas] = useState(plantilla.notas.join('\n'));
  const [estado, setEstado] = useState<EstadoFila>('idle');

  const pctNum = Number(descuentoPct.replace(',', '.'));
  const valido = titulo.trim().length >= 4 && Number.isFinite(pctNum) && pctNum >= 0 && pctNum < 100;

  async function guardar() {
    if (!valido) return;
    setEstado('guardando');
    try {
      const respuesta = await fetch(`/api/admin/plantillas/${plantilla.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: titulo.trim(),
          descuentoNombre: descuentoNombre.trim() || null,
          descuentoPct: pctNum,
          condicionesPago: condiciones.trim() || null,
          notas: notas
            .split('\n')
            .map((n) => n.trim())
            .filter(Boolean),
        }),
      });
      setEstado(respuesta.ok ? 'ok' : 'error');
    } catch {
      setEstado('error');
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, borderRadius: `${radii.md}px`, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', mb: 4 }}>
      <Typography variant="h3" component="h2" sx={{ fontSize: '1.15rem', mb: 2.5 }}>
        Datos generales
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography component="label" htmlFor="titulo-doc" sx={etiquetaSx}>
          Título del documento (encabezado del PDF)
        </Typography>
        <Box id="titulo-doc" component="input" value={titulo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitulo(e.target.value)} sx={inputSx} />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2, mb: 2 }}>
        <Box>
          <Typography component="label" htmlFor="descuento-nombre" sx={etiquetaSx}>
            Nombre del descuento
          </Typography>
          <Box id="descuento-nombre" component="input" placeholder="Desc. Invierno" value={descuentoNombre} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescuentoNombre(e.target.value)} sx={inputSx} />
        </Box>
        <Box>
          <Typography component="label" htmlFor="descuento-pct" sx={etiquetaSx}>
            Descuento %
          </Typography>
          <Box id="descuento-pct" component="input" inputMode="decimal" value={descuentoPct} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescuentoPct(e.target.value)} sx={inputMonoSx} />
        </Box>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography component="label" htmlFor="condiciones" sx={etiquetaSx}>
          Condiciones de pago
        </Typography>
        <Box id="condiciones" component="textarea" rows={2} value={condiciones} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCondiciones(e.target.value)} sx={{ ...inputSx, resize: 'vertical' }} />
      </Box>
      <Box sx={{ mb: 2.5 }}>
        <Typography component="label" htmlFor="notas" sx={etiquetaSx}>
          Notas (una por línea)
        </Typography>
        <Box id="notas" component="textarea" rows={4} value={notas} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotas(e.target.value)} sx={{ ...inputSx, resize: 'vertical' }} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Button variant="contained" color="primary" size="small" onClick={guardar} disabled={!valido || estado === 'guardando'}>
          {estado === 'guardando' ? 'Guardando…' : 'Guardar datos generales'}
        </Button>
        {estado === 'ok' && (
          <Typography sx={{ fontSize: '0.85rem', color: colors.teal, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <Check size={15} strokeWidth={2.5} /> Guardado
          </Typography>
        )}
        {estado === 'error' && (
          <Typography sx={{ fontSize: '0.85rem', color: '#B4472E' }}>No se pudo guardar.</Typography>
        )}
      </Box>
    </Box>
  );
}

export default function EditorPlantilla({ plantilla }: { plantilla: PlantillaCotizacion }) {
  const [secciones, setSecciones] = useState<SeccionCotizacion[]>(plantilla.secciones);

  const netoTotal = useMemo(
    () => secciones.reduce((suma, s) => suma + subtotalSeccion(s), 0),
    [secciones],
  );

  function actualizarItem(seccionId: string, itemActualizado: ItemCotizacion) {
    setSecciones((prev) =>
      prev.map((s) =>
        s.id === seccionId
          ? { ...s, items: s.items.map((i) => (i.id === itemActualizado.id ? itemActualizado : i)) }
          : s,
      ),
    );
  }

  function quitarItem(seccionId: string, itemId: string) {
    setSecciones((prev) =>
      prev.map((s) => (s.id === seccionId ? { ...s, items: s.items.filter((i) => i.id !== itemId) } : s)),
    );
  }

  function agregarItem(seccionId: string, item: ItemCotizacion) {
    setSecciones((prev) => prev.map((s) => (s.id === seccionId ? { ...s, items: [...s.items, item] } : s)));
  }

  return (
    <Box>
      <DatosGenerales plantilla={plantilla} />

      {/* Neto vivo mientras se edita */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: 1,
          mb: 2,
          px: 0.5,
        }}
      >
        <Typography variant="h3" component="h2" sx={{ fontSize: '1.15rem' }}>
          Partidas por sección
        </Typography>
        <Typography sx={{ fontFamily: monoFamily, fontWeight: 700 }}>
          Neto total: {formatCLP(netoTotal)}
        </Typography>
      </Box>

      {/* Índice: salta directo a la sección sin scrollear las 70 partidas */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2.5 }}>
        {secciones.map((seccion) => (
          <Box
            key={seccion.id}
            component="a"
            href={`#seccion-${seccion.codigo.replace('°', '')}`}
            sx={{
              textDecoration: 'none',
              fontFamily: monoFamily,
              fontWeight: 700,
              fontSize: '0.72rem',
              letterSpacing: '0.06em',
              px: 1.25,
              py: 0.6,
              borderRadius: `${radii.pill}px`,
              border: '1px solid',
              borderColor: 'divider',
              color: 'text.secondary',
              bgcolor: 'background.paper',
              transition: `all 0.2s ${motionTokens.easeCss}`,
              '&:hover': { color: colors.teal, borderColor: colors.teal },
            }}
          >
            {seccion.codigo} {seccion.nombre}
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {secciones.map((seccion) => (
          <Box
            key={seccion.id}
            id={`seccion-${seccion.codigo.replace('°', '')}`}
            sx={{
              p: { xs: 2, md: 2.5 },
              borderRadius: `${radii.md}px`,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              // que el anclaje no quede tapado por el header fijo
              scrollMarginTop: '110px',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.25 }}>
                <Typography component="span" sx={{ fontFamily: monoFamily, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.14em', color: colors.tanDark }}>
                  {seccion.codigo}
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '1.02rem' }}>{seccion.nombre}</Typography>
              </Box>
              <Typography sx={{ fontFamily: monoFamily, fontSize: '0.88rem', color: 'text.secondary' }}>
                Subtotal {formatCLP(subtotalSeccion(seccion))}
              </Typography>
            </Box>

            {/* Cabecera de columnas (solo escritorio) */}
            <Box
              sx={{
                display: { xs: 'none', md: 'grid' },
                gridTemplateColumns: 'minmax(0, 1fr) 76px 96px 130px 120px 76px',
                gap: 1,
                pb: 0.75,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              {['Descripción', 'Unidad', 'Cantidad', 'P. unitario', 'Total', ''].map((titulo, i) => (
                <Typography key={titulo || `col-${i}`} sx={{ ...etiquetaSx, mb: 0, textAlign: i >= 2 && i <= 4 ? 'right' : 'left' }}>
                  {titulo}
                </Typography>
              ))}
            </Box>

            {seccion.items.map((item) => (
              <FilaItem
                key={item.id}
                item={item}
                onGuardado={(actualizado) => actualizarItem(seccion.id, actualizado)}
                onEliminado={() => quitarItem(seccion.id, item.id)}
              />
            ))}

            <NuevaPartida seccionId={seccion.id} onCreada={(item) => agregarItem(seccion.id, item)} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

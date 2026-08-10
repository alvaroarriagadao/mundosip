'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Check, Loader2, Lock, LockOpen, Plus, Save, Trash2 } from 'lucide-react';
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

import { etiquetaSx, inputNumeroSx, inputSx } from './ui';

/**
 * Editor de una plantilla de cotización, todo editable en línea:
 * datos generales (título, descuento, IVA, superficie), SECCIONES
 * (nombre, si va siempre incluida, crear y eliminar) y sus partidas.
 * El resumen de la cotización final se recalcula en vivo mientras
 * se edita. Cada guardado va directo a Neon.
 */

type EstadoFila = 'idle' | 'guardando' | 'ok' | 'error';

const inputMonoSx = inputNumeroSx;

/**
 * Rótulo de campo visible SOLO en móvil: ahí la fila se apila y la
 * cabecera de columnas desaparece, así que sin esto los campos quedan
 * sin contexto ("gl", "1", "1950000" sueltos).
 */
const rotuloMovilSx = {
  display: { xs: 'block', md: 'none' },
  fontSize: '0.72rem',
  fontWeight: 600,
  color: 'text.secondary',
  mb: 0.25,
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
      <Box>
        <Typography component="span" sx={rotuloMovilSx}>
          Descripción
        </Typography>
        <Box component="input" aria-label="Descripción" value={descripcion} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescripcion(e.target.value)} sx={inputSx} />
      </Box>
      <Box>
        <Typography component="span" sx={rotuloMovilSx}>
          Unidad
        </Typography>
        <Box component="input" aria-label="Unidad" value={unidad} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUnidad(e.target.value)} sx={{ ...inputSx, textAlign: { xs: 'left', md: 'center' } }} />
      </Box>
      <Box>
        <Typography component="span" sx={rotuloMovilSx}>
          Cantidad
        </Typography>
        <Box component="input" aria-label="Cantidad" inputMode="decimal" value={cantidad} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCantidad(e.target.value)} sx={inputMonoSx} />
      </Box>
      <Box>
        <Typography component="span" sx={rotuloMovilSx}>
          Precio unitario
        </Typography>
        <Box component="input" aria-label="Precio unitario" inputMode="numeric" value={precio} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrecio(e.target.value)} sx={inputMonoSx} />
      </Box>
      <Typography sx={{ fontFamily: monoFamily, fontWeight: 700, fontSize: '0.88rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
        <Box component="span" sx={{ ...rotuloMovilSx, display: { xs: 'inline', md: 'none' }, mr: 0.75 }}>
          Total:
        </Box>
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
          fontFamily: 'inherit',
          fontWeight: 700,
          fontSize: '0.88rem',
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

/**
 * Cabecera editable de la sección: nombre libre, candado de "siempre
 * incluida" (lo que el cliente no puede desmarcar) y eliminación.
 */
function CabeceraSeccion({
  seccion,
  onGuardada,
  onEliminada,
}: {
  seccion: SeccionCotizacion;
  onGuardada: (cambios: { nombre: string; obligatoria: boolean }) => void;
  onEliminada: () => void;
}) {
  const [nombre, setNombre] = useState(seccion.nombre);
  const [obligatoria, setObligatoria] = useState(seccion.obligatoria);
  const [estado, setEstado] = useState<EstadoFila>('idle');

  const valido = nombre.trim().length >= 2;
  const cambiado = nombre.trim() !== seccion.nombre || obligatoria !== seccion.obligatoria;

  async function guardar() {
    if (!valido || !cambiado) return;
    setEstado('guardando');
    try {
      const respuesta = await fetch(`/api/admin/secciones/${seccion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim(), obligatoria }),
      });
      if (!respuesta.ok) {
        setEstado('error');
        return;
      }
      setEstado('ok');
      onGuardada({ nombre: nombre.trim(), obligatoria });
    } catch {
      setEstado('error');
    }
  }

  async function eliminar() {
    const n = seccion.items.length;
    if (
      !window.confirm(
        `¿Eliminar la sección "${seccion.nombre}"${n > 0 ? ` con sus ${n} partidas` : ''}? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    setEstado('guardando');
    try {
      const respuesta = await fetch(`/api/admin/secciones/${seccion.id}`, { method: 'DELETE' });
      if (!respuesta.ok) {
        setEstado('error');
        return;
      }
      onEliminada();
    } catch {
      setEstado('error');
    }
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
      <Typography component="span" sx={{ fontWeight: 700, fontSize: '0.82rem', color: colors.tanDark, flexShrink: 0 }}>
        {seccion.codigo}
      </Typography>

      {/* Nombre editable de la sección */}
      <Box
        component="input"
        aria-label={`Nombre de la sección ${seccion.codigo}`}
        value={nombre}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
        sx={{ ...inputSx, flex: 1, minWidth: 180, fontWeight: 700, fontSize: '0.98rem' }}
      />

      {/* ¿El cliente puede desmarcarla en el cotizador? */}
      <Box
        component="button"
        type="button"
        onClick={() => setObligatoria((v) => !v)}
        title={obligatoria ? 'Siempre incluida: el cliente no puede quitarla' : 'Opcional: el cliente decide si la agrega'}
        aria-pressed={obligatoria}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          border: '1px solid',
          borderColor: obligatoria ? colors.teal : 'divider',
          borderRadius: `${radii.pill}px`,
          px: 1.5,
          py: 0.7,
          bgcolor: obligatoria ? 'rgba(32, 78, 95, 0.1)' : 'transparent',
          color: obligatoria ? colors.teal : colors.muted,
          fontFamily: 'inherit',
          fontWeight: 600,
          fontSize: '0.78rem',
          cursor: 'pointer',
          transition: `all 0.2s ${motionTokens.easeCss}`,
          whiteSpace: 'nowrap',
        }}
      >
        {obligatoria ? <Lock size={12} strokeWidth={2.5} /> : <LockOpen size={12} strokeWidth={2.5} />}
        {obligatoria ? 'Siempre incluida' : 'Opcional'}
      </Box>

      <Typography sx={{ fontFamily: monoFamily, fontSize: '0.88rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
        {formatCLP(subtotalSeccion(seccion))}
      </Typography>

      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Box
          component="button"
          type="button"
          onClick={guardar}
          disabled={!valido || !cambiado || estado === 'guardando'}
          aria-label={`Guardar sección ${seccion.codigo}`}
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
          aria-label={`Eliminar sección ${seccion.nombre}`}
          title="Eliminar la sección y sus partidas"
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
        <Typography sx={{ width: '100%', fontSize: '0.8rem', color: '#B4472E' }}>
          No se pudo guardar la sección. Reintenta.
        </Typography>
      )}
    </Box>
  );
}

/** Crea una sección nueva al final de la plantilla. */
function NuevaSeccion({ plantillaId, onCreada }: { plantillaId: string; onCreada: (seccion: SeccionCotizacion) => void }) {
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState('');
  const [estado, setEstado] = useState<EstadoFila>('idle');
  const valido = nombre.trim().length >= 2;

  async function crear() {
    if (!valido) return;
    setEstado('guardando');
    try {
      const respuesta = await fetch('/api/admin/secciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plantillaId, nombre: nombre.trim() }),
      });
      const cuerpo = (await respuesta.json().catch(() => null)) as { id?: string; codigo?: string } | null;
      if (!respuesta.ok || !cuerpo?.id) {
        setEstado('error');
        return;
      }
      onCreada({ id: cuerpo.id, codigo: cuerpo.codigo ?? '', nombre: nombre.trim(), obligatoria: false, items: [] });
      setNombre('');
      setEstado('idle');
      setAbierto(false);
    } catch {
      setEstado('error');
    }
  }

  if (!abierto) {
    return (
      <Button variant="outlined" color="primary" startIcon={<Plus size={16} />} onClick={() => setAbierto(true)} sx={{ alignSelf: 'flex-start' }}>
        Agregar sección
      </Button>
    );
  }

  return (
    <Box sx={{ p: 2, borderRadius: `${radii.md}px`, border: '1px dashed', borderColor: colors.teal, bgcolor: 'rgba(32, 78, 95, 0.04)' }}>
      <Typography component="label" htmlFor="nueva-seccion" sx={etiquetaSx}>
        Nombre de la nueva sección
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Box
          id="nueva-seccion"
          component="input"
          placeholder="Ej: Paisajismo y exteriores"
          value={nombre}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
          sx={{ ...inputSx, flex: 1, minWidth: 220 }}
        />
        <Button variant="contained" color="primary" size="small" onClick={crear} disabled={!valido || estado === 'guardando'}>
          {estado === 'guardando' ? 'Creando…' : 'Crear sección'}
        </Button>
        <Button variant="outlined" color="primary" size="small" onClick={() => setAbierto(false)}>
          Cancelar
        </Button>
      </Box>
      {estado === 'error' && (
        <Typography sx={{ mt: 1, fontSize: '0.8rem', color: '#B4472E' }}>No se pudo crear la sección.</Typography>
      )}
    </Box>
  );
}

export default function EditorPlantilla({ plantilla }: { plantilla: PlantillaCotizacion }) {
  const [secciones, setSecciones] = useState<SeccionCotizacion[]>(plantilla.secciones);

  // Datos generales en el padre: el resumen final reacciona mientras se editan
  const [titulo, setTitulo] = useState(plantilla.titulo);
  const [descuentoNombre, setDescuentoNombre] = useState(plantilla.descuentoNombre ?? '');
  const [descuentoPct, setDescuentoPct] = useState(String(plantilla.descuentoPct));
  const [ivaPct, setIvaPct] = useState(String(plantilla.ivaPct));
  const [superficie, setSuperficie] = useState(plantilla.superficieM2 ? String(plantilla.superficieM2) : '');
  const [condiciones, setCondiciones] = useState(plantilla.condicionesPago ?? '');
  const [notas, setNotas] = useState(plantilla.notas.join('\n'));
  const [estadoGenerales, setEstadoGenerales] = useState<EstadoFila>('idle');

  const pctDescuento = Number(descuentoPct.replace(',', '.'));
  const pctIva = Number(ivaPct.replace(',', '.'));
  const superficieNum = Number(superficie);
  const generalesValidos =
    titulo.trim().length >= 4 &&
    Number.isFinite(pctDescuento) && pctDescuento >= 0 && pctDescuento < 100 &&
    Number.isFinite(pctIva) && pctIva >= 0 && pctIva <= 50 &&
    (superficie === '' || (Number.isInteger(superficieNum) && superficieNum > 0));

  /** La cotización final, tal como saldría en el PDF, en vivo */
  const resumen = useMemo(() => {
    const neto = secciones.reduce((suma, s) => suma + subtotalSeccion(s), 0);
    const descuento = Number.isFinite(pctDescuento) ? Math.round((neto * pctDescuento) / 100) : 0;
    const netoConDescuento = neto - descuento;
    const iva = Number.isFinite(pctIva) ? Math.round((netoConDescuento * pctIva) / 100) : 0;
    return {
      neto,
      descuento,
      netoConDescuento,
      iva,
      total: netoConDescuento + iva,
      valorM2: superficieNum > 0 ? Math.round(netoConDescuento / superficieNum) : null,
    };
  }, [secciones, pctDescuento, pctIva, superficieNum]);

  async function guardarGenerales() {
    if (!generalesValidos) return;
    setEstadoGenerales('guardando');
    try {
      const respuesta = await fetch(`/api/admin/plantillas/${plantilla.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: titulo.trim(),
          descuentoNombre: descuentoNombre.trim() || null,
          descuentoPct: pctDescuento,
          ivaPct: pctIva,
          superficieM2: superficie === '' ? null : superficieNum,
          condicionesPago: condiciones.trim() || null,
          notas: notas
            .split('\n')
            .map((n) => n.trim())
            .filter(Boolean),
        }),
      });
      setEstadoGenerales(respuesta.ok ? 'ok' : 'error');
    } catch {
      setEstadoGenerales('error');
    }
  }

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

  function actualizarSeccion(seccionId: string, cambios: { nombre: string; obligatoria: boolean }) {
    setSecciones((prev) => prev.map((s) => (s.id === seccionId ? { ...s, ...cambios } : s)));
  }

  function quitarSeccion(seccionId: string) {
    setSecciones((prev) => prev.filter((s) => s.id !== seccionId));
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' },
        gap: { xs: 3, lg: 4 },
        alignItems: 'start',
      }}
    >
      <Box>
        {/* ── Datos generales ── */}
        <Box sx={{ p: { xs: 2, md: 3 }, borderRadius: `${radii.md}px`, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', mb: 3 }}>
          <Typography variant="h3" component="h2" sx={{ fontSize: '1.15rem', mb: 2.5 }}>
            Datos generales
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography component="label" htmlFor="titulo-doc" sx={etiquetaSx}>
              Título del documento (encabezado del PDF)
            </Typography>
            <Box id="titulo-doc" component="input" value={titulo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitulo(e.target.value)} sx={inputSx} />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '2fr 1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
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
            <Box>
              <Typography component="label" htmlFor="iva-pct" sx={etiquetaSx}>
                IVA %
              </Typography>
              <Box id="iva-pct" component="input" inputMode="decimal" value={ivaPct} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIvaPct(e.target.value)} sx={inputMonoSx} />
            </Box>
            <Box>
              <Typography component="label" htmlFor="superficie" sx={etiquetaSx}>
                Superficie m²
              </Typography>
              <Box id="superficie" component="input" inputMode="numeric" placeholder="80" value={superficie} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSuperficie(e.target.value)} sx={inputMonoSx} />
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
              Notas (una por línea — el costo x m² se calcula solo en cada cotización)
            </Typography>
            <Box id="notas" component="textarea" rows={4} value={notas} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotas(e.target.value)} sx={{ ...inputSx, resize: 'vertical' }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button variant="contained" color="primary" size="small" onClick={guardarGenerales} disabled={!generalesValidos || estadoGenerales === 'guardando'}>
              {estadoGenerales === 'guardando' ? 'Guardando…' : 'Guardar datos generales'}
            </Button>
            {estadoGenerales === 'ok' && (
              <Typography sx={{ fontSize: '0.85rem', color: colors.teal, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                <Check size={15} strokeWidth={2.5} /> Guardado
              </Typography>
            )}
            {estadoGenerales === 'error' && (
              <Typography sx={{ fontSize: '0.85rem', color: '#B4472E' }}>No se pudo guardar.</Typography>
            )}
          </Box>
        </Box>

        {/* ── Índice + secciones ── */}
        <Typography variant="h3" component="h2" sx={{ fontSize: '1.15rem', mb: 2 }}>
          Secciones y partidas
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2.5 }}>
          {secciones.map((seccion) => (
            <Box
              key={seccion.id}
              component="a"
              href={`#seccion-${seccion.codigo.replace('°', '')}`}
              sx={{
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
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
                scrollMarginTop: '110px',
              }}
            >
              <CabeceraSeccion
                seccion={seccion}
                onGuardada={(cambios) => actualizarSeccion(seccion.id, cambios)}
                onEliminada={() => quitarSeccion(seccion.id)}
              />

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
                {['Descripción', 'Unidad', 'Cantidad', 'P. unitario', 'Total', ''].map((tituloCol, i) => (
                  <Typography key={tituloCol || `col-${i}`} sx={{ ...etiquetaSx, mb: 0, textAlign: i >= 2 && i <= 4 ? 'right' : 'left' }}>
                    {tituloCol}
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

          <NuevaSeccion
            plantillaId={plantilla.id}
            onCreada={(seccion) => setSecciones((prev) => [...prev, seccion])}
          />
        </Box>
      </Box>

      {/* ── Resumen de la cotización final, en vivo ── */}
      <Box sx={{ position: { lg: 'sticky' }, top: { lg: '104px' } }}>
        <Box
          sx={{
            borderRadius: `${radii.lg}px`,
            bgcolor: colors.tealDeep,
            color: colors.cream,
            p: { xs: 2.5, md: 3 },
            boxShadow: '0 30px 70px -30px rgba(13, 33, 41, 0.5)',
          }}
        >
          <Typography component="p" sx={{ fontWeight: 700, fontSize: '0.92rem', color: colors.tanLight, mb: 2 }}>
            Cotización final (llave en mano completa)
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              <Typography sx={{ fontSize: '0.9rem', color: 'rgba(246, 241, 234, 0.75)' }}>Valor neto</Typography>
              <Typography sx={{ fontFamily: monoFamily, fontSize: '0.9rem' }}>{formatCLP(resumen.neto)}</Typography>
            </Box>
            {resumen.descuento > 0 && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <Typography sx={{ fontSize: '0.9rem', color: colors.tanLight }}>
                    {descuentoNombre.trim() || 'Descuento'} ({descuentoPct}%)
                  </Typography>
                  <Typography sx={{ fontFamily: monoFamily, fontSize: '0.9rem', color: colors.tanLight }}>
                    −{formatCLP(resumen.descuento)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <Typography sx={{ fontSize: '0.9rem', color: 'rgba(246, 241, 234, 0.75)' }}>Neto c/descuento</Typography>
                  <Typography sx={{ fontFamily: monoFamily, fontSize: '0.9rem' }}>{formatCLP(resumen.netoConDescuento)}</Typography>
                </Box>
              </>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              <Typography sx={{ fontSize: '0.9rem', color: 'rgba(246, 241, 234, 0.75)' }}>IVA ({ivaPct}%)</Typography>
              <Typography sx={{ fontFamily: monoFamily, fontSize: '0.9rem' }}>{formatCLP(resumen.iva)}</Typography>
            </Box>
          </Box>

          <Box sx={{ borderTop: '1px solid rgba(246, 241, 234, 0.18)', mt: 2, pt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: colors.tanLight }}>
                Total
              </Typography>
              <Typography sx={{ fontFamily: monoFamily, fontWeight: 700, fontSize: '1.45rem', letterSpacing: '-0.01em' }}>
                {formatCLP(resumen.total)}
              </Typography>
            </Box>
            {resumen.valorM2 != null && (
              <Typography sx={{ mt: 1, fontSize: '0.82rem', color: 'rgba(246, 241, 234, 0.65)', textAlign: 'right' }}>
                {formatCLP(resumen.valorM2)} x m² + IVA · {superficie} m²
              </Typography>
            )}
          </Box>

          <Typography sx={{ mt: 2, fontSize: '0.78rem', color: 'rgba(246, 241, 234, 0.55)', lineHeight: 1.5 }}>
            Se recalcula en vivo con lo que edites. El costo x m² sale de neto con descuento ÷
            superficie, y en cada cotización de cliente se calcula según lo que él seleccione.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

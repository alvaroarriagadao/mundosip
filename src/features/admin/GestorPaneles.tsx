'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, GripVertical, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import { EASE } from '@/lib/motion';
import PanelCard from '@/features/paneles/PanelCard';
import { mmOsb, tonosPorEspesor } from '@/features/paneles/espesor';
import type { PanelProducto } from '@/features/paneles/panel.types';
import { colors, motionTokens, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

import SelectorImagen from './SelectorImagen';
import { etiquetaSx, inputNumeroSx, inputSx } from './ui';

/**
 * Gestor de productos de la tienda /paneles — pensado para alguien NO
 * técnico. Muestra las MISMAS tarjetas que ve el cliente, en la misma
 * grilla y al mismo ancho, para ordenar "viendo" la tienda: se arrastran
 * (o se mueven con las flechas) y el orden se guarda solo. "Editar" abre
 * el formulario ahí mismo, el interruptor publica/oculta al tiro y
 * "Agregar un panel" usa el mismo formulario.
 */

const IMAGEN_DEFECTO = '/images/paneles/panel-sip.png';

interface CamposPanel {
  nombre: string;
  precio: string;
  dimensiones: string;
  espesorOsb: string;
  espesorEps: string;
  densidadEps: string;
  aptoParaMadera: string;
  descripcion: string;
  imagenUrl: string;
  publicado: boolean;
}

function aCampos(panel: PanelProducto | null): CamposPanel {
  return {
    nombre: panel?.nombre ?? '',
    precio: panel ? String(panel.precioClp) : '',
    dimensiones: panel?.dimensiones ?? '',
    espesorOsb: panel?.espesorOsb ?? '',
    espesorEps: panel?.espesorEps ?? '',
    densidadEps: panel?.densidadEps ?? '15 kg/m³',
    aptoParaMadera: panel?.aptoParaMadera ?? '',
    descripcion: panel?.descripcion ?? '',
    imagenUrl: panel?.imagenUrl && panel.imagenUrl !== IMAGEN_DEFECTO ? panel.imagenUrl : '',
    publicado: panel?.publicado ?? true,
  };
}

function aPayload(campos: CamposPanel) {
  return {
    nombre: campos.nombre.trim(),
    precioClp: Math.round(Number(campos.precio)),
    dimensiones: campos.dimensiones.trim() || null,
    espesorOsb: campos.espesorOsb.trim() || null,
    espesorEps: campos.espesorEps.trim() || null,
    densidadEps: campos.densidadEps.trim() || null,
    aptoParaMadera: campos.aptoParaMadera.trim() || null,
    descripcion: campos.descripcion.trim() || null,
    imagenUrl: campos.imagenUrl.trim() || IMAGEN_DEFECTO,
    publicado: campos.publicado,
  };
}

/** Formulario del producto (sirve para crear y para editar) */
function FormPanel({
  inicial,
  guardando,
  error,
  onGuardar,
  onCancelar,
}: {
  inicial: PanelProducto | null;
  guardando: boolean;
  error: string | null;
  onGuardar: (campos: CamposPanel) => void;
  onCancelar: () => void;
}) {
  const [campos, setCampos] = useState<CamposPanel>(() => aCampos(inicial));
  const precioNum = Number(campos.precio);
  const valido = campos.nombre.trim().length >= 3 && Number.isFinite(precioNum) && precioNum > 0;

  const campo = (clave: keyof CamposPanel) => ({
    value: campos[clave] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setCampos((prev) => ({ ...prev, [clave]: e.target.value })),
  });

  return (
    <Box sx={{ p: { xs: 2, md: 2.5 }, bgcolor: 'rgba(32, 78, 95, 0.04)', borderTop: '1px solid', borderColor: 'divider' }}>
      {/* En móvil cada campo a ancho completo: "1220 x 2440 x 94 mm" no
          entra legible en media columna de 375 px */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' }, gap: 2, mb: 2 }}>
        <Box>
          <Typography component="label" sx={etiquetaSx}>
            Nombre del producto *
          </Typography>
          <Box component="input" placeholder="Panel SIP 94 mm" sx={inputSx} {...campo('nombre')} />
        </Box>
        <Box>
          <Typography component="label" sx={etiquetaSx}>
            Precio CLP *
          </Typography>
          <Box component="input" inputMode="numeric" placeholder="61000" sx={inputNumeroSx} {...campo('precio')} />
        </Box>
        <Box>
          <Typography component="label" sx={etiquetaSx}>
            Dimensiones
          </Typography>
          <Box component="input" placeholder="1220 x 2440 x 94 mm" sx={inputSx} {...campo('dimensiones')} />
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 2 }}>
        <Box>
          <Typography component="label" sx={etiquetaSx}>
            Espesor OSB
          </Typography>
          <Box component="input" placeholder="9.5 mm" sx={inputSx} {...campo('espesorOsb')} />
        </Box>
        <Box>
          <Typography component="label" sx={etiquetaSx}>
            Núcleo EPS
          </Typography>
          <Box component="input" placeholder="75 mm" sx={inputSx} {...campo('espesorEps')} />
        </Box>
        <Box>
          <Typography component="label" sx={etiquetaSx}>
            Densidad EPS
          </Typography>
          <Box component="input" placeholder="15 kg/m³" sx={inputSx} {...campo('densidadEps')} />
        </Box>
        <Box>
          <Typography component="label" sx={etiquetaSx}>
            Apto para madera
          </Typography>
          <Box component="input" placeholder='2×3" calibrada' sx={inputSx} {...campo('aptoParaMadera')} />
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography component="label" sx={etiquetaSx}>
          Descripción corta (opcional)
        </Typography>
        <Box component="textarea" rows={2} placeholder="Placas OSB con núcleo de poliestireno expandido…" sx={{ ...inputSx, resize: 'vertical' }} {...campo('descripcion')} />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography component="label" sx={etiquetaSx}>
          Foto del producto
        </Typography>
        <SelectorImagen
          valor={campos.imagenUrl}
          fallback={IMAGEN_DEFECTO}
          onCambiar={(url) => setCampos((prev) => ({ ...prev, imagenUrl: url }))}
        />
      </Box>

      <Box sx={{ mb: 2.5 }}>
        <Toggle
          activo={campos.publicado}
          onCambiar={(v) => setCampos((prev) => ({ ...prev, publicado: v }))}
          etiqueta={campos.publicado ? 'Visible en la tienda' : 'Oculto en la tienda'}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button variant="contained" color="primary" size="small" disabled={!valido || guardando} onClick={() => onGuardar(campos)}>
          {guardando ? 'Guardando…' : inicial ? 'Guardar cambios' : 'Crear producto'}
        </Button>
        <Button variant="outlined" color="primary" size="small" onClick={onCancelar}>
          Cancelar
        </Button>
        {error && <Typography sx={{ fontSize: '0.85rem', color: '#B4472E' }}>{error}</Typography>}
      </Box>
    </Box>
  );
}

const iconoSx = {
  border: 0,
  borderRadius: `${radii.sm}px`,
  width: 30,
  height: 30,
  display: 'grid',
  placeItems: 'center',
  cursor: 'pointer',
  bgcolor: 'transparent',
  color: colors.muted,
  transition: `all 0.2s ${motionTokens.easeCss}`,
  '&:disabled': { opacity: 0.3, cursor: 'default' },
} as const;

interface TarjetaProductoProps {
  panel: PanelProducto;
  posicion: number;
  total: number;
  tonoEspesor?: number;
  editando: boolean;
  onEditar: (abrir: boolean) => void;
  onActualizado: (panel: PanelProducto) => void;
  onEliminado: () => void;
  onMover: (delta: -1 | 1) => void;
}

/**
 * Un producto: barra de acciones arriba y, debajo, la tarjeta tal cual
 * sale en /paneles (sin interacción: es una vista previa).
 */
function TarjetaProducto({
  panel,
  posicion,
  total,
  tonoEspesor,
  editando,
  onEditar,
  onActualizado,
  onEliminado,
  onMover,
}: TarjetaProductoProps) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar(campos: CamposPanel) {
    setGuardando(true);
    setError(null);
    try {
      const payload = aPayload(campos);
      const respuesta = await fetch(`/api/admin/paneles/${panel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const cuerpo = (await respuesta.json().catch(() => null)) as { error?: string } | null;
      if (!respuesta.ok) {
        setError(cuerpo?.error ?? 'No se pudo guardar.');
        return;
      }
      onActualizado({ ...panel, ...payload, precioClp: payload.precioClp });
      onEditar(false);
    } catch {
      setError('No se pudo guardar. Revisa tu conexión.');
    } finally {
      setGuardando(false);
    }
  }

  async function alternarPublicado() {
    const payload = { ...aPayload(aCampos(panel)), publicado: !panel.publicado };
    const respuesta = await fetch(`/api/admin/paneles/${panel.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (respuesta.ok) onActualizado({ ...panel, publicado: !panel.publicado });
  }

  async function eliminar() {
    if (!window.confirm(`¿Eliminar "${panel.nombre}" de la tienda? Esta acción no se puede deshacer.`)) return;
    const respuesta = await fetch(`/api/admin/paneles/${panel.id}`, { method: 'DELETE' });
    if (respuesta.ok) onEliminado();
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, height: '100%' }}>
      {/* Barra de acciones: asa + posición, flechas, visible, editar, borrar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minHeight: 34 }}>
        <Box
          title="Arrastra para cambiar el orden"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25, color: colors.muted, pr: 0.5 }}
        >
          <GripVertical size={16} />
          <Typography component="span" sx={{ fontFamily: monoFamily, fontWeight: 700, fontSize: '0.8rem', color: colors.ink }}>
            {posicion}
          </Typography>
        </Box>
        <Box component="button" type="button" onClick={() => onMover(-1)} disabled={posicion === 1} aria-label={`Mover ${panel.nombre} antes`} title="Mover antes" sx={{ ...iconoSx, '&:hover:not(:disabled)': { color: colors.teal, bgcolor: 'rgba(32, 78, 95, 0.08)' } }}>
          <ChevronLeft size={16} />
        </Box>
        <Box component="button" type="button" onClick={() => onMover(1)} disabled={posicion === total} aria-label={`Mover ${panel.nombre} después`} title="Mover después" sx={{ ...iconoSx, '&:hover:not(:disabled)': { color: colors.teal, bgcolor: 'rgba(32, 78, 95, 0.08)' } }}>
          <ChevronRight size={16} />
        </Box>

        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Toggle
            activo={panel.publicado}
            onCambiar={alternarPublicado}
            etiqueta={panel.publicado ? 'Visible' : 'Oculto'}
            ariaLabel={`${panel.publicado ? 'Ocultar' : 'Publicar'} ${panel.nombre} en la tienda`}
          />
          <Box
            component="button"
            type="button"
            onClick={() => onEditar(!editando)}
            aria-expanded={editando}
            aria-label={`Editar ${panel.nombre}`}
            title="Editar"
            sx={{
              ...iconoSx,
              ml: 0.5,
              bgcolor: editando ? colors.teal : 'transparent',
              color: editando ? colors.cream : colors.teal,
              '&:hover': { bgcolor: editando ? colors.tealDeep : 'rgba(32, 78, 95, 0.08)' },
            }}
          >
            {editando ? <X size={15} /> : <Pencil size={14} />}
          </Box>
          <Box component="button" type="button" onClick={eliminar} aria-label={`Eliminar ${panel.nombre}`} title="Eliminar" sx={{ ...iconoSx, '&:hover': { color: '#B4472E' } }}>
            <Trash2 size={15} />
          </Box>
        </Box>
      </Box>

      {/* La tarjeta real de la tienda, inerte: solo para ver cómo queda.
          Al editar no se estira a lo ancho, sigue midiendo una columna. */}
      <Box
        inert
        sx={{
          display: 'flex',
          flex: editando ? 'none' : 1,
          width: editando ? { xs: '100%', sm: 'calc(50% - 8px)' } : '100%',
          pointerEvents: 'none',
          userSelect: 'none',
          opacity: panel.publicado ? 1 : 0.45,
          filter: panel.publicado ? 'none' : 'grayscale(0.6)',
          transition: `opacity 0.25s ${motionTokens.easeCss}`,
        }}
      >
        <PanelCard panel={panel} cantidad={0} onCambiar={() => {}} onVerCaracteristicas={() => {}} tonoEspesor={tonoEspesor} />
      </Box>

      <AnimatePresence initial={false}>
        {editando && (
          <motion.div
            key="form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{ overflow: 'hidden' }}
          >
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: `${radii.md}px`, overflow: 'hidden', bgcolor: 'background.paper' }}>
              <FormPanel
                inicial={panel}
                guardando={guardando}
                error={error}
                onGuardar={guardar}
                onCancelar={() => onEditar(false)}
              />
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

export default function GestorPaneles({ paneles }: { paneles: PanelProducto[] }) {
  const [lista, setLista] = useState<PanelProducto[]>(paneles);
  const [creando, setCreando] = useState(false);
  const [guardandoNuevo, setGuardandoNuevo] = useState(false);
  const [errorNuevo, setErrorNuevo] = useState<string | null>(null);
  const [creadoOk, setCreadoOk] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [arrastrando, setArrastrando] = useState<number | null>(null);
  const [destino, setDestino] = useState<number | null>(null);
  const [estadoOrden, setEstadoOrden] = useState<'idle' | 'guardando' | 'ok' | 'error'>('idle');
  const tonos = tonosPorEspesor(lista);
  const visibles = lista.filter((p) => p.publicado).length;

  /**
   * Mueve un producto y guarda el orden al tiro: la posición aquí es la
   * posición en /paneles (1 = arriba a la izquierda). Sin botón "guardar"
   * porque arrastrar y después tener que guardar se olvida.
   */
  async function reordenar(desde: number, hasta: number) {
    if (desde === hasta || hasta < 0 || hasta >= lista.length) return;
    const copia = [...lista];
    const [movido] = copia.splice(desde, 1);
    copia.splice(hasta, 0, movido);
    setLista(copia);
    setEstadoOrden('guardando');
    try {
      const respuesta = await fetch('/api/admin/paneles/orden', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: copia.map((p) => p.id) }),
      });
      setEstadoOrden(respuesta.ok ? 'ok' : 'error');
      if (respuesta.ok) setTimeout(() => setEstadoOrden('idle'), 2000);
    } catch {
      setEstadoOrden('error');
    }
  }

  async function crear(campos: CamposPanel) {
    setGuardandoNuevo(true);
    setErrorNuevo(null);
    try {
      const payload = aPayload(campos);
      const respuesta = await fetch('/api/admin/paneles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const cuerpo = (await respuesta.json().catch(() => null)) as { id?: string; slug?: string; orden?: number; error?: string } | null;
      if (!respuesta.ok || !cuerpo?.id) {
        setErrorNuevo(cuerpo?.error ?? 'No se pudo crear el producto.');
        return;
      }
      setLista((prev) => [
        ...prev,
        { id: cuerpo.id!, slug: cuerpo.slug ?? '', orden: cuerpo.orden ?? prev.length + 1, ...payload },
      ]);
      setCreando(false);
      setCreadoOk(true);
      setTimeout(() => setCreadoOk(false), 3500);
    } catch {
      setErrorNuevo('No se pudo crear. Revisa tu conexión.');
    } finally {
      setGuardandoNuevo(false);
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2.5 }}>
        <Button variant="contained" color="primary" startIcon={<Plus size={16} />} onClick={() => setCreando((v) => !v)}>
          Agregar un panel
        </Button>
        {creadoOk && (
          <Typography sx={{ fontSize: '0.9rem', color: colors.teal, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <Check size={16} strokeWidth={2.5} /> Producto creado y visible en la tienda
          </Typography>
        )}
        <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', ml: { md: 'auto' } }}>
          {estadoOrden === 'guardando' && 'Guardando orden… · '}
          {estadoOrden === 'ok' && <Box component="span" sx={{ color: colors.teal, fontWeight: 600 }}>Orden guardado · </Box>}
          {estadoOrden === 'error' && <Box component="span" sx={{ color: '#B4472E', fontWeight: 600 }}>No se pudo guardar el orden · </Box>}
          {lista.length} productos · {visibles} visibles
        </Typography>
      </Box>

      <AnimatePresence initial={false}>
        {creando && (
          <motion.div
            key="nuevo"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{ overflow: 'hidden' }}
          >
            <Box sx={{ mb: 2.5, border: '1px dashed', borderColor: colors.teal, borderRadius: `${radii.md}px`, overflow: 'hidden' }}>
              <Box sx={{ px: 2.5, pt: 2 }}>
                <Typography sx={{ fontWeight: 700 }}>Nuevo producto</Typography>
              </Box>
              <FormPanel
                inicial={null}
                guardando={guardandoNuevo}
                error={errorNuevo}
                onGuardar={crear}
                onCancelar={() => setCreando(false)}
              />
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Misma estructura que /paneles: grilla de 2 columnas + una columna
          lateral del ancho del carrito, así cada tarjeta mide lo mismo que
          en la tienda y el orden se decide viendo el resultado real. */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 380px' }, gap: { xs: 3, lg: 5 }, alignItems: 'start' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            columnGap: { xs: 1.5, md: 2 },
            rowGap: { xs: 2.5, md: 3 },
            alignItems: 'stretch',
          }}
        >
          {lista.map((panel, i) => {
            const editando = editandoId === panel.id;
            return (
              <Box
                key={panel.id}
                // Mientras se edita no se arrastra: arrastrar sobre inputs
                // selecciona texto y mueve la tarjeta sin querer
                draggable={!editando}
                onDragStart={(e: React.DragEvent) => {
                  e.dataTransfer.effectAllowed = 'move';
                  setArrastrando(i);
                }}
                onDragEnd={() => {
                  setArrastrando(null);
                  setDestino(null);
                }}
                onDragOver={(e: React.DragEvent) => {
                  if (arrastrando == null) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (destino !== i) setDestino(i);
                }}
                onDrop={(e: React.DragEvent) => {
                  if (arrastrando == null) return;
                  e.preventDefault();
                  void reordenar(arrastrando, i);
                  setArrastrando(null);
                  setDestino(null);
                }}
                sx={{
                  gridColumn: editando ? '1 / -1' : 'auto',
                  cursor: editando ? 'default' : 'grab',
                  opacity: arrastrando === i ? 0.4 : 1,
                  outline: destino === i && arrastrando !== i ? `2px dashed ${colors.teal}` : 'none',
                  outlineOffset: 4,
                  borderRadius: `${radii.md}px`,
                  transition: `opacity 0.15s ${motionTokens.easeCss}`,
                  '&:active': { cursor: editando ? 'default' : 'grabbing' },
                }}
              >
                <TarjetaProducto
                  panel={panel}
                  posicion={i + 1}
                  total={lista.length}
                  tonoEspesor={tonos.get(mmOsb(panel) ?? -1)}
                  editando={editando}
                  onEditar={(abrir) => setEditandoId(abrir ? panel.id : null)}
                  onActualizado={(actualizado) => setLista((prev) => prev.map((p) => (p.id === actualizado.id ? actualizado : p)))}
                  onEliminado={() => setLista((prev) => prev.filter((p) => p.id !== panel.id))}
                  onMover={(delta) => void reordenar(i, i + delta)}
                />
              </Box>
            );
          })}
          {lista.length === 0 && (
            <Typography sx={{ color: 'text.secondary', py: 3 }}>
              Aún no hay productos. Crea el primero con “Agregar un panel”.
            </Typography>
          )}
        </Box>

        {/* Columna del carrito en la tienda: aquí, la guía de uso */}
        <Box
          sx={{
            position: { lg: 'sticky' },
            top: { lg: 112 },
            p: 3,
            borderRadius: `${radii.lg}px`,
            bgcolor: colors.tealNight,
            color: colors.cream,
          }}
        >
          <Typography sx={{ fontFamily: monoFamily, fontSize: '0.7rem', letterSpacing: '0.2em', color: colors.tanLight, mb: 1.5 }}>
            ASÍ SE VE EN /PANELES
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', mb: 1.5 }}>Ordena viendo la tienda</Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.25, display: 'flex', flexDirection: 'column', gap: 1, fontSize: '0.9rem', lineHeight: 1.5, color: 'rgba(246, 241, 234, 0.78)' }}>
            <li>Arrastra una tarjeta a otra posición, o usa las flechas ‹ ›. Se guarda solo.</li>
            <li>El 1 va arriba a la izquierda; se lee de izquierda a derecha.</li>
            <li>Los productos ocultos se ven atenuados y no salen en la tienda.</li>
            <li>La etiqueta de color muestra el espesor del OSB que escribes en “Espesor OSB”.</li>
          </Box>
          <Box
            component="a"
            href="/paneles"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ display: 'inline-block', mt: 2.5, color: colors.tanLight, fontWeight: 700, fontSize: '0.9rem', textDecoration: 'underline', textUnderlineOffset: '3px', '&:hover': { color: colors.cream } }}
          >
            Abrir la tienda →
          </Box>
        </Box>
      </Box>

      {guardandoNuevo && (
        <Box aria-hidden sx={{ position: 'fixed', bottom: 20, right: 20, color: colors.teal, animation: 'giro 1s linear infinite', '@keyframes giro': { to: { transform: 'rotate(360deg)' } } }}>
          <Loader2 size={20} />
        </Box>
      )}
    </Box>
  );
}

'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import { formatCLP } from '@/lib/format';
import { EASE } from '@/lib/motion';
import type { PanelProducto } from '@/features/paneles/panel.types';
import { colors, motionTokens, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

import SelectorImagen from './SelectorImagen';
import { etiquetaSx, inputNumeroSx, inputSx } from './ui';

/**
 * Gestor de productos de la tienda /paneles — pensado para alguien NO
 * técnico: una fila por producto, "Editar" abre el formulario ahí mismo,
 * el ojo publica/oculta al tiro y "Agregar un panel" usa el mismo
 * formulario. Todo se guarda directo en la base de datos.
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
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '2fr 1fr 1fr' }, gap: 2, mb: 2 }}>
        <Box sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}>
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

/** Una fila de producto con acciones y edición en línea */
function FilaProducto({
  panel,
  onActualizado,
  onEliminado,
}: {
  panel: PanelProducto;
  onActualizado: (panel: PanelProducto) => void;
  onEliminado: () => void;
}) {
  const [editando, setEditando] = useState(false);
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
      setEditando(false);
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
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: `${radii.md}px`, bgcolor: 'background.paper', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 }, p: { xs: 1.5, md: 2 } }}>
        <Box sx={{ width: 52, height: 52, borderRadius: `${radii.sm}px`, bgcolor: '#FBF9F5', border: '1px solid', borderColor: 'divider', overflow: 'hidden', flexShrink: 0 }}>
          <Box
            component="img"
            src={panel.imagenUrl || IMAGEN_DEFECTO}
            alt=""
            sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.5 }}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.98rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {panel.nombre}
          </Typography>
          <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
            {panel.dimensiones ?? 'Sin dimensiones'}
          </Typography>
        </Box>

        <Typography sx={{ fontFamily: monoFamily, fontWeight: 700, fontSize: '0.98rem', whiteSpace: 'nowrap' }}>
          {formatCLP(panel.precioClp)}
        </Typography>

        {/* Interruptor real: se prende y se apaga sin abrir el formulario */}
        <Toggle
          activo={panel.publicado}
          onCambiar={alternarPublicado}
          etiqueta={panel.publicado ? 'Visible' : 'Oculto'}
          ariaLabel={`${panel.publicado ? 'Ocultar' : 'Publicar'} ${panel.nombre} en la tienda`}
        />

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Box
            component="button"
            type="button"
            onClick={() => setEditando((v) => !v)}
            aria-expanded={editando}
            aria-label={`Editar ${panel.nombre}`}
            sx={{
              border: 0,
              borderRadius: `${radii.sm}px`,
              width: 34,
              height: 34,
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              bgcolor: editando ? colors.teal : 'transparent',
              color: editando ? colors.cream : colors.teal,
              transition: `all 0.2s ${motionTokens.easeCss}`,
              '&:hover': { bgcolor: editando ? colors.tealDeep : 'rgba(32, 78, 95, 0.08)' },
            }}
          >
            {editando ? <X size={16} /> : <Pencil size={15} />}
          </Box>
          <Box
            component="button"
            type="button"
            onClick={eliminar}
            aria-label={`Eliminar ${panel.nombre}`}
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
            <FormPanel
              inicial={panel}
              guardando={guardando}
              error={error}
              onGuardar={guardar}
              onCancelar={() => setEditando(false)}
            />
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
        <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', ml: 'auto' }}>
          {lista.length} productos · los cambios se ven al instante en /paneles
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

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {lista.map((panel) => (
          <FilaProducto
            key={panel.id}
            panel={panel}
            onActualizado={(actualizado) => setLista((prev) => prev.map((p) => (p.id === actualizado.id ? actualizado : p)))}
            onEliminado={() => setLista((prev) => prev.filter((p) => p.id !== panel.id))}
          />
        ))}
        {lista.length === 0 && (
          <Typography sx={{ color: 'text.secondary', py: 3 }}>
            Aún no hay productos. Crea el primero con “Agregar un panel”.
          </Typography>
        )}
      </Box>

      {guardandoNuevo && (
        <Box aria-hidden sx={{ position: 'fixed', bottom: 20, right: 20, color: colors.teal, animation: 'giro 1s linear infinite', '@keyframes giro': { to: { transform: 'rotate(360deg)' } } }}>
          <Loader2 size={20} />
        </Box>
      )}
    </Box>
  );
}

'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, GripVertical, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import type { FaqAdmin } from '@/features/faqs/faqs.db';
import { EASE } from '@/lib/motion';
import { colors, motionTokens, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

import { botonIconoSx, etiquetaSx, inputSx } from './ui';

/**
 * Gestor de /preguntas-frecuentes — pensado para alguien NO técnico.
 * Una fila por pregunta, en el mismo orden que en el sitio. "Editar"
 * abre el formulario ahí mismo; el interruptor la muestra u oculta al
 * tiro; soltar una pregunta sobre otra las intercambia (el resto no se
 * mueve) y el número de cada fila permite elegir su posición.
 */

interface PuntoEditable {
  /** Clave local para React: los puntos se agregan y quitan en cualquier orden */
  clave: number;
  titulo: string;
  texto: string;
}

interface CamposFaq {
  pregunta: string;
  respuesta: string;
  puntos: PuntoEditable[];
  publicado: boolean;
}

let siguienteClave = 1;
const nuevaClave = () => siguienteClave++;

function aCampos(faq: FaqAdmin | null): CamposFaq {
  return {
    pregunta: faq?.pregunta ?? '',
    respuesta: faq?.respuesta ?? '',
    puntos: (faq?.puntos ?? []).map((p) => ({ clave: nuevaClave(), titulo: p.titulo, texto: p.texto })),
    publicado: faq?.publicado ?? true,
  };
}

function aPayload(c: CamposFaq) {
  return {
    pregunta: c.pregunta.trim(),
    respuesta: c.respuesta.trim() || null,
    // Un punto a medio llenar se descarta en vez de bloquear el guardado
    puntos: c.puntos
      .map((p) => ({ titulo: p.titulo.trim(), texto: p.texto.trim() }))
      .filter((p) => p.titulo && p.texto),
    publicado: c.publicado,
  };
}

/** Del payload guardado a la forma que usa la lista */
function aFaq(base: { id: string; orden: number }, payload: ReturnType<typeof aPayload>): FaqAdmin {
  return {
    id: base.id,
    orden: base.orden,
    pregunta: payload.pregunta,
    respuesta: payload.respuesta ?? undefined,
    puntos: payload.puntos.length > 0 ? payload.puntos : undefined,
    publicado: payload.publicado,
  };
}

/** Formulario de la pregunta (sirve para crear y para editar) */
function FormFaq({
  inicial,
  guardando,
  error,
  onGuardar,
  onCancelar,
}: {
  inicial: FaqAdmin | null;
  guardando: boolean;
  error: string | null;
  onGuardar: (campos: CamposFaq) => void;
  onCancelar: () => void;
}) {
  const [campos, setCampos] = useState<CamposFaq>(() => aCampos(inicial));
  const payload = aPayload(campos);
  const valido = payload.pregunta.length >= 5 && (payload.respuesta != null || payload.puntos.length > 0);

  function cambiarPunto(clave: number, cambio: Partial<PuntoEditable>) {
    setCampos((prev) => ({ ...prev, puntos: prev.puntos.map((p) => (p.clave === clave ? { ...p, ...cambio } : p)) }));
  }

  return (
    <Box sx={{ p: { xs: 2, md: 2.5 }, bgcolor: 'rgba(32, 78, 95, 0.04)', borderTop: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ mb: 2 }}>
        <Typography component="label" sx={etiquetaSx}>
          Pregunta
        </Typography>
        <Box
          component="input"
          value={campos.pregunta}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCampos((prev) => ({ ...prev, pregunta: e.target.value }))}
          placeholder="¿Cuánto tiempo se tarda en construir con paneles SIP?"
          maxLength={200}
          sx={inputSx}
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography component="label" sx={etiquetaSx}>
          Respuesta
        </Typography>
        <Box
          component="textarea"
          rows={4}
          value={campos.respuesta}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCampos((prev) => ({ ...prev, respuesta: e.target.value }))}
          placeholder="Depende de la envergadura del proyecto, pero…"
          maxLength={1500}
          sx={{ ...inputSx, resize: 'vertical', lineHeight: 1.5 }}
        />
      </Box>

      {/* Puntos destacados: opcionales, para respuestas tipo lista */}
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={etiquetaSx}>Puntos destacados (opcional)</Typography>
        <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mb: 1.25 }}>
          Para respuestas en forma de lista, como “Eficiencia energética: gran aislamiento…”. Se muestran bajo la respuesta,
          o solos si la dejas vacía.
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {campos.puntos.map((p, i) => (
            <Box
              key={p.clave}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr auto', md: 'minmax(0, 1fr) minmax(0, 2fr) auto' },
                gap: 1,
                alignItems: 'start',
              }}
            >
              <Box
                component="input"
                value={p.titulo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => cambiarPunto(p.clave, { titulo: e.target.value })}
                placeholder="Título del punto"
                aria-label={`Título del punto ${i + 1}`}
                maxLength={80}
                sx={{ ...inputSx, fontWeight: 700 }}
              />
              <Box
                component="input"
                value={p.texto}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => cambiarPunto(p.clave, { texto: e.target.value })}
                placeholder="Texto del punto"
                aria-label={`Texto del punto ${i + 1}`}
                maxLength={300}
                sx={{ ...inputSx, gridColumn: { xs: '1 / 2', md: 'auto' }, gridRow: { xs: 2, md: 'auto' } }}
              />
              <Box
                component="button"
                type="button"
                onClick={() => setCampos((prev) => ({ ...prev, puntos: prev.puntos.filter((x) => x.clave !== p.clave) }))}
                aria-label={`Quitar el punto ${i + 1}`}
                title="Quitar punto"
                sx={{ ...botonIconoSx, gridColumn: { xs: 2, md: 'auto' }, gridRow: { xs: '1 / 3', md: 'auto' }, '&:hover': { color: '#B4472E' } }}
              >
                <X size={16} />
              </Box>
            </Box>
          ))}
        </Box>
        {campos.puntos.length < 12 && (
          <Box
            component="button"
            type="button"
            onClick={() => setCampos((prev) => ({ ...prev, puntos: [...prev.puntos, { clave: nuevaClave(), titulo: '', texto: '' }] }))}
            sx={{
              mt: 1.25,
              border: '1px dashed',
              borderColor: colors.teal,
              borderRadius: `${radii.sm}px`,
              bgcolor: 'transparent',
              color: colors.teal,
              fontFamily: 'inherit',
              fontSize: '0.85rem',
              fontWeight: 600,
              px: 1.5,
              py: 0.75,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              '&:hover': { bgcolor: 'rgba(32, 78, 95, 0.06)' },
            }}
          >
            <Plus size={15} /> Agregar punto
          </Box>
        )}
      </Box>

      <Box sx={{ mb: 2.5 }}>
        <Toggle
          activo={campos.publicado}
          onCambiar={(v) => setCampos((prev) => ({ ...prev, publicado: v }))}
          etiqueta={campos.publicado ? 'Visible en el sitio' : 'Oculta en el sitio'}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button variant="contained" color="primary" size="small" disabled={!valido || guardando} onClick={() => onGuardar(campos)}>
          {guardando ? 'Guardando…' : inicial ? 'Guardar cambios' : 'Crear pregunta'}
        </Button>
        <Button variant="outlined" color="primary" size="small" onClick={onCancelar}>
          Cancelar
        </Button>
        {!valido && !error && (
          <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
            Escribe la pregunta y una respuesta (o al menos un punto completo).
          </Typography>
        )}
        {error && <Typography sx={{ fontSize: '0.85rem', color: '#B4472E' }}>{error}</Typography>}
      </Box>
    </Box>
  );
}

interface FilaFaqProps {
  faq: FaqAdmin;
  posicion: number;
  total: number;
  editando: boolean;
  onEditar: (abrir: boolean) => void;
  onActualizado: (faq: FaqAdmin) => void;
  onEliminado: () => void;
  onIrA: (posicion: number) => void;
}

/** Resumen de una línea para la fila cerrada */
function resumen(faq: FaqAdmin): string {
  if (faq.respuesta) return faq.respuesta;
  const n = faq.puntos?.length ?? 0;
  return `${n} ${n === 1 ? 'punto' : 'puntos'}: ${faq.puntos?.map((p) => p.titulo).join(', ')}`;
}

function FilaFaq({ faq, posicion, total, editando, onEditar, onActualizado, onEliminado, onIrA }: FilaFaqProps) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(payload: ReturnType<typeof aPayload>) {
    return fetch(`/api/admin/faqs/${faq.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  async function guardar(campos: CamposFaq) {
    setGuardando(true);
    setError(null);
    try {
      const payload = aPayload(campos);
      const respuesta = await enviar(payload);
      const cuerpo = (await respuesta.json().catch(() => null)) as { error?: string } | null;
      if (!respuesta.ok) {
        setError(cuerpo?.error ?? 'No se pudo guardar.');
        return;
      }
      onActualizado(aFaq(faq, payload));
      onEditar(false);
    } catch {
      setError('No se pudo guardar. Revisa tu conexión.');
    } finally {
      setGuardando(false);
    }
  }

  async function alternarPublicado() {
    const payload = { ...aPayload(aCampos(faq)), publicado: !faq.publicado };
    const respuesta = await enviar(payload);
    if (respuesta.ok) onActualizado({ ...faq, publicado: !faq.publicado });
  }

  async function eliminar() {
    if (!window.confirm(`¿Eliminar la pregunta "${faq.pregunta}"? Esta acción no se puede deshacer.`)) return;
    const respuesta = await fetch(`/api/admin/faqs/${faq.id}`, { method: 'DELETE' });
    if (respuesta.ok) onEliminado();
  }

  return (
    <Box sx={{ border: '1px solid', borderColor: editando ? colors.teal : 'divider', borderRadius: `${radii.md}px`, bgcolor: 'background.paper', overflow: 'hidden' }}>
      <Box
        sx={{
          display: 'grid',
          alignItems: 'center',
          gap: { xs: 1.25, md: 2 },
          p: { xs: 1.75, md: 2 },
          gridTemplateColumns: { xs: 'auto minmax(0, 1fr) auto', md: 'auto minmax(0, 1fr) auto auto' },
          gridTemplateAreas: {
            xs: `"orden texto texto" "orden estado acciones"`,
            md: `"orden texto estado acciones"`,
          },
          opacity: faq.publicado ? 1 : 0.6,
        }}
      >
        <Box sx={{ gridArea: 'orden', display: 'flex', alignItems: 'center', gap: 0.75, alignSelf: { xs: 'start', md: 'center' } }}>
          <Box title="Arrastra la pregunta sobre otra para intercambiarlas" sx={{ display: 'inline-flex', color: colors.muted, cursor: 'grab' }}>
            <GripVertical size={18} />
          </Box>
          <Box
            component="select"
            value={posicion}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onIrA(Number(e.target.value))}
            aria-label={`Posición de la pregunta "${faq.pregunta}"`}
            title="Posición en el sitio"
            sx={{
              fontFamily: monoFamily,
              fontWeight: 700,
              fontSize: '0.85rem',
              color: colors.ink,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: `${radii.sm}px`,
              pl: 1,
              pr: 0.5,
              py: 0.4,
              cursor: 'pointer',
              '&:hover, &:focus': { borderColor: colors.teal, outline: 'none' },
            }}
          >
            {Array.from({ length: total }, (_, k) => (
              <option key={k + 1} value={k + 1}>
                {String(k + 1).padStart(2, '0')}
              </option>
            ))}
          </Box>
        </Box>

        <Box sx={{ gridArea: 'texto', minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.98rem', lineHeight: 1.35 }}>{faq.pregunta}</Typography>
          <Typography
            sx={{
              fontSize: '0.84rem',
              color: 'text.secondary',
              mt: 0.25,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {resumen(faq)}
          </Typography>
        </Box>

        <Box sx={{ gridArea: 'estado' }}>
          <Toggle
            activo={faq.publicado}
            onCambiar={alternarPublicado}
            etiqueta={faq.publicado ? 'Visible' : 'Oculta'}
            ariaLabel={`${faq.publicado ? 'Ocultar' : 'Mostrar'} la pregunta "${faq.pregunta}"`}
          />
        </Box>

        <Box sx={{ gridArea: 'acciones', display: 'flex', gap: 0.5, justifySelf: 'end' }}>
          <Box
            component="button"
            type="button"
            onClick={() => onEditar(!editando)}
            aria-expanded={editando}
            aria-label={`Editar la pregunta "${faq.pregunta}"`}
            title="Editar"
            sx={{
              ...botonIconoSx,
              bgcolor: editando ? colors.teal : 'transparent',
              color: editando ? colors.cream : colors.teal,
              '&:hover': { bgcolor: editando ? colors.tealDeep : 'rgba(32, 78, 95, 0.08)' },
            }}
          >
            {editando ? <X size={16} /> : <Pencil size={15} />}
          </Box>
          <Box
            component="button"
            type="button"
            onClick={eliminar}
            aria-label={`Eliminar la pregunta "${faq.pregunta}"`}
            title="Eliminar"
            sx={{ ...botonIconoSx, '&:hover': { color: '#B4472E' } }}
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
            <FormFaq inicial={faq} guardando={guardando} error={error} onGuardar={guardar} onCancelar={() => onEditar(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

export default function GestorFaqs({ faqs }: { faqs: FaqAdmin[] }) {
  const [lista, setLista] = useState<FaqAdmin[]>(faqs);
  const [creando, setCreando] = useState(false);
  const [guardandoNueva, setGuardandoNueva] = useState(false);
  const [errorNueva, setErrorNueva] = useState<string | null>(null);
  const [creadaOk, setCreadaOk] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [arrastrando, setArrastrando] = useState<number | null>(null);
  const [destino, setDestino] = useState<number | null>(null);
  const [estadoOrden, setEstadoOrden] = useState<'idle' | 'guardando' | 'ok' | 'error'>('idle');
  const visibles = lista.filter((f) => f.publicado).length;

  /**
   * Intercambia dos preguntas y guarda el orden al tiro (igual que en
   * modelos y paneles): llevar la 6 a la 1 deja la 1 en la 6.
   */
  async function intercambiar(a: number, b: number) {
    if (a === b || a < 0 || b < 0 || a >= lista.length || b >= lista.length) return;
    const copia = [...lista];
    [copia[a], copia[b]] = [copia[b], copia[a]];
    setLista(copia);
    setEstadoOrden('guardando');
    try {
      const respuesta = await fetch('/api/admin/faqs/orden', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: copia.map((f) => f.id) }),
      });
      setEstadoOrden(respuesta.ok ? 'ok' : 'error');
      if (respuesta.ok) setTimeout(() => setEstadoOrden('idle'), 2000);
    } catch {
      setEstadoOrden('error');
    }
  }

  async function crear(campos: CamposFaq) {
    setGuardandoNueva(true);
    setErrorNueva(null);
    try {
      const payload = aPayload(campos);
      const respuesta = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const cuerpo = (await respuesta.json().catch(() => null)) as { id?: string; orden?: number; error?: string } | null;
      if (!respuesta.ok || !cuerpo?.id) {
        setErrorNueva(cuerpo?.error ?? 'No se pudo crear la pregunta.');
        return;
      }
      setLista((prev) => [...prev, aFaq({ id: cuerpo.id!, orden: cuerpo.orden ?? prev.length + 1 }, payload)]);
      setCreando(false);
      setCreadaOk(true);
      setTimeout(() => setCreadaOk(false), 3500);
    } catch {
      setErrorNueva('No se pudo crear. Revisa tu conexión.');
    } finally {
      setGuardandoNueva(false);
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2.5 }}>
        <Button variant="contained" color="primary" startIcon={<Plus size={16} />} onClick={() => setCreando((v) => !v)}>
          Agregar una pregunta
        </Button>
        {creadaOk && (
          <Typography sx={{ fontSize: '0.9rem', color: colors.teal, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <Check size={16} strokeWidth={2.5} /> Pregunta creada y visible en el sitio
          </Typography>
        )}
        <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', ml: { md: 'auto' } }}>
          {estadoOrden === 'guardando' && 'Guardando orden… · '}
          {estadoOrden === 'ok' && <Box component="span" sx={{ color: colors.teal, fontWeight: 600 }}>Orden guardado · </Box>}
          {estadoOrden === 'error' && <Box component="span" sx={{ color: '#B4472E', fontWeight: 600 }}>No se pudo guardar el orden · </Box>}
          {lista.length} preguntas · {visibles} visibles
        </Typography>
      </Box>
      <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', mb: 2 }}>
        Este es el orden en /preguntas-frecuentes. Suelta una pregunta sobre otra para intercambiarlas, o elige su número.
        Las ocultas no se borran: puedes volver a mostrarlas cuando quieras.
      </Typography>

      <AnimatePresence initial={false}>
        {creando && (
          <motion.div
            key="nueva"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{ overflow: 'hidden' }}
          >
            <Box sx={{ mb: 2.5, border: '1px dashed', borderColor: colors.teal, borderRadius: `${radii.md}px`, overflow: 'hidden' }}>
              <Box sx={{ px: 2.5, pt: 2 }}>
                <Typography sx={{ fontWeight: 700 }}>Nueva pregunta</Typography>
              </Box>
              <FormFaq inicial={null} guardando={guardandoNueva} error={errorNueva} onGuardar={crear} onCancelar={() => setCreando(false)} />
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {lista.map((faq, i) => {
          const editando = editandoId === faq.id;
          return (
            <Box
              key={faq.id}
              // Mientras se edita no se arrastra: arrastrar sobre los campos
              // selecciona texto y mueve la fila sin querer
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
                void intercambiar(arrastrando, i);
                setArrastrando(null);
                setDestino(null);
              }}
              sx={{
                cursor: editando ? 'default' : 'grab',
                opacity: arrastrando === i ? 0.4 : 1,
                outline: destino === i && arrastrando !== i ? `3px solid ${colors.tan}` : 'none',
                outlineOffset: 3,
                borderRadius: `${radii.md}px`,
                transition: `opacity 0.15s ${motionTokens.easeCss}`,
                '&:active': { cursor: editando ? 'default' : 'grabbing' },
              }}
            >
              <FilaFaq
                faq={faq}
                posicion={i + 1}
                total={lista.length}
                editando={editando}
                onEditar={(abrir) => setEditandoId(abrir ? faq.id : null)}
                onActualizado={(actualizada) => setLista((prev) => prev.map((f) => (f.id === actualizada.id ? actualizada : f)))}
                onEliminado={() => setLista((prev) => prev.filter((f) => f.id !== faq.id))}
                onIrA={(posicion) => void intercambiar(i, posicion - 1)}
              />
            </Box>
          );
        })}
        {lista.length === 0 && (
          <Typography sx={{ color: 'text.secondary', py: 3 }}>
            Aún no hay preguntas. Crea la primera con “Agregar una pregunta”.
          </Typography>
        )}
      </Box>
    </Box>
  );
}

'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import type { Modelo } from '@/features/modelos/modelo.types';
import { formatCLP } from '@/lib/format';
import { EASE } from '@/lib/motion';
import { colors, motionTokens, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

import { etiquetaSx, inputNumeroSx, inputSx } from './ui';

/** Datos mínimos para dar de alta un modelo; el resto se completa en el editor */
interface CamposNuevo {
  nombre: string;
  superficie: string;
  habitaciones: string;
  banos: string;
  precio: string;
}

const VACIO: CamposNuevo = { nombre: '', superficie: '', habitaciones: '3', banos: '2', precio: '' };

/** Alta rápida: solo lo indispensable, nace como borrador */
function FormNuevoModelo({ onCreado, onCancelar }: { onCreado: (id: string) => void; onCancelar: () => void }) {
  const [campos, setCampos] = useState<CamposNuevo>(VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const n = {
    superficie: Number(campos.superficie),
    habitaciones: Number(campos.habitaciones),
    banos: Number(campos.banos),
    precio: Number(campos.precio),
  };
  const valido =
    campos.nombre.trim().length >= 2 &&
    Number.isInteger(n.superficie) && n.superficie > 0 &&
    Number.isInteger(n.precio) && n.precio > 0;

  const campo = (clave: keyof CamposNuevo) => ({
    value: campos[clave],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCampos((p) => ({ ...p, [clave]: e.target.value })),
  });

  async function crear() {
    if (!valido) return;
    setGuardando(true);
    setError(null);
    try {
      const respuesta = await fetch('/api/admin/modelos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: campos.nombre.trim(),
          superficieM2: n.superficie,
          habitaciones: Number.isInteger(n.habitaciones) ? n.habitaciones : 0,
          banos: Number.isInteger(n.banos) ? n.banos : 0,
          precioDesdeCLP: n.precio,
          resumen: '',
          descripcion: '',
          destacado: false,
          publicado: false, // nace como borrador: se completa y luego se publica
        }),
      });
      const cuerpo = (await respuesta.json().catch(() => null)) as { id?: string; error?: string } | null;
      if (!respuesta.ok || !cuerpo?.id) {
        setError(cuerpo?.error ?? 'No se pudo crear el modelo.');
        return;
      }
      onCreado(cuerpo.id);
    } catch {
      setError('No se pudo crear. Revisa tu conexión.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 2.5 }, mb: 2.5, borderRadius: `${radii.md}px`, border: '1px dashed', borderColor: colors.teal, bgcolor: 'rgba(32, 78, 95, 0.04)' }}>
      <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Nuevo modelo</Typography>
      <Typography sx={{ fontSize: '0.86rem', color: 'text.secondary', mb: 2 }}>
        Con esto basta para empezar. Se crea como borrador y luego completas fotos, características y
        kits en su editor.
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr 1.2fr' }, gap: 2, mb: 2 }}>
        <Box>
          <Typography component="label" sx={etiquetaSx}>
            Nombre *
          </Typography>
          <Box component="input" placeholder="Canelo" sx={inputSx} {...campo('nombre')} />
        </Box>
        <Box>
          <Typography component="label" sx={etiquetaSx}>
            Superficie m² *
          </Typography>
          <Box component="input" inputMode="numeric" placeholder="90" sx={inputNumeroSx} {...campo('superficie')} />
        </Box>
        <Box>
          <Typography component="label" sx={etiquetaSx}>
            Dormitorios
          </Typography>
          <Box component="input" inputMode="numeric" sx={inputNumeroSx} {...campo('habitaciones')} />
        </Box>
        <Box>
          <Typography component="label" sx={etiquetaSx}>
            Baños
          </Typography>
          <Box component="input" inputMode="numeric" sx={inputNumeroSx} {...campo('banos')} />
        </Box>
        <Box>
          <Typography component="label" sx={etiquetaSx}>
            Precio kit CLP *
          </Typography>
          <Box component="input" inputMode="numeric" placeholder="14000000" sx={inputNumeroSx} {...campo('precio')} />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button variant="contained" color="primary" size="small" onClick={crear} disabled={!valido || guardando}>
          {guardando ? 'Creando…' : 'Crear y completar'}
        </Button>
        <Button variant="outlined" color="primary" size="small" onClick={onCancelar}>
          Cancelar
        </Button>
        {error && <Typography sx={{ fontSize: '0.85rem', color: '#B4472E' }}>{error}</Typography>}
      </Box>
    </Box>
  );
}

/** Fila de modelo con su estado y acciones */
function FilaModelo({ modelo, onCambiado, onEliminado }: { modelo: Modelo; onCambiado: (m: Modelo) => void; onEliminado: () => void }) {
  const [ocupado, setOcupado] = useState(false);

  /** Publicar/ocultar sin abrir el editor: manda la ficha completa */
  async function alternarPublicado(nuevo: boolean) {
    setOcupado(true);
    try {
      const respuesta = await fetch(`/api/admin/modelos/${modelo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: modelo.nombre,
          superficieM2: modelo.superficieM2,
          habitaciones: modelo.habitaciones,
          banos: modelo.banos,
          precioDesdeCLP: modelo.precioDesdeCLP,
          resumen: modelo.resumen,
          descripcion: modelo.descripcion,
          destacado: modelo.destacado,
          publicado: nuevo,
        }),
      });
      if (respuesta.ok) onCambiado({ ...modelo, publicado: nuevo });
    } finally {
      setOcupado(false);
    }
  }

  async function eliminar() {
    if (!window.confirm(`¿Eliminar el modelo "${modelo.nombre}" con sus fotos, características y kits? Esta acción no se puede deshacer.`)) return;
    setOcupado(true);
    try {
      const respuesta = await fetch(`/api/admin/modelos/${modelo.id}`, { method: 'DELETE' });
      if (respuesta.ok) onEliminado();
    } finally {
      setOcupado(false);
    }
  }

  const iconoSx = {
    width: 34,
    height: 34,
    border: 0,
    borderRadius: `${radii.sm}px`,
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    bgcolor: 'transparent',
    color: colors.muted,
    transition: `all 0.2s ${motionTokens.easeCss}`,
  } as const;

  return (
    <Box
      sx={{
        display: 'grid',
        alignItems: 'center',
        gap: { xs: 1.25, md: 2 },
        p: { xs: 1.75, md: 2 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: `${radii.md}px`,
        bgcolor: 'background.paper',
        opacity: ocupado ? 0.6 : 1,
        gridTemplateColumns: { xs: 'auto minmax(0, 1fr) auto', md: 'auto minmax(0, 1fr) auto auto auto' },
        gridTemplateAreas: {
          xs: `"foto datos datos" "precio estado acciones"`,
          md: `"foto datos precio estado acciones"`,
        },
      }}
    >
      <Box sx={{ gridArea: 'foto', width: 64, height: 48, borderRadius: `${radii.sm}px`, bgcolor: '#FBF9F5', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box component="img" src={modelo.portada.url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </Box>

      <Box sx={{ gridArea: 'datos', minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.3 }}>{modelo.nombre}</Typography>
        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
          {modelo.superficieM2} m² · {modelo.habitaciones} dorm · {modelo.banos} baños ·{' '}
          {modelo.galeria.length + 1} fotos
        </Typography>
      </Box>

      <Typography sx={{ gridArea: 'precio', fontFamily: monoFamily, fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
        {formatCLP(modelo.precioDesdeCLP)}
      </Typography>

      <Box sx={{ gridArea: 'estado', justifySelf: { xs: 'center', md: 'start' } }}>
        <Toggle
          activo={modelo.publicado}
          onCambiar={alternarPublicado}
          disabled={ocupado}
          etiqueta={modelo.publicado ? 'Publicado' : 'Borrador'}
          ariaLabel={`${modelo.publicado ? 'Ocultar' : 'Publicar'} el modelo ${modelo.nombre}`}
        />
      </Box>

      <Box sx={{ gridArea: 'acciones', display: 'flex', gap: 0.5, justifySelf: 'end' }}>
        <Box
          component="a"
          href={`/modelos/${modelo.slug}${modelo.publicado ? '' : '?preview=1'}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Previsualizar ${modelo.nombre}`}
          title="Ver la ficha como la vería un cliente"
          sx={{ ...iconoSx, '&:hover': { color: colors.teal } }}
        >
          <Eye size={16} />
        </Box>
        <Box
          component="a"
          href={`/admin/modelos/${modelo.id}`}
          aria-label={`Editar ${modelo.nombre}`}
          sx={{ ...iconoSx, bgcolor: colors.teal, color: colors.cream, '&:hover': { bgcolor: colors.tealDeep } }}
        >
          <Pencil size={15} />
        </Box>
        <Box
          component="button"
          type="button"
          onClick={eliminar}
          aria-label={`Eliminar ${modelo.nombre}`}
          sx={{ ...iconoSx, '&:hover': { color: '#B4472E' } }}
        >
          <Trash2 size={16} />
        </Box>
      </Box>
    </Box>
  );
}

export default function ListadoModelos({ modelos }: { modelos: Modelo[] }) {
  const [lista, setLista] = useState<Modelo[]>(modelos);
  const [creando, setCreando] = useState(false);
  const publicados = lista.filter((m) => m.publicado).length;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2.5 }}>
        <Button variant="contained" color="primary" startIcon={<Plus size={16} />} onClick={() => setCreando((v) => !v)}>
          Agregar un modelo
        </Button>
        <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', ml: { md: 'auto' } }}>
          {lista.length} modelos · {publicados} publicados
          {lista.length - publicados > 0 ? ` · ${lista.length - publicados} en borrador` : ''}
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
            <FormNuevoModelo
              onCreado={(id) => {
                window.location.href = `/admin/modelos/${id}`;
              }}
              onCancelar={() => setCreando(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {lista.map((modelo) => (
          <FilaModelo
            key={modelo.id}
            modelo={modelo}
            onCambiado={(m) => setLista((prev) => prev.map((x) => (x.id === m.id ? m : x)))}
            onEliminado={() => setLista((prev) => prev.filter((x) => x.id !== modelo.id))}
          />
        ))}
        {lista.length === 0 && (
          <Typography sx={{ color: 'text.secondary', py: 3, display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            <Check size={16} /> Aún no hay modelos. Crea el primero con “Agregar un modelo”.
          </Typography>
        )}
      </Box>
    </Box>
  );
}

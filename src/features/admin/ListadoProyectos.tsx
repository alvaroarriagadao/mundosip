'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Eye, HardHat, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import type { Proyecto } from '@/features/proyectos/proyecto.types';
import { REGIONES_CHILE, lugarDeUbicacion } from '@/features/proyectos/regiones';
import { EASE } from '@/lib/motion';
import { colors, motionTokens, radii } from '@/theme/tokens';

import { chipSx, etiquetaSx, inputNumeroSx, inputSx } from './ui';

/** Datos mínimos para dar de alta un proyecto; el resto se completa en el editor */
interface CamposNuevo {
  nombre: string;
  regionSlug: string;
  lugar: string;
  superficie: string;
  anoConstruccion: string;
}

/** Alta rápida: solo lo indispensable, nace como borrador */
function FormNuevoProyecto({ onCreado, onCancelar }: { onCreado: (id: string) => void; onCancelar: () => void }) {
  const anoActual = new Date().getFullYear();
  const [campos, setCampos] = useState<CamposNuevo>({
    nombre: '',
    regionSlug: 'los-rios',
    lugar: '',
    superficie: '',
    anoConstruccion: String(anoActual),
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const n = { superficie: Number(campos.superficie), ano: Number(campos.anoConstruccion) };
  const valido =
    campos.nombre.trim().length >= 2 &&
    campos.lugar.trim().length >= 2 &&
    Number.isInteger(n.superficie) && n.superficie > 0 &&
    Number.isInteger(n.ano) && n.ano >= 1990 && n.ano <= 2100;

  const campo = (clave: keyof CamposNuevo) => ({
    value: campos[clave],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setCampos((p) => ({ ...p, [clave]: e.target.value })),
  });

  async function crear() {
    if (!valido) return;
    setGuardando(true);
    setError(null);
    try {
      const respuesta = await fetch('/api/admin/proyectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: campos.nombre.trim(),
          regionSlug: campos.regionSlug,
          lugar: campos.lugar.trim(),
          superficieM2: n.superficie,
          anoDiseno: n.ano - 1, // se afina en el editor
          anoConstruccion: n.ano,
          resumen: '',
          resenaDestacada: '',
          resena: '',
          videoUrl: '',
          estado: 'terminada',
          destacado: false,
          publicado: false, // nace como borrador: se completa y luego se publica
        }),
      });
      const cuerpo = (await respuesta.json().catch(() => null)) as { id?: string; error?: string } | null;
      if (!respuesta.ok || !cuerpo?.id) {
        setError(cuerpo?.error ?? 'No se pudo crear el proyecto.');
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
      <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Nuevo proyecto</Typography>
      <Typography sx={{ fontSize: '0.86rem', color: 'text.secondary', mb: 2 }}>
        Con esto basta para empezar. Se crea como borrador y luego completas fotos, textos y video en
        su editor.
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1.3fr 1.3fr 1fr 1fr' }, gap: 2, mb: 2 }}>
        <Box>
          <Typography component="label" sx={etiquetaSx}>
            Nombre *
          </Typography>
          <Box component="input" placeholder="Casa Lago Ranco" sx={inputSx} {...campo('nombre')} />
        </Box>
        <Box>
          <Typography component="label" sx={etiquetaSx}>
            Región *
          </Typography>
          <Box component="select" sx={{ ...inputSx, cursor: 'pointer' }} {...campo('regionSlug')}>
            {REGIONES_CHILE.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.nombre}
              </option>
            ))}
          </Box>
        </Box>
        <Box>
          <Typography component="label" sx={etiquetaSx}>
            Comuna o lugar *
          </Typography>
          <Box component="input" placeholder="Panguipulli" sx={inputSx} {...campo('lugar')} />
        </Box>
        <Box>
          <Typography component="label" sx={etiquetaSx}>
            Superficie m² *
          </Typography>
          <Box component="input" inputMode="numeric" placeholder="120" sx={inputNumeroSx} {...campo('superficie')} />
        </Box>
        <Box>
          <Typography component="label" sx={etiquetaSx}>
            Año construcción *
          </Typography>
          <Box component="input" inputMode="numeric" sx={inputNumeroSx} {...campo('anoConstruccion')} />
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

/** Fila de proyecto con su estado y acciones */
function FilaProyecto({ proyecto, onCambiado, onEliminado }: { proyecto: Proyecto; onCambiado: (p: Proyecto) => void; onEliminado: () => void }) {
  const [ocupado, setOcupado] = useState(false);

  /** Publicar/ocultar sin abrir el editor: manda la ficha completa */
  async function alternarPublicado(nuevo: boolean) {
    setOcupado(true);
    try {
      const respuesta = await fetch(`/api/admin/proyectos/${proyecto.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: proyecto.nombre,
          regionSlug: proyecto.region.slug,
          lugar: lugarDeUbicacion(proyecto.ubicacion),
          superficieM2: proyecto.superficieM2,
          anoDiseno: proyecto.anoDiseno,
          anoConstruccion: proyecto.anoConstruccion,
          resumen: proyecto.resumen,
          resenaDestacada: proyecto.resenaDestacada,
          resena: proyecto.resena,
          videoUrl: proyecto.videoUrl ?? '',
          estado: proyecto.estado,
          destacado: proyecto.destacado,
          publicado: nuevo,
        }),
      });
      if (respuesta.ok) onCambiado({ ...proyecto, publicado: nuevo });
    } finally {
      setOcupado(false);
    }
  }

  async function eliminar() {
    if (!window.confirm(`¿Eliminar el proyecto "${proyecto.nombre}" con todas sus fotos? Esta acción no se puede deshacer.`)) return;
    setOcupado(true);
    try {
      const respuesta = await fetch(`/api/admin/proyectos/${proyecto.id}`, { method: 'DELETE' });
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
        gridTemplateColumns: { xs: 'auto minmax(0, 1fr) auto', md: 'auto minmax(0, 1fr) auto auto' },
        gridTemplateAreas: {
          xs: `"foto datos datos" "estado estado acciones"`,
          md: `"foto datos estado acciones"`,
        },
      }}
    >
      <Box sx={{ gridArea: 'foto', width: 64, height: 48, borderRadius: `${radii.sm}px`, bgcolor: '#FBF9F5', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box component="img" src={proyecto.portada.url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </Box>

      <Box sx={{ gridArea: 'datos', minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.3 }}>{proyecto.nombre}</Typography>
          {proyecto.estado === 'en_proceso' && (
            <Box sx={{ ...chipSx, bgcolor: 'rgba(185, 138, 78, 0.18)', color: colors.tanDark }}>
              <HardHat size={12} /> En construcción
            </Box>
          )}
        </Box>
        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
          {proyecto.ubicacion} · {proyecto.superficieM2} m² · {proyecto.galeria.length + (proyecto.portada.url ? 1 : 0)} fotos
        </Typography>
      </Box>

      <Box sx={{ gridArea: 'estado', justifySelf: { xs: 'start', md: 'start' } }}>
        <Toggle
          activo={proyecto.publicado}
          onCambiar={alternarPublicado}
          disabled={ocupado}
          etiqueta={proyecto.publicado ? 'Publicado' : 'Borrador'}
          ariaLabel={`${proyecto.publicado ? 'Ocultar' : 'Publicar'} el proyecto ${proyecto.nombre}`}
        />
      </Box>

      <Box sx={{ gridArea: 'acciones', display: 'flex', gap: 0.5, justifySelf: 'end' }}>
        <Box
          component="a"
          href={`/proyecto/${proyecto.slug}${proyecto.publicado ? '' : '?preview=1'}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Previsualizar ${proyecto.nombre}`}
          title="Ver la página como la vería un cliente"
          sx={{ ...iconoSx, '&:hover': { color: colors.teal } }}
        >
          <Eye size={16} />
        </Box>
        <Box
          component="a"
          href={`/admin/proyectos/${proyecto.id}`}
          aria-label={`Editar ${proyecto.nombre}`}
          sx={{ ...iconoSx, bgcolor: colors.teal, color: colors.cream, '&:hover': { bgcolor: colors.tealDeep } }}
        >
          <Pencil size={15} />
        </Box>
        <Box
          component="button"
          type="button"
          onClick={eliminar}
          aria-label={`Eliminar ${proyecto.nombre}`}
          sx={{ ...iconoSx, '&:hover': { color: '#B4472E' } }}
        >
          <Trash2 size={16} />
        </Box>
      </Box>
    </Box>
  );
}

export default function ListadoProyectos({ proyectos }: { proyectos: Proyecto[] }) {
  const [lista, setLista] = useState<Proyecto[]>(proyectos);
  const [creando, setCreando] = useState(false);
  const publicados = lista.filter((p) => p.publicado).length;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2.5 }}>
        <Button variant="contained" color="primary" startIcon={<Plus size={16} />} onClick={() => setCreando((v) => !v)}>
          Agregar un proyecto
        </Button>
        <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', ml: { md: 'auto' } }}>
          {lista.length} proyectos · {publicados} publicados
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
            <FormNuevoProyecto
              onCreado={(id) => {
                window.location.href = `/admin/proyectos/${id}`;
              }}
              onCancelar={() => setCreando(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {lista.map((proyecto) => (
          <FilaProyecto
            key={proyecto.id}
            proyecto={proyecto}
            onCambiado={(p) => setLista((prev) => prev.map((x) => (x.id === p.id ? p : x)))}
            onEliminado={() => setLista((prev) => prev.filter((x) => x.id !== proyecto.id))}
          />
        ))}
        {lista.length === 0 && (
          <Typography sx={{ color: 'text.secondary', py: 3, display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            <Check size={16} /> Aún no hay proyectos. Crea el primero con “Agregar un proyecto”.
          </Typography>
        )}
      </Box>
    </Box>
  );
}

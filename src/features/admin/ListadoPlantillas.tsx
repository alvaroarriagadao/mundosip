'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Copy, Pencil, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { formatCLP } from '@/lib/format';
import { KIT_LABEL, type KitCotizacion } from '@/features/cotizador/cotizacion.types';
import { colors, motionTokens, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

export interface PlantillaResumenUI {
  id: string;
  modeloSlug: string;
  kit: KitCotizacion;
  titulo: string;
  secciones: number;
  items: number;
  neto: number;
}

const kickerSx = {
  fontWeight: 700,
  fontSize: '0.8rem',
} as const;

/** Duplica la plantilla hacia un modelo nuevo pidiendo solo el slug. */
async function duplicar(plantilla: PlantillaResumenUI) {
  const slug = window.prompt(
    `Duplicar "${plantilla.modeloSlug} · ${KIT_LABEL[plantilla.kit]}" hacia un modelo nuevo.\n\nEscribe el slug del modelo (minúsculas y guiones, ej: canelo):`,
  );
  if (!slug) return;

  const respuesta = await fetch('/api/admin/plantillas/duplicar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plantillaId: plantilla.id, modeloSlug: slug.trim().toLowerCase() }),
  });
  const cuerpo = (await respuesta.json().catch(() => null)) as { id?: string; error?: string } | null;
  if (!respuesta.ok || !cuerpo?.id) {
    window.alert(cuerpo?.error ?? 'No se pudo duplicar la plantilla.');
    return;
  }
  window.location.href = `/admin/cotizaciones/${cuerpo.id}`;
}

/** Sub-card de un kit dentro de la fila del modelo */
function KitCard({ plantilla }: { plantilla: PlantillaResumenUI }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 2,
        borderRadius: `${radii.md}px`,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: `border-color 0.25s ${motionTokens.easeCss}`,
        '&:hover': { borderColor: colors.teal },
      }}
    >
      <Box
        component="a"
        href={`/admin/cotizaciones/${plantilla.id}`}
        sx={{ flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }}
      >
        <Typography
          component="p"
          sx={{ ...kickerSx, color: plantilla.kit === 'full' ? colors.tanDark : colors.teal, mb: 0.5 }}
        >
          {KIT_LABEL[plantilla.kit]}
        </Typography>
        <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
          {plantilla.items} partidas
        </Typography>
        <Typography sx={{ fontFamily: monoFamily, fontWeight: 700, fontSize: '0.92rem', mt: 0.25 }}>
          {formatCLP(plantilla.neto)}{' '}
          <Box component="span" sx={{ fontWeight: 400, color: 'text.secondary', fontSize: '0.78rem' }}>
            neto
          </Box>
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexShrink: 0 }}>
        <Box
          component="a"
          href={`/admin/cotizaciones/${plantilla.id}`}
          aria-label={`Editar ${plantilla.modeloSlug} ${KIT_LABEL[plantilla.kit]}`}
          title="Editar partidas y precios"
          sx={{
            width: 34,
            height: 34,
            borderRadius: `${radii.sm}px`,
            display: 'grid',
            placeItems: 'center',
            color: colors.cream,
            bgcolor: colors.teal,
            transition: `background-color 0.2s ${motionTokens.easeCss}`,
            '&:hover': { bgcolor: colors.tealDeep },
          }}
        >
          <Pencil size={15} />
        </Box>
        <Box
          component="button"
          type="button"
          onClick={() => duplicar(plantilla)}
          aria-label={`Duplicar ${plantilla.modeloSlug} ${KIT_LABEL[plantilla.kit]} a un modelo nuevo`}
          title="Duplicar hacia un modelo nuevo"
          sx={{
            width: 34,
            height: 34,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: `${radii.sm}px`,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'transparent',
            color: colors.muted,
            cursor: 'pointer',
            transition: `all 0.2s ${motionTokens.easeCss}`,
            '&:hover': { color: colors.teal, borderColor: colors.teal },
          }}
        >
          <Copy size={15} />
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Listado del admin agrupado POR MODELO (una fila = un modelo, sus dos
 * kits lado a lado), con buscador y duplicado hacia modelos nuevos.
 */
export default function ListadoPlantillas({ plantillas }: { plantillas: PlantillaResumenUI[] }) {
  const [filtro, setFiltro] = useState('');

  const modelos = useMemo(() => {
    const mapa = new Map<string, PlantillaResumenUI[]>();
    for (const p of plantillas) {
      const lista = mapa.get(p.modeloSlug) ?? [];
      lista.push(p);
      mapa.set(p.modeloSlug, lista);
    }
    const texto = filtro.trim().toLowerCase();
    return [...mapa.entries()]
      .filter(([slug]) => !texto || slug.includes(texto))
      .map(([slug, lista]) => ({
        slug,
        // Kit Inicial a la izquierda, Full a la derecha
        kits: [...lista].sort((a, b) => (a.kit === 'inicial' ? -1 : 1) - (b.kit === 'inicial' ? -1 : 1)),
      }));
  }, [plantillas, filtro]);

  return (
    <Box>
      {/* Buscador + guía para modelos nuevos */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.75,
            py: 1,
            borderRadius: `${radii.pill}px`,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            minWidth: 260,
          }}
        >
          <Box aria-hidden sx={{ color: colors.muted, display: 'grid' }}>
            <Search size={16} />
          </Box>
          <Box
            component="input"
            type="search"
            placeholder="Buscar modelo…"
            aria-label="Buscar modelo"
            value={filtro}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiltro(e.target.value)}
            sx={{ border: 0, outline: 'none', bgcolor: 'transparent', font: 'inherit', fontSize: '0.95rem', flex: 1, color: 'text.primary' }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontSize: '0.85rem' }}>
          <Plus size={15} aria-hidden />
          <Typography sx={{ fontSize: '0.85rem' }}>
            ¿Modelo nuevo? Usa <strong>duplicar</strong> en la plantilla más parecida y ajusta precios
            — o deja su Excel en <Box component="code" sx={{ fontFamily: monoFamily, fontSize: '0.78rem' }}>assets/cotizaciones</Box> y corre la importación.
          </Typography>
        </Box>
      </Box>

      {/* Una fila por modelo */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {modelos.map(({ slug, kits }) => (
          <Box
            key={slug}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '180px 1fr 1fr' },
              gap: { xs: 1.5, md: 2 },
              alignItems: 'center',
              p: { xs: 2, md: 2.5 },
              borderRadius: `${radii.md}px`,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'rgba(246, 241, 234, 0.45)',
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', textTransform: 'capitalize', lineHeight: 1.2 }}>
                {slug}
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
                {kits.length === 2 ? 'Ambos kits' : `Solo ${KIT_LABEL[kits[0].kit]}`}
              </Typography>
            </Box>
            {kits.map((p) => (
              <KitCard key={p.id} plantilla={p} />
            ))}
          </Box>
        ))}
        {modelos.length === 0 && (
          <Typography sx={{ color: 'text.secondary', py: 3 }}>
            Ningún modelo calza con “{filtro}”.
          </Typography>
        )}
      </Box>
    </Box>
  );
}

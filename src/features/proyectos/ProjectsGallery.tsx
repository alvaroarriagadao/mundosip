'use client';

import Box from '@mui/material/Box';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import ProjectCard from '@/features/proyectos/ProjectCard';
import type { Proyecto, RegionProyecto } from '@/features/proyectos/proyecto.types';
import { EASE } from '@/lib/motion';
import { motionTokens } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

interface ProjectsGalleryProps {
  proyectos: Proyecto[];
  regiones: RegionProyecto[];
}

const MotionBox = motion.create(Box);

const TODOS = 'todos';

/** Tab de filtro estilo ficha técnica: mono, mayúsculas, subrayado tan al activar */
function FilterTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-pressed={active}
      sx={{
        appearance: 'none',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        p: 0,
        pb: 1,
        position: 'relative',
        fontFamily: monoFamily,
        fontSize: '0.85rem',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: active ? 'text.primary' : 'text.secondary',
        fontWeight: active ? 700 : 400,
        transition: `color ${motionTokens.dur.hover}s ${motionTokens.easeCss}`,
        '&::after': {
          content: '""',
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '2px',
          bgcolor: 'secondary.main',
          transform: active ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left center',
          transition: `transform 0.35s ${motionTokens.easeCss}`,
        },
        '&:hover': { color: 'text.primary' },
      }}
    >
      {label}
    </Box>
  );
}

/**
 * Galería completa de proyectos con filtro por región.
 * Escala a decenas de proyectos: las regiones llegan derivadas de los
 * datos y la grilla mantiene el ritmo editorial ancha/angosta.
 */
export default function ProjectsGallery({ proyectos, regiones }: ProjectsGalleryProps) {
  const [region, setRegion] = useState<string>(TODOS);

  const visibles = region === TODOS ? proyectos : proyectos.filter((p) => p.region.slug === region);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          columnGap: { xs: 3, md: 5 },
          rowGap: 1.5,
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2.25,
          mb: { xs: 4, md: 6 },
        }}
      >
        <FilterTab label="Todos" active={region === TODOS} onClick={() => setRegion(TODOS)} />
        {regiones.map((r) => (
          <FilterTab key={r.slug} label={r.nombre} active={region === r.slug} onClick={() => setRegion(r.slug)} />
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' },
          gap: { xs: 2.5, md: 3 },
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {visibles.map((proyecto, i) => {
            // Ritmo editorial: ancha / angosta / angosta / ancha
            const wide = i % 4 === 0 || i % 4 === 3;
            return (
              <MotionBox
                key={proyecto.slug}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.25 } }}
                transition={{ duration: 0.5, ease: EASE }}
                sx={{ gridColumn: { xs: 'auto', md: wide ? 'span 7' : 'span 5' } }}
              >
                <ProjectCard proyecto={proyecto} wide={wide} />
              </MotionBox>
            );
          })}
        </AnimatePresence>
      </Box>
    </>
  );
}

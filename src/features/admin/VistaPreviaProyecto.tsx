'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { HardHat, Image as ImageIcon, Play } from 'lucide-react';

import type { EstadoProyecto, ImagenProyecto } from '@/features/proyectos/proyecto.types';
import { colors, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

export interface DatosVistaPrevia {
  nombre: string;
  regionNombre: string;
  lugar: string;
  superficie: string;
  anoDiseno: string;
  anoConstruccion: string;
  estadoObra: EstadoProyecto;
  resumen: string;
  resenaDestacada: string;
  resena: string;
  portada: ImagenProyecto | null;
  imagenResena: ImagenProyecto | null;
  galeria: ImagenProyecto[];
  videoUrl: string;
  videoEnResena: boolean;
}

/** Etiqueta de zona: dice QUÉ parte de la página es cada bloque */
function Zona({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: '0.68rem',
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: colors.muted,
        mb: 0.75,
      }}
    >
      {children}
    </Typography>
  );
}

/** Cuadro punteado para lo que aún no se ha llenado */
function Pendiente({ texto, aspecto }: { texto: string; aspecto?: string }) {
  return (
    <Box
      sx={{
        border: '1.5px dashed',
        borderColor: 'divider',
        borderRadius: `${radii.sm}px`,
        display: 'grid',
        placeItems: 'center',
        aspectRatio: aspecto,
        p: aspecto ? 0 : 1.5,
        color: colors.muted,
      }}
    >
      <Typography sx={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 0.6 }}>
        <ImageIcon size={13} /> {texto}
      </Typography>
    </Box>
  );
}

/** Bloque miniatura del video embebido */
function MiniVideo() {
  return (
    <Box
      sx={{
        aspectRatio: '16 / 9',
        borderRadius: `${radii.sm}px`,
        bgcolor: colors.tealNight,
        display: 'grid',
        placeItems: 'center',
        color: colors.cream,
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Box
          sx={{
            width: 30,
            height: 30,
            mx: 'auto',
            mb: 0.5,
            borderRadius: '50%',
            bgcolor: 'rgba(246, 241, 234, 0.18)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Play size={13} fill="currentColor" />
        </Box>
        <Typography sx={{ fontSize: '0.7rem', opacity: 0.85 }}>Video embebido</Typography>
      </Box>
    </Box>
  );
}

/**
 * Maqueta EN VIVO de la página del proyecto: se rellena con lo que el
 * equipo va escribiendo en el formulario, mostrando dónde cae cada
 * cosa. No reemplaza a "Previsualizar" (que abre la página real):
 * es el mapa que evita tener que imaginarla.
 */
export default function VistaPreviaProyecto({ datos }: { datos: DatosVistaPrevia }) {
  const specs = [
    { label: 'Superficie', valor: datos.superficie ? `${datos.superficie} m²` : '—' },
    { label: 'Año diseño', valor: datos.anoDiseno || '—' },
    { label: 'Año constr.', valor: datos.anoConstruccion || '—' },
    { label: 'Ubicación', valor: datos.lugar ? `${datos.lugar}, ${datos.regionNombre}` : '—' },
  ];
  const hayVideo = datos.videoUrl.trim() !== '';
  const enConstruccion = datos.estadoObra === 'en_proceso';

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: `${radii.md}px`,
        bgcolor: 'background.paper',
        p: 2,
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Así se arma la página</Typography>
      <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mb: 2 }}>
        Se actualiza mientras escribes. Para verla de verdad, usa “Previsualizar”.
      </Typography>

      {/* ── Card en /proyectos ── */}
      <Zona>Card en /proyectos{enConstruccion ? ' · sección Casas en obra' : ''}</Zona>
      <Box
        sx={{
          position: 'relative',
          borderRadius: `${radii.sm}px`,
          overflow: 'hidden',
          aspectRatio: '16 / 10',
          mb: 2.5,
          bgcolor: colors.tealDeep,
        }}
      >
        {datos.portada ? (
          <Box component="img" src={datos.portada.url} alt="" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'rgba(246,241,234,0.6)' }}>
            <Typography sx={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 0.6 }}>
              <ImageIcon size={13} /> Foto de portada
            </Typography>
          </Box>
        )}
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(185deg, rgba(13,33,41,0.1) 40%, rgba(13,33,41,0.85) 100%)' }} />
        {enConstruccion && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.35,
              borderRadius: `${radii.pill}px`,
              bgcolor: colors.tan,
              color: colors.tealNight,
              fontSize: '0.66rem',
              fontWeight: 700,
            }}
          >
            <HardHat size={11} /> En construcción
          </Box>
        )}
        <Box sx={{ position: 'absolute', inset: 'auto 0 0 0', p: 1.25, color: colors.cream }}>
          <Typography sx={{ fontFamily: monoFamily, fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: colors.tanLight }}>
            {datos.superficie || '—'} m² · {datos.lugar || '—'}
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>
            {datos.nombre || 'Nombre del proyecto'}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', opacity: 0.8, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {datos.resumen || 'Aquí va el resumen de 1 línea.'}
          </Typography>
        </Box>
      </Box>

      {/* ── Página del proyecto ── */}
      <Zona>Arriba de la página: portada y datos</Zona>
      <Box sx={{ position: 'relative', borderRadius: `${radii.sm}px`, overflow: 'hidden', aspectRatio: '16 / 8', bgcolor: colors.tealDeep }}>
        {datos.portada && (
          <Box component="img" src={datos.portada.url} alt="" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(13,33,41,0.4) 0%, rgba(13,33,41,0.6) 100%)' }} />
        <Box sx={{ position: 'absolute', inset: 'auto 0 0 0', p: 1.25, color: colors.cream }}>
          <Typography sx={{ fontFamily: monoFamily, fontSize: '0.58rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: colors.tanLight }}>
            Proyecto · Región de {datos.regionNombre}
            {enConstruccion && ' · En construcción'}
          </Typography>
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.15 }}>
            {datos.nombre || 'Nombre del proyecto'}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          mx: 1,
          mt: -1.25,
          position: 'relative',
          bgcolor: colors.tealDeep,
          color: colors.cream,
          borderRadius: `${radii.sm}px`,
          p: 1.25,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1,
          mb: 2.5,
        }}
      >
        {specs.map((s) => (
          <Box key={s.label}>
            <Typography sx={{ fontFamily: monoFamily, fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: colors.tanLight }}>
              {s.label}
            </Typography>
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, lineHeight: 1.3 }}>{s.valor}</Typography>
          </Box>
        ))}
      </Box>

      <Zona>Sección “La casa”: los dos párrafos {datos.videoEnResena ? '+ el video' : '+ la foto vertical'}</Zona>
      <Box sx={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 1.25, alignItems: 'start', mb: 2.5 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.8rem',
              lineHeight: 1.4,
              color: datos.resenaDestacada ? 'text.primary' : colors.muted,
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {datos.resenaDestacada || 'Aquí va el párrafo destacado (grande).'}
          </Typography>
          <Typography
            sx={{
              mt: 0.75,
              fontSize: '0.7rem',
              lineHeight: 1.45,
              color: 'text.secondary',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {datos.resena || 'Y aquí el párrafo de apoyo, más pequeño.'}
          </Typography>
        </Box>
        {datos.videoEnResena ? (
          hayVideo ? <MiniVideo /> : <Pendiente texto="Video" aspecto="16 / 9" />
        ) : datos.imagenResena ? (
          <Box component="img" src={datos.imagenResena.url} alt="" sx={{ width: '100%', aspectRatio: '4 / 4.6', objectFit: 'cover', borderRadius: `${radii.sm}px` }} />
        ) : datos.portada ? (
          <Box sx={{ position: 'relative' }}>
            <Box component="img" src={datos.portada.url} alt="" sx={{ width: '100%', aspectRatio: '4 / 4.6', objectFit: 'cover', borderRadius: `${radii.sm}px`, display: 'block' }} />
            <Typography sx={{ fontSize: '0.62rem', color: colors.muted, mt: 0.25 }}>Reutiliza la portada</Typography>
          </Box>
        ) : (
          <Pendiente texto="Foto de la reseña" aspecto="4 / 4.6" />
        )}
      </Box>

      {hayVideo && !datos.videoEnResena && (
        <>
          <Zona>Sección “El recorrido”: el video</Zona>
          <Box sx={{ mb: 2.5 }}>
            <MiniVideo />
          </Box>
        </>
      )}

      <Zona>Galería al final de la página</Zona>
      {datos.galeria.length === 0 ? (
        <Pendiente texto="Fotos de la galería" aspecto="16 / 5" />
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.75 }}>
          {datos.galeria.slice(0, 6).map((f, i) => (
            <Box key={`${f.url}-${i}`} sx={{ position: 'relative' }}>
              <Box component="img" src={f.url} alt="" sx={{ width: '100%', aspectRatio: '16 / 11', objectFit: 'cover', borderRadius: `${radii.sm}px`, display: 'block' }} />
              {i === 5 && datos.galeria.length > 6 && (
                <Box sx={{ position: 'absolute', inset: 0, borderRadius: `${radii.sm}px`, bgcolor: 'rgba(13,33,41,0.6)', display: 'grid', placeItems: 'center', color: colors.cream, fontSize: '0.78rem', fontWeight: 700 }}>
                  +{datos.galeria.length - 6}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

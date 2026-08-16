'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Eye, TriangleAlert } from 'lucide-react';
import { useState } from 'react';

import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import type { EstadoProyecto, ImagenProyecto, Proyecto } from '@/features/proyectos/proyecto.types';
import { REGIONES_CHILE, lugarDeUbicacion } from '@/features/proyectos/regiones';
import { medioVideo } from '@/features/proyectos/video';
import { colors, radii } from '@/theme/tokens';

import { BotonGuardar, Seccion, type Estado } from './Bloques';
import FotoUnica from './FotoUnica';
import GaleriaFotos from './GaleriaFotos';
import SelectorVideo from './SelectorVideo';
import VistaPreviaProyecto from './VistaPreviaProyecto';
import { etiquetaSx, inputNumeroSx, inputSx } from './ui';

/**
 * Editor completo de un proyecto construido: ficha, textos de la
 * página, fotos con dimensiones recomendadas y video opcional.
 *
 * Guarda por bloques (cada uno con su botón) y ofrece previsualizar la
 * página real antes de publicarla — igual que el editor de modelos,
 * para que el equipo no tenga que aprender dos herramientas.
 */
export default function EditorProyecto({ proyecto }: { proyecto: Proyecto }) {
  // ── Ficha ──
  const [nombre, setNombre] = useState(proyecto.nombre);
  const [regionSlug, setRegionSlug] = useState(proyecto.region.slug);
  const [lugar, setLugar] = useState(lugarDeUbicacion(proyecto.ubicacion));
  const [superficie, setSuperficie] = useState(String(proyecto.superficieM2));
  const [anoDiseno, setAnoDiseno] = useState(String(proyecto.anoDiseno));
  const [anoConstruccion, setAnoConstruccion] = useState(String(proyecto.anoConstruccion));
  const [estadoObra, setEstadoObra] = useState<EstadoProyecto>(proyecto.estado);
  const [videoUrl, setVideoUrl] = useState(proyecto.videoUrl ?? '');
  const [videoEnResena, setVideoEnResena] = useState(proyecto.videoEnResena);
  const [destacado, setDestacado] = useState(proyecto.destacado);
  const [publicado, setPublicado] = useState(proyecto.publicado);

  // ── Textos ──
  const [resumen, setResumen] = useState(proyecto.resumen);
  const [resenaDestacada, setResenaDestacada] = useState(proyecto.resenaDestacada);
  const [resena, setResena] = useState(proyecto.resena);

  const [estadoFicha, setEstadoFicha] = useState<Estado>('idle');
  const [errorFicha, setErrorFicha] = useState<string | null>(null);

  // ── Fotos ──
  const [portada, setPortada] = useState<ImagenProyecto | null>(proyecto.portada.url ? proyecto.portada : null);
  const [imagenResena, setImagenResena] = useState<ImagenProyecto | null>(
    // Si la reseña reutilizaba la portada (proyecto sin foto propia), parte vacía
    proyecto.imagenResena.url && proyecto.imagenResena.url !== proyecto.portada.url ? proyecto.imagenResena : null,
  );
  const [galeria, setGaleria] = useState<ImagenProyecto[]>(proyecto.galeria);
  const [estadoFotos, setEstadoFotos] = useState<Estado>('idle');

  const numeros = {
    superficie: Number(superficie),
    anoDiseno: Number(anoDiseno),
    anoConstruccion: Number(anoConstruccion),
  };
  const videoValido = videoUrl.trim() === '' || medioVideo(videoUrl) != null;
  const fichaValida =
    nombre.trim().length >= 2 &&
    lugar.trim().length >= 2 &&
    REGIONES_CHILE.some((r) => r.slug === regionSlug) &&
    Number.isInteger(numeros.superficie) && numeros.superficie > 0 &&
    Number.isInteger(numeros.anoDiseno) && numeros.anoDiseno >= 1990 && numeros.anoDiseno <= 2100 &&
    Number.isInteger(numeros.anoConstruccion) && numeros.anoConstruccion >= 1990 && numeros.anoConstruccion <= 2100 &&
    videoValido;

  /** La ficha y los textos viajan juntos: es un solo PUT con todo */
  async function guardarFicha() {
    if (!fichaValida) return;
    setEstadoFicha('guardando');
    setErrorFicha(null);
    try {
      const respuesta = await fetch(`/api/admin/proyectos/${proyecto.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          regionSlug,
          lugar: lugar.trim(),
          superficieM2: numeros.superficie,
          anoDiseno: numeros.anoDiseno,
          anoConstruccion: numeros.anoConstruccion,
          resumen: resumen.trim(),
          resenaDestacada: resenaDestacada.trim(),
          resena: resena.trim(),
          videoUrl: videoUrl.trim(),
          videoEnResena,
          estado: estadoObra,
          destacado,
          publicado,
        }),
      });
      const cuerpo = (await respuesta.json().catch(() => null)) as { error?: string } | null;
      if (!respuesta.ok) {
        setErrorFicha(cuerpo?.error ?? 'No se pudo guardar.');
        setEstadoFicha('error');
        return;
      }
      setEstadoFicha('ok');
      setTimeout(() => setEstadoFicha('idle'), 2500);
    } catch {
      setErrorFicha('No se pudo guardar. Revisa tu conexión.');
      setEstadoFicha('error');
    }
  }

  async function guardarFotos() {
    setEstadoFotos('guardando');
    try {
      const respuesta = await fetch(`/api/admin/proyectos/${proyecto.id}/imagenes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portada, imagenResena, galeria }),
      });
      // El interruptor foto/video de la reseña vive en la ficha: se
      // persiste junto con las fotos para que no se pierda según qué
      // botón de guardar use el equipo.
      if (respuesta.ok && fichaValida) void guardarFicha();
      setEstadoFotos(respuesta.ok ? 'ok' : 'error');
      if (respuesta.ok) setTimeout(() => setEstadoFotos('idle'), 2500);
    } catch {
      setEstadoFotos('error');
    }
  }

  return (
    // Formulario a la izquierda, maqueta EN VIVO a la derecha (pantallas
    // grandes): el equipo ve dónde cae cada cosa mientras escribe.
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' },
        gap: { xs: 0, lg: 3.5 },
        alignItems: 'start',
      }}
    >
    <Box sx={{ minWidth: 0 }}>
      {/* ── Barra de estado: publicar y previsualizar ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          p: { xs: 2, md: 2.5 },
          mb: 2.5,
          borderRadius: `${radii.md}px`,
          border: '1px solid',
          borderColor: publicado ? 'rgba(32, 78, 95, 0.3)' : colors.tan,
          bgcolor: publicado ? 'rgba(32, 78, 95, 0.05)' : 'rgba(185, 138, 78, 0.08)',
        }}
      >
        <Box>
          <Toggle
            activo={publicado}
            onCambiar={setPublicado}
            etiqueta={publicado ? 'Publicado en el sitio' : 'Borrador — no se ve en el sitio'}
          />
          <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', mt: 0.5 }}>
            {publicado
              ? 'Aparece en /proyectos y en la portada si está destacado.'
              : 'Solo tú puedes verlo con “Previsualizar”. Recuerda guardar la ficha.'}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          color="primary"
          size="small"
          href={`/proyecto/${proyecto.slug}${publicado ? '' : '?preview=1'}`}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<Eye size={15} />}
        >
          Previsualizar
        </Button>
      </Box>

      {/* ── Ficha ── */}
      <Seccion titulo="Ficha del proyecto" descripcion="Los datos duros: se ven en la banda bajo la foto principal y en la card de la galería.">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' }, gap: 2, mb: 2 }}>
          <Box>
            <Typography component="label" sx={etiquetaSx}>
              Nombre *
            </Typography>
            <Box component="input" value={nombre} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)} sx={inputSx} />
          </Box>
          <Box>
            <Typography component="label" sx={etiquetaSx}>
              Región *
            </Typography>
            <Box
              component="select"
              value={regionSlug}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRegionSlug(e.target.value)}
              sx={{ ...inputSx, cursor: 'pointer' }}
            >
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
            <Box component="input" value={lugar} placeholder="Panguipulli" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLugar(e.target.value)} sx={inputSx} />
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1.4fr' }, gap: 2, mb: 2 }}>
          <Box>
            <Typography component="label" sx={etiquetaSx}>
              Superficie m² *
            </Typography>
            <Box component="input" inputMode="numeric" value={superficie} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSuperficie(e.target.value)} sx={inputNumeroSx} />
          </Box>
          <Box>
            <Typography component="label" sx={etiquetaSx}>
              Año de diseño *
            </Typography>
            <Box component="input" inputMode="numeric" value={anoDiseno} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAnoDiseno(e.target.value)} sx={inputNumeroSx} />
          </Box>
          <Box>
            <Typography component="label" sx={etiquetaSx}>
              Año de construcción *
            </Typography>
            <Box component="input" inputMode="numeric" value={anoConstruccion} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAnoConstruccion(e.target.value)} sx={inputNumeroSx} />
          </Box>
          <Box>
            <Typography component="label" sx={etiquetaSx}>
              Estado de la obra
            </Typography>
            <Box
              component="select"
              value={estadoObra}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEstadoObra(e.target.value as EstadoProyecto)}
              sx={{ ...inputSx, cursor: 'pointer' }}
            >
              <option value="terminada">Obra terminada</option>
              <option value="en_proceso">En construcción</option>
            </Box>
            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mt: 0.5 }}>
              {estadoObra === 'en_proceso'
                ? 'Saldrá en “Casas en obra”, con su etiqueta.'
                : 'Saldrá en “Casas que ya se habitan”.'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Toggle activo={destacado} onCambiar={setDestacado} etiqueta="Destacado en la portada" />
          <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
            Los 2 primeros destacados salen en la home.
          </Typography>
        </Box>

        <BotonGuardar estado={estadoFicha} onClick={guardarFicha} disabled={!fichaValida} />
        {errorFicha && <Typography sx={{ mt: 1, fontSize: '0.85rem', color: '#B4472E' }}>{errorFicha}</Typography>}
      </Seccion>

      {/* ── Textos ── */}
      <Seccion
        titulo="Textos de la página"
        descripcion="Cómo se cuenta el proyecto: una línea para la card y dos párrafos para la sección “La casa”."
      >
        <Box sx={{ mb: 2 }}>
          <Typography component="label" sx={etiquetaSx}>
            Resumen (1 línea, se ve en la card de la galería)
          </Typography>
          <Box component="textarea" rows={2} value={resumen} placeholder="Refugio sureño en primera línea de lago, revestido en tejuela de alerce." onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResumen(e.target.value)} sx={{ ...inputSx, resize: 'vertical' }} />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography component="label" sx={etiquetaSx}>
            Párrafo destacado (grande, 2–4 frases)
          </Typography>
          <Box component="textarea" rows={4} value={resenaDestacada} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResenaDestacada(e.target.value)} sx={{ ...inputSx, resize: 'vertical' }} />
        </Box>
        <Box>
          <Typography component="label" sx={etiquetaSx}>
            Párrafo de apoyo (más pequeño, 2–3 frases)
          </Typography>
          <Box component="textarea" rows={3} value={resena} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResena(e.target.value)} sx={{ ...inputSx, resize: 'vertical' }} />
        </Box>
        <BotonGuardar estado={estadoFicha} onClick={guardarFicha} disabled={!fichaValida} />
      </Seccion>

      {/* ── Fotos ── */}
      <Seccion
        titulo="Fotos del proyecto"
        descripcion="Cada foto tiene su lugar en la página. La vista previa muestra el mismo recorte que verá el cliente."
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr 2fr' }, gap: { xs: 3, md: 4 }, mb: 4 }}>
          <FotoUnica
            valor={portada}
            onCambiar={setPortada}
            titulo="Foto de portada *"
            ayuda="La foto principal: abre la página y es la card de la galería. Horizontal, ideal 1600×1000 px o más."
            aspecto="16 / 10"
            altPorDefecto={`Fotografía del proyecto ${nombre}`}
          />
          <Box>
            {videoEnResena ? (
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 0.25 }}>Video de la reseña</Typography>
                <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mb: 1.25 }}>
                  Acompaña los textos de “La casa” en lugar de la foto.
                </Typography>
                <SelectorVideo valor={videoUrl} onCambiar={setVideoUrl} />
              </Box>
            ) : (
              <FotoUnica
                valor={imagenResena}
                onCambiar={setImagenResena}
                titulo="Foto de la reseña"
                ayuda="Acompaña los textos de “La casa”. Vertical, ideal 900×1050 px. Si la dejas vacía se reutiliza la portada."
                aspecto="4 / 4.6"
                altPorDefecto={`Fotografía del proyecto ${nombre}`}
                anchoMax={1200}
              />
            )}
            <Box sx={{ mt: 1.5 }}>
              <Toggle
                activo={videoEnResena}
                onCambiar={setVideoEnResena}
                etiqueta={videoEnResena ? 'La reseña lleva video' : 'Usar un video en vez de la foto'}
              />
            </Box>
          </Box>
        </Box>

        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 0.25 }}>Galería</Typography>
        <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mb: 1.25 }}>
          El mosaico del final de la página. Entre 3 y 12 fotos horizontales, ideal 1600×1000 px o más.
        </Typography>
        <GaleriaFotos
          fotos={galeria}
          onCambiar={setGaleria}
          ayuda="Arrastra las fotos o haz clic. Puedes elegir varias a la vez; nosotros las ajustamos y comprimimos."
          altPorDefecto={`Fotografía del proyecto ${nombre}`}
        />

        <BotonGuardar estado={estadoFotos} onClick={guardarFotos} />
        {portada == null && (
          <Typography sx={{ mt: 1.5, fontSize: '0.85rem', color: colors.tanDark, display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
            <TriangleAlert size={15} /> Sin portada la página usa una foto estándar: súbela antes de publicar.
          </Typography>
        )}
      </Seccion>

      {/* ── Video como sección propia (si no acompaña la reseña) ── */}
      {!videoEnResena && (
        <Seccion
          titulo="Video (opcional)"
          descripcion="Sube un video corto (20–30 segundos) o pega un link de YouTube/Vimeo. Se muestra entre la reseña y la galería. (Si prefieres que reemplace la foto de la reseña, actívalo en el bloque de fotos.)"
        >
          <SelectorVideo valor={videoUrl} onCambiar={setVideoUrl} />
          <BotonGuardar estado={estadoFicha} onClick={guardarFicha} disabled={!fichaValida} />
        </Seccion>
      )}
    </Box>

      {/* ── Maqueta en vivo (solo pantallas grandes; en el resto está “Previsualizar”) ── */}
      <Box
        // Sin esto Lenis captura la rueda y el panel no scrollea por dentro
        data-lenis-prevent=""
        sx={{
          display: { xs: 'none', lg: 'block' },
          position: 'sticky',
          top: 100,
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          pr: 0.5,
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(13, 33, 41, 0.18)', borderRadius: 3 },
        }}
      >
        <VistaPreviaProyecto
          datos={{
            nombre,
            regionNombre: REGIONES_CHILE.find((r) => r.slug === regionSlug)?.nombre ?? '',
            lugar,
            superficie,
            anoDiseno,
            anoConstruccion,
            estadoObra,
            resumen,
            resenaDestacada,
            resena,
            portada,
            imagenResena,
            galeria,
            videoUrl,
            videoEnResena,
          }}
        />
      </Box>
    </Box>
  );
}

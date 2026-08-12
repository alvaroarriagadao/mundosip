'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Check, Copy, ExternalLink, Eye, FileText, Loader2, Save, TriangleAlert } from 'lucide-react';
import { useState } from 'react';

import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import { KIT_LABEL, type KitCotizacion } from '@/features/cotizador/cotizacion.types';
import type { ImagenModelo, Modelo } from '@/features/modelos/modelo.types';
import { formatCLP } from '@/lib/format';
import { colors, motionTokens, radii } from '@/theme/tokens';

import GaleriaEditable from './GaleriaEditable';
import ListaEditable from './ListaEditable';
import { etiquetaSx, inputNumeroSx, inputSx } from './ui';

type Estado = 'idle' | 'guardando' | 'ok' | 'error';

export interface KitCotizable {
  id: string;
  kit: string;
  items: number;
}

/** Los otros modelos, para poder copiarles los kits */
export interface ModeloHermano {
  id: string;
  nombre: string;
}

/** Bloque con título, para dividir el formulario en pasos legibles */
function Seccion({ titulo, descripcion, children }: { titulo: string; descripcion?: string; children: React.ReactNode }) {
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, borderRadius: `${radii.md}px`, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', mb: 2.5 }}>
      <Typography variant="h3" component="h2" sx={{ fontSize: '1.12rem', mb: descripcion ? 0.5 : 2 }}>
        {titulo}
      </Typography>
      {descripcion && (
        <Typography sx={{ fontSize: '0.88rem', color: 'text.secondary', mb: 2, lineHeight: 1.5 }}>
          {descripcion}
        </Typography>
      )}
      {children}
    </Box>
  );
}

/** Botón de guardado con su estado; se repite en cada bloque del editor */
function BotonGuardar({ estado, onClick, disabled = false }: { estado: Estado; onClick: () => void; disabled?: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2.5, flexWrap: 'wrap' }}>
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={onClick}
        disabled={disabled || estado === 'guardando'}
        startIcon={
          estado === 'guardando' ? (
            <Box component="span" aria-hidden sx={{ display: 'inline-flex', animation: 'giro 1s linear infinite', '@keyframes giro': { to: { transform: 'rotate(360deg)' } } }}>
              <Loader2 size={15} />
            </Box>
          ) : (
            <Save size={15} />
          )
        }
      >
        {estado === 'guardando' ? 'Guardando…' : 'Guardar'}
      </Button>
      {estado === 'ok' && (
        <Typography sx={{ fontSize: '0.86rem', color: colors.teal, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          <Check size={15} strokeWidth={2.5} /> Guardado
        </Typography>
      )}
      {estado === 'error' && (
        <Typography sx={{ fontSize: '0.86rem', color: '#B4472E', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          <TriangleAlert size={14} /> No se pudo guardar
        </Typography>
      )}
    </Box>
  );
}

/**
 * Editor completo de un modelo de casa: ficha, características, kits y
 * galería. Guarda por bloques (cada uno con su botón) para que un
 * cambio de precio no obligue a revisar todo lo demás, y ofrece
 * previsualizar la ficha real antes de publicarla.
 */
export default function EditorModelo({
  modelo,
  kitsCotizables,
  otrosModelos,
}: {
  modelo: Modelo;
  kitsCotizables: KitCotizable[];
  otrosModelos: ModeloHermano[];
}) {
  // ── Ficha ──
  const [nombre, setNombre] = useState(modelo.nombre);
  const [superficie, setSuperficie] = useState(String(modelo.superficieM2));
  const [habitaciones, setHabitaciones] = useState(String(modelo.habitaciones));
  const [banos, setBanos] = useState(String(modelo.banos));
  const [precio, setPrecio] = useState(String(modelo.precioDesdeCLP));
  const [resumen, setResumen] = useState(modelo.resumen);
  const [descripcion, setDescripcion] = useState(modelo.descripcion);
  const [destacado, setDestacado] = useState(modelo.destacado);
  const [publicado, setPublicado] = useState(modelo.publicado);
  const [estadoFicha, setEstadoFicha] = useState<Estado>('idle');
  const [errorFicha, setErrorFicha] = useState<string | null>(null);

  // ── Listas ──
  const [caracteristicas, setCaracteristicas] = useState<string[]>(modelo.caracteristicas);
  const [kitInicial, setKitInicial] = useState<string[]>(modelo.kitInicial);
  const [kitFullExtras, setKitFullExtras] = useState<string[]>(modelo.kitFullExtras);
  const [estadoListas, setEstadoListas] = useState<Estado>('idle');
  const [copiando, setCopiando] = useState(false);

  /** Trae los kits de otro modelo a la pantalla (no guarda: eso lo decide el equipo) */
  async function copiarKitsDe(desdeModeloId: string) {
    if (!desdeModeloId) return;
    const hayContenido = kitInicial.length > 0 || kitFullExtras.length > 0;
    if (hayContenido && !window.confirm('Esto reemplaza los kits que tienes en pantalla. ¿Continuar?')) {
      return;
    }
    setCopiando(true);
    try {
      const respuesta = await fetch(`/api/admin/modelos/${modelo.id}/copiar-kits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desdeModeloId }),
      });
      const datos = (await respuesta.json().catch(() => null)) as
        | { kitInicial?: string[]; kitFullExtras?: string[] }
        | null;
      if (respuesta.ok && datos) {
        setKitInicial(datos.kitInicial ?? []);
        setKitFullExtras(datos.kitFullExtras ?? []);
      }
    } finally {
      setCopiando(false);
    }
  }

  // ── Imágenes ──
  const [portada, setPortada] = useState<ImagenModelo | null>(modelo.portada.url ? modelo.portada : null);
  const [galeria, setGaleria] = useState<ImagenModelo[]>(modelo.galeria);
  const [estadoImagenes, setEstadoImagenes] = useState<Estado>('idle');

  const numeros = {
    superficie: Number(superficie),
    habitaciones: Number(habitaciones),
    banos: Number(banos),
    precio: Number(precio),
  };
  const fichaValida =
    nombre.trim().length >= 2 &&
    Number.isInteger(numeros.superficie) && numeros.superficie > 0 &&
    Number.isInteger(numeros.habitaciones) && numeros.habitaciones >= 0 &&
    Number.isInteger(numeros.banos) && numeros.banos >= 0 &&
    Number.isInteger(numeros.precio) && numeros.precio > 0;

  async function guardarFicha() {
    if (!fichaValida) return;
    setEstadoFicha('guardando');
    setErrorFicha(null);
    try {
      const respuesta = await fetch(`/api/admin/modelos/${modelo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          superficieM2: numeros.superficie,
          habitaciones: numeros.habitaciones,
          banos: numeros.banos,
          precioDesdeCLP: numeros.precio,
          resumen: resumen.trim(),
          descripcion: descripcion.trim(),
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

  async function guardarListas() {
    setEstadoListas('guardando');
    try {
      const limpiar = (xs: string[]) => xs.map((t) => t.trim()).filter(Boolean);
      const respuesta = await fetch(`/api/admin/modelos/${modelo.id}/listas`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caracteristicas: limpiar(caracteristicas),
          kitInicial: limpiar(kitInicial),
          kitFullExtras: limpiar(kitFullExtras),
        }),
      });
      setEstadoListas(respuesta.ok ? 'ok' : 'error');
      if (respuesta.ok) setTimeout(() => setEstadoListas('idle'), 2500);
    } catch {
      setEstadoListas('error');
    }
  }

  async function guardarImagenes() {
    setEstadoImagenes('guardando');
    try {
      const respuesta = await fetch(`/api/admin/modelos/${modelo.id}/imagenes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portada, galeria }),
      });
      setEstadoImagenes(respuesta.ok ? 'ok' : 'error');
      if (respuesta.ok) setTimeout(() => setEstadoImagenes('idle'), 2500);
    } catch {
      setEstadoImagenes('error');
    }
  }

  return (
    <Box>
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
              ? 'Aparece en /modelos y en el buscador.'
              : 'Solo tú puedes verlo con “Previsualizar”. Recuerda guardar la ficha.'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            href={`/modelos/${modelo.slug}${publicado ? '' : '?preview=1'}`}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<Eye size={15} />}
          >
            Previsualizar
          </Button>
        </Box>
      </Box>

      {/* ── Ficha ── */}
      <Seccion titulo="Ficha del modelo" descripcion="Lo que se ve en el listado y en la cabecera de su página.">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
          <Box>
            <Typography component="label" sx={etiquetaSx}>
              Nombre *
            </Typography>
            <Box component="input" value={nombre} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)} sx={inputSx} />
          </Box>
          <Box>
            <Typography component="label" sx={etiquetaSx}>
              Superficie m² *
            </Typography>
            <Box component="input" inputMode="numeric" value={superficie} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSuperficie(e.target.value)} sx={inputNumeroSx} />
          </Box>
          <Box>
            <Typography component="label" sx={etiquetaSx}>
              Dormitorios *
            </Typography>
            <Box component="input" inputMode="numeric" value={habitaciones} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHabitaciones(e.target.value)} sx={inputNumeroSx} />
          </Box>
          <Box>
            <Typography component="label" sx={etiquetaSx}>
              Baños *
            </Typography>
            <Box component="input" inputMode="numeric" value={banos} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBanos(e.target.value)} sx={inputNumeroSx} />
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
          <Box>
            <Typography component="label" sx={etiquetaSx}>
              Precio del kit, desde (CLP) *
            </Typography>
            <Box component="input" inputMode="numeric" value={precio} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrecio(e.target.value)} sx={inputNumeroSx} />
            <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mt: 0.5 }}>
              Se mostrará como {numeros.precio > 0 ? formatCLP(numeros.precio) : '—'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', pt: { md: 2.5 } }}>
            <Box>
              <Toggle activo={destacado} onCambiar={setDestacado} etiqueta="Destacado en la portada" />
              <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mt: 0.5 }}>
                Los destacados salen en la home.
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography component="label" sx={etiquetaSx}>
            Resumen (1–2 líneas para la card del listado)
          </Typography>
          <Box component="textarea" rows={2} value={resumen} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResumen(e.target.value)} sx={{ ...inputSx, resize: 'vertical' }} />
        </Box>

        <Box>
          <Typography component="label" sx={etiquetaSx}>
            Descripción (párrafo de presentación en su página)
          </Typography>
          <Box component="textarea" rows={4} value={descripcion} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescripcion(e.target.value)} sx={{ ...inputSx, resize: 'vertical' }} />
        </Box>

        <BotonGuardar estado={estadoFicha} onClick={guardarFicha} disabled={!fichaValida} />
        {errorFicha && <Typography sx={{ mt: 1, fontSize: '0.85rem', color: '#B4472E' }}>{errorFicha}</Typography>}
      </Seccion>

      {/* ── Galería ── */}
      <Seccion titulo="Fotos del modelo" descripcion="La primera es la portada: se ve en el listado y arriba de su página.">
        <GaleriaEditable
          portada={portada}
          galeria={galeria}
          nombreModelo={nombre}
          onCambiar={({ portada: p, galeria: g }) => {
            setPortada(p);
            setGaleria(g);
          }}
        />
        <BotonGuardar estado={estadoImagenes} onClick={guardarImagenes} />
      </Seccion>

      {/* ── Listas ── */}
      <Seccion titulo="Lo que hace especial al modelo" descripcion="Los puntos fuertes del diseño, en el orden en que quieres mostrarlos.">
        <ListaEditable
          items={caracteristicas}
          onCambiar={setCaracteristicas}
          placeholder="Ej: Living-comedor integrado abierto a la terraza"
          textoBotón="Agregar característica"
        />
      </Seccion>

      <Seccion
        titulo="Qué incluye cada kit"
        descripcion="El Kit Inicial es la base. En el Kit Full solo se anota lo que agrega además de esa base."
      >
        {/* Los kits son casi iguales entre modelos: copiarlos evita
            reescribir catorce líneas cada vez */}
        {otrosModelos.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexWrap: 'wrap',
              p: 1.75,
              mb: 3,
              borderRadius: `${radii.sm}px`,
              bgcolor: 'rgba(32, 78, 95, 0.05)',
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Box aria-hidden sx={{ color: colors.teal, display: 'grid' }}>
              <Copy size={16} />
            </Box>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
              Copiar los kits de otro modelo
            </Typography>
            <Box
              component="select"
              aria-label="Modelo del que copiar los kits"
              defaultValue=""
              disabled={copiando}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                void copiarKitsDe(e.target.value);
                e.target.value = '';
              }}
              sx={{ ...inputSx, width: 'auto', minWidth: 190, cursor: 'pointer' }}
            >
              <option value="">{copiando ? 'Copiando…' : 'Elige un modelo…'}</option>
              {otrosModelos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </Box>
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 1 }}>Kit Inicial</Typography>
          <ListaEditable
            items={kitInicial}
            onCambiar={setKitInicial}
            placeholder="Ej: Muros exteriores – panel SIP 94 mm"
            textoBotón="Agregar ítem al Kit Inicial"
          />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 1 }}>
            Kit Full — solo lo que agrega
          </Typography>
          <ListaEditable
            items={kitFullExtras}
            onCambiar={setKitFullExtras}
            placeholder="Ej: Piso – panel SIP 169 mm: la plataforma estructural"
            textoBotón="Agregar extra del Kit Full"
            ayuda="El primero se muestra destacado. Puedes usar “Título: detalle” para dar una explicación."
          />
        </Box>
        <BotonGuardar estado={estadoListas} onClick={guardarListas} />
      </Seccion>

      {/* ── Vínculo con las cotizaciones ── */}
      <Seccion
        titulo="Cotización llave en mano"
        descripcion="El botón “Cotizar este modelo” usa estas plantillas. Se editan en la sección de Cotizaciones."
      >
        {kitsCotizables.length === 0 ? (
          <Box>
            <Typography sx={{ fontSize: '0.92rem', color: 'text.secondary', mb: 2 }}>
              Este modelo todavía no tiene plantillas de cotización. Puedes duplicar la de un modelo
              parecido desde el panel de cotizaciones y ajustar los precios.
            </Typography>
            <Button variant="outlined" color="primary" size="small" href="/admin/cotizaciones" startIcon={<FileText size={15} />}>
              Ir a Cotizaciones
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {kitsCotizables.map((k) => (
              <Box
                key={k.id}
                component="a"
                href={`/admin/cotizaciones/${k.id}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.75,
                  borderRadius: `${radii.sm}px`,
                  border: '1px solid',
                  borderColor: 'divider',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: `border-color 0.2s ${motionTokens.easeCss}`,
                  '&:hover': { borderColor: colors.teal },
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    {KIT_LABEL[k.kit as KitCotizacion] ?? k.kit}
                  </Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
                    {k.items} partidas cargadas
                  </Typography>
                </Box>
                <Box aria-hidden sx={{ color: colors.muted, display: 'grid' }}>
                  <ExternalLink size={16} />
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Seccion>
    </Box>
  );
}

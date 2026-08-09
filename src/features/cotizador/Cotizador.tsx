'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, FileDown, Loader2, Lock, TriangleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import Button from '@/components/ui/Button';
import CifraAnimada from '@/components/ui/CifraAnimada';
import Reveal from '@/components/ui/Reveal';
import { formatCLP, formatNumber } from '@/lib/format';
import { EASE } from '@/lib/motion';
import { colors, layout, motionTokens, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

import { calcularTotales, seccionesElegidas, subtotalSeccion, totalItem } from './calcular';
import { emitirCotizacionSchema } from './cotizacion.schema';
import {
  KIT_LABEL,
  type KitCotizacion,
  type PlantillaCotizacion,
  type SeccionCotizacion,
} from './cotizacion.types';

interface CotizadorProps {
  modeloNombre: string;
  modeloSlug: string;
  /** Ya ordenadas: Kit Inicial primero, Kit Full después */
  plantillas: PlantillaCotizacion[];
  kitInicialSeleccion: KitCotizacion;
  /**
   * false = la web solo muestra QUÉ incluye cada sección; los valores
   * viven únicamente en el PDF (decisión comercial, fácil de revertir
   * desde la página que monta este componente).
   */
  mostrarPrecios: boolean;
}

/** Solo los datos personales se validan en el cliente; el resto es estado */
const datosSchema = emitirCotizacionSchema.pick({
  nombre: true,
  email: true,
  telefono: true,
  web: true,
});

type DatosInput = z.infer<typeof datosSchema>;

type Estado = 'idle' | 'enviando' | 'ok' | 'error';

const kickerSx = {
  fontFamily: monoFamily,
  fontWeight: 700,
  fontSize: '0.7rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
} as const;

/** Botones de texto de la barra de selección (seleccionar todas / esencial) */
const accionMasivaSx = {
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  borderRadius: `${radii.pill}px`,
  px: 1.5,
  py: 0.6,
  fontFamily: monoFamily,
  fontWeight: 700,
  fontSize: '0.68rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: colors.teal,
  cursor: 'pointer',
  transition: `all 0.2s ${motionTokens.easeCss}`,
  '&:hover:not(:disabled)': { borderColor: colors.teal, bgcolor: 'rgba(32, 78, 95, 0.06)' },
  '&:disabled': { color: colors.muted, cursor: 'default', opacity: 0.5 },
} as const;

const campoSx = {
  width: '100%',
  bgcolor: 'rgba(246, 241, 234, 0.06)',
  border: '1px solid rgba(246, 241, 234, 0.16)',
  borderRadius: `${radii.md}px`,
  color: colors.cream,
  fontFamily: 'inherit',
  fontSize: '0.98rem',
  px: 2,
  py: 1.5,
  outline: 'none',
  transition: `border-color 0.25s ${motionTokens.easeCss}, background-color 0.25s ${motionTokens.easeCss}`,
  '&::placeholder': { color: 'rgba(246, 241, 234, 0.35)' },
  '&:hover': { borderColor: 'rgba(246, 241, 234, 0.3)' },
  '&:focus': { borderColor: colors.tan, bgcolor: 'rgba(246, 241, 234, 0.09)' },
} as const;

/**
 * Checkbox cuadrado real (input nativo estilizado con appearance:none).
 *
 * Es a propósito el control más convencional que existe: la forma
 * cuadrada con marca es el único affordance que todo el mundo reconoce
 * como "esto se marca y se desmarca". Al ser un <input> de verdad
 * hereda teclado, foco y lectores de pantalla sin código extra.
 */
function Casilla({
  id,
  marcada,
  obligatoria,
  onChange,
}: {
  id: string;
  marcada: boolean;
  obligatoria: boolean;
  onChange: () => void;
}) {
  return (
    <Box sx={{ position: 'relative', width: 26, height: 26, flexShrink: 0, display: 'grid', placeItems: 'center' }}>
      <Box
        component="input"
        type="checkbox"
        id={id}
        checked={marcada}
        disabled={obligatoria}
        onChange={onChange}
        sx={{
          appearance: 'none',
          WebkitAppearance: 'none',
          width: 26,
          height: 26,
          m: 0,
          borderRadius: `${radii.sm - 2}px`,
          border: '2px solid',
          borderColor: marcada ? colors.teal : colors.muted,
          bgcolor: marcada ? colors.teal : colors.paper,
          cursor: obligatoria ? 'default' : 'pointer',
          transition: `all 0.2s ${motionTokens.easeCss}`,
          '&:focus-visible': { outline: `3px solid ${colors.tanLight}`, outlineOffset: '2px' },
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          pointerEvents: 'none',
          color: marcada ? colors.cream : 'transparent',
        }}
      >
        {obligatoria ? <Lock size={13} strokeWidth={2.75} /> : <Check size={17} strokeWidth={3} />}
      </Box>
    </Box>
  );
}

/**
 * Card de una sección: la fila completa es la etiqueta del checkbox
 * (área de clic grande), y el chevron va aparte, separado por una línea,
 * para que "seleccionar" y "ver detalle" nunca se confundan.
 */
function SeccionCard({
  seccion,
  incluida,
  mostrarPrecios,
  onToggle,
}: {
  seccion: SeccionCotizacion;
  incluida: boolean;
  mostrarPrecios: boolean;
  onToggle: () => void;
}) {
  const [abierta, setAbierta] = useState(false);
  const inputId = `seccion-${seccion.id}`;

  return (
    <Box
      sx={{
        borderRadius: `${radii.md}px`,
        border: '1px solid',
        borderStyle: incluida ? 'solid' : 'dashed',
        borderColor: incluida ? 'rgba(32, 78, 95, 0.28)' : colors.muted,
        bgcolor: incluida ? 'background.paper' : 'transparent',
        transition: `all 0.25s ${motionTokens.easeCss}`,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
        {/* <label>: clic en cualquier parte de la fila marca/desmarca */}
        <Box
          component="label"
          htmlFor={inputId}
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 1.75,
            p: { xs: 1.75, md: 2 },
            cursor: seccion.obligatoria ? 'default' : 'pointer',
            userSelect: 'none',
            transition: `background-color 0.2s ${motionTokens.easeCss}`,
            '&:hover': seccion.obligatoria ? {} : { bgcolor: 'rgba(32, 78, 95, 0.05)' },
          }}
        >
          <Casilla id={inputId} marcada={incluida} obligatoria={seccion.obligatoria} onChange={onToggle} />

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.97rem',
                lineHeight: 1.25,
                color: incluida ? 'text.primary' : colors.muted,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {seccion.nombre}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
              {seccion.obligatoria
                ? 'Siempre incluida'
                : `${seccion.items.length} ${seccion.items.length === 1 ? 'ítem' : 'ítems'}`}
              {mostrarPrecios && (
                <Box
                  component="span"
                  sx={{
                    fontFamily: monoFamily,
                    fontWeight: 700,
                    color: incluida ? 'text.primary' : colors.muted,
                    ml: 1,
                  }}
                >
                  {formatCLP(subtotalSeccion(seccion))}
                </Box>
              )}
            </Typography>
          </Box>
        </Box>

        {/* Acción secundaria, separada: ver el detalle */}
        <Box
          component="button"
          type="button"
          onClick={() => setAbierta((v) => !v)}
          aria-expanded={abierta}
          aria-label={`Ver los ${seccion.items.length} ítems de ${seccion.nombre}`}
          sx={{
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            px: 1.75,
            border: 0,
            borderLeft: '1px solid',
            borderColor: 'divider',
            bgcolor: 'transparent',
            color: colors.muted,
            cursor: 'pointer',
            transition: `all 0.2s ${motionTokens.easeCss}`,
            '&:hover': { color: colors.teal, bgcolor: 'rgba(32, 78, 95, 0.05)' },
          }}
        >
          <Box
            component="span"
            aria-hidden
            sx={{
              display: 'grid',
              transition: `transform 0.3s ${motionTokens.easeCss}`,
              transform: abierta ? 'rotate(180deg)' : 'none',
            }}
          >
            <ChevronDown size={18} strokeWidth={2.25} />
          </Box>
        </Box>
      </Box>

      {/* Desglose: con precios = tabla; sin precios = qué incluye */}
      <AnimatePresence initial={false}>
        {abierta && (
          <motion.div
            key="detalle"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            style={{ overflow: 'hidden' }}
          >
            <Box sx={{ px: { xs: 1.5, md: 1.75 }, pb: 2 }}>
              <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1.25 }}>
                {mostrarPrecios ? (
                  seccion.items.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr auto', md: '1fr 150px 104px' },
                        gap: { xs: 1, md: 2 },
                        alignItems: 'baseline',
                        py: 0.8,
                        borderBottom: '1px dashed',
                        borderColor: 'divider',
                        '&:last-of-type': { borderBottom: 0 },
                      }}
                    >
                      <Typography sx={{ fontSize: '0.88rem', lineHeight: 1.4 }}>{item.descripcion}</Typography>
                      <Typography
                        sx={{
                          display: { xs: 'none', md: 'block' },
                          fontFamily: monoFamily,
                          fontSize: '0.78rem',
                          color: 'text.secondary',
                          textAlign: 'right',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatNumber(item.cantidad)} {item.unidad} × {formatCLP(item.precioUnitario)}
                      </Typography>
                      <Typography
                        sx={{ fontFamily: monoFamily, fontWeight: 700, fontSize: '0.82rem', textAlign: 'right', whiteSpace: 'nowrap' }}
                      >
                        {formatCLP(totalItem(item))}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 0.7 }}>
                    {seccion.items.map((item) => (
                      <Box key={item.id} component="li" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Box aria-hidden sx={{ color: colors.tanDark, mt: 0.3, flexShrink: 0 }}>
                          <Check size={13} strokeWidth={2.5} />
                        </Box>
                        <Typography sx={{ fontSize: '0.88rem', lineHeight: 1.4, color: 'text.secondary' }}>
                          {item.descripcion}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

/**
 * Configurador de cotización llave en mano: el cliente arma su alcance
 * marcando secciones y descarga un PDF con folio donde va TODO el
 * detalle de partidas y valores. El servidor recalcula siempre.
 */
export default function Cotizador({
  modeloNombre,
  modeloSlug,
  plantillas,
  kitInicialSeleccion,
  mostrarPrecios,
}: CotizadorProps) {
  const [kit, setKit] = useState<KitCotizacion>(kitInicialSeleccion);
  /**
   * Ids de secciones OPCIONALES que el cliente AGREGÓ, por kit.
   * Parte vacío a propósito: la cotización arranca en la base estructural
   * y el cliente va sumando lo que quiere que hagamos por él. Construir
   * hacia arriba se siente mejor que recortar un paquete enorme.
   */
  const [agregadas, setAgregadas] = useState<Record<KitCotizacion, ReadonlySet<string>>>({
    inicial: new Set(),
    full: new Set(),
  });
  const [estado, setEstado] = useState<Estado>('idle');
  const [folio, setFolio] = useState<string | null>(null);

  const plantilla = plantillas.find((p) => p.kit === kit) ?? plantillas[0];

  const marcadaIds = agregadas[plantilla.kit];

  const elegidas = useMemo(() => seccionesElegidas(plantilla, marcadaIds), [plantilla, marcadaIds]);
  const totales = useMemo(() => calcularTotales(plantilla, elegidas), [plantilla, elegidas]);

  const excluidas = useMemo(
    () => plantilla.secciones.filter((s) => !s.obligatoria && !marcadaIds.has(s.id)),
    [plantilla, marcadaIds],
  );
  const esCompleta = excluidas.length === 0;
  const obligatorias = useMemo(
    () => plantilla.secciones.filter((s) => s.obligatoria).length,
    [plantilla],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosInput>({
    resolver: zodResolver(datosSchema),
    defaultValues: { nombre: '', email: '', telefono: '', web: '' },
  });

  function toggleSeccion(id: string) {
    setAgregadas((prev) => {
      const dentro = new Set(prev[plantilla.kit]);
      if (dentro.has(id)) {
        dentro.delete(id);
      } else {
        dentro.add(id);
      }
      return { ...prev, [plantilla.kit]: dentro };
    });
  }

  /** Agrega todas las secciones opcionales: cotización llave en mano completa */
  function marcarTodas() {
    setAgregadas((prev) => ({
      ...prev,
      [plantilla.kit]: new Set(plantilla.secciones.filter((s) => !s.obligatoria).map((s) => s.id)),
    }));
  }

  /** Vuelve al punto de partida: solo la base estructural */
  function soloLaBase() {
    setAgregadas((prev) => ({ ...prev, [plantilla.kit]: new Set<string>() }));
  }

  async function onSubmit(datos: DatosInput) {
    setEstado('enviando');
    try {
      const respuesta = await fetch('/api/cotizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modeloSlug,
          kit: plantilla.kit,
          seccionIds: [...marcadaIds],
          ...datos,
        }),
      });

      if (!respuesta.ok) {
        setEstado('error');
        return;
      }

      const blob = await respuesta.blob();
      const nuevoFolio = respuesta.headers.get('X-Folio');

      // Éxito ANTES de gatillar la descarga: si el navegador muestra su
      // diálogo de guardado, la UI ya quedó consistente.
      setFolio(nuevoFolio);
      setEstado('ok');

      const urlBlob = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = urlBlob;
      enlace.download = `Cotizacion-MundoSIP-${nuevoFolio ?? 'documento'}-${modeloSlug}.pdf`;
      document.body.append(enlace);
      enlace.click();
      enlace.remove();
      setTimeout(() => URL.revokeObjectURL(urlBlob), 4000);
    } catch {
      setEstado('error');
    }
  }

  const tieneAmbosKits = plantillas.length > 1;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 400px' },
        gap: { xs: 4, lg: 5 },
        alignItems: 'start',
      }}
    >
      {/* ── Columna izquierda: kit + secciones ── */}
      <Box>
        {tieneAmbosKits && (
          <Reveal y={18}>
            <Box
              sx={{
                display: 'inline-flex',
                p: 0.5,
                mb: 1.5,
                borderRadius: `${radii.pill}px`,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              {plantillas.map((p) => {
                const activo = p.kit === plantilla.kit;
                return (
                  <Box
                    key={p.kit}
                    component="button"
                    type="button"
                    onClick={() => setKit(p.kit)}
                    aria-pressed={activo}
                    sx={{
                      border: 0,
                      cursor: 'pointer',
                      px: { xs: 2.25, md: 3 },
                      py: 1.1,
                      borderRadius: `${radii.pill}px`,
                      fontFamily: monoFamily,
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: activo ? colors.cream : colors.muted,
                      bgcolor: activo ? colors.teal : 'transparent',
                      transition: `all 0.3s ${motionTokens.easeCss}`,
                    }}
                  >
                    {KIT_LABEL[p.kit]}
                  </Box>
                );
              })}
            </Box>
          </Reveal>
        )}

        <Reveal y={14} delay={0.05}>
          <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary', mb: 3, maxWidth: 640 }}>
            Tu cotización parte con la base estructural de la casa{' '}
            {plantilla.kit === 'full'
              ? 'con piso de panel SIP sobre apoyos de hormigón.'
              : 'sobre radier de hormigón, porque el Kit Inicial no trae piso.'}{' '}
            <Box component="strong" sx={{ color: 'text.primary' }}>
              Desde ahí, agrega todo lo que quieras que hagamos por ti
            </Box>{' '}
            — revestimientos, instalaciones, terminaciones — y llega hasta donde tú decidas.
          </Typography>
        </Reveal>

        {/* Barra de selección: instrucción explícita + contador + acciones
            masivas. Es la señal más clara de que la lista de abajo se marca. */}
        <Reveal y={12} delay={0.08}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: 1.5,
              mb: 1.5,
              pb: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.02rem', lineHeight: 1.3 }}>
                Selecciona los ítems que deseas agregar a la cotización
              </Typography>
              <Typography sx={{ ...kickerSx, fontSize: '0.7rem', color: colors.tanDark, mt: 0.6 }}>
                {elegidas.length} de {plantilla.secciones.length} secciones seleccionadas
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box
                component="button"
                type="button"
                onClick={marcarTodas}
                disabled={esCompleta}
                sx={accionMasivaSx}
              >
                Seleccionar todos
              </Box>
              <Box
                component="button"
                type="button"
                onClick={soloLaBase}
                disabled={elegidas.length === obligatorias}
                sx={accionMasivaSx}
              >
                Solo la base
              </Box>
            </Box>
          </Box>
        </Reveal>

        {/* Grilla compacta: 2 columnas en escritorio para acortar el scroll */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 1.25,
            alignItems: 'start',
          }}
        >
          {plantilla.secciones.map((seccion, i) => (
            <Reveal key={seccion.id} y={16} delay={Math.min(i * 0.03, 0.24)}>
              <SeccionCard
                seccion={seccion}
                incluida={seccion.obligatoria || marcadaIds.has(seccion.id)}
                mostrarPrecios={mostrarPrecios}
                onToggle={() => toggleSeccion(seccion.id)}
              />
            </Reveal>
          ))}
        </Box>
      </Box>

      {/* ── Columna derecha: resumen sticky + datos + descarga ── */}
      <Box
        sx={{
          position: { lg: 'sticky' },
          top: { lg: `${layout.headerHeight.desktop + 24}px` },
        }}
      >
        <Reveal y={24} delay={0.1}>
          <Box
            sx={{
              position: 'relative',
              borderRadius: `${radii.lg}px`,
              bgcolor: colors.tealDeep,
              color: colors.cream,
              p: { xs: 3, md: 3.5 },
              boxShadow: '0 34px 80px -34px rgba(13, 33, 41, 0.55)',
              overflow: 'hidden',
            }}
          >
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(120% 80% at 100% 0%, rgba(185, 138, 78, 0.18) 0%, transparent 55%)',
                pointerEvents: 'none',
              }}
            />

            <Box sx={{ position: 'relative' }}>
              <Typography component="p" sx={{ ...kickerSx, color: colors.tanLight, mb: 0.75 }}>
                Tu cotización
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', mb: 1.25 }}>
                {modeloNombre} · {KIT_LABEL[plantilla.kit]}
              </Typography>

              {/* Alcance: solo es "llave en mano" si va todo */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  mb: 2.25,
                  px: 1.5,
                  py: 0.6,
                  borderRadius: `${radii.pill}px`,
                  bgcolor: esCompleta ? 'rgba(185, 138, 78, 0.18)' : 'rgba(246, 241, 234, 0.08)',
                  border: `1px solid ${esCompleta ? colors.tan : 'rgba(246, 241, 234, 0.2)'}`,
                }}
              >
                <Typography
                  component="span"
                  sx={{ ...kickerSx, fontSize: '0.62rem', letterSpacing: '0.14em', color: esCompleta ? colors.tanLight : 'rgba(246, 241, 234, 0.75)' }}
                >
                  {esCompleta ? 'Llave en mano completa' : `Alcance a tu medida · ${elegidas.length} de ${plantilla.secciones.length} secciones`}
                </Typography>
              </Box>

              {/* En el mínimo invita a sumar; ya avanzado, confirma qué falta */}
              {!esCompleta && (
                <Typography sx={{ fontSize: '0.88rem', color: 'rgba(246, 241, 234, 0.7)', mb: 2, lineHeight: 1.5 }}>
                  {elegidas.length === obligatorias
                    ? 'Agrega las secciones que quieras y tu cotización se arma al instante.'
                    : `No incluye: ${
                        excluidas.length <= 3
                          ? excluidas.map((s) => s.nombre).join(', ')
                          : `${excluidas.length} secciones`
                      }.`}
                </Typography>
              )}

              {mostrarPrecios ? (
                <>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                      <Typography sx={{ fontSize: '0.92rem', color: 'rgba(246, 241, 234, 0.75)' }}>
                        Valor neto
                      </Typography>
                      <Typography sx={{ fontFamily: monoFamily, fontSize: '0.92rem' }}>
                        {formatCLP(totales.neto)}
                      </Typography>
                    </Box>
                    {totales.descuento > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                        <Typography sx={{ fontSize: '0.92rem', color: colors.tanLight }}>
                          {plantilla.descuentoNombre ?? 'Descuento'} ({formatNumber(plantilla.descuentoPct)}%)
                        </Typography>
                        <Typography sx={{ fontFamily: monoFamily, fontSize: '0.92rem', color: colors.tanLight }}>
                          −{formatCLP(totales.descuento)}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                      <Typography sx={{ fontSize: '0.92rem', color: 'rgba(246, 241, 234, 0.75)' }}>
                        IVA ({formatNumber(plantilla.ivaPct)}%)
                      </Typography>
                      <Typography sx={{ fontFamily: monoFamily, fontSize: '0.92rem' }}>
                        {formatCLP(totales.iva)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ borderTop: '1px solid rgba(246, 241, 234, 0.18)', pt: 2, mb: 3 }}>
                    <Typography component="p" sx={{ ...kickerSx, fontSize: '0.64rem', color: 'rgba(246, 241, 234, 0.6)', mb: 0.5 }}>
                      Total estimado
                    </Typography>
                    <Typography
                      component="p"
                      sx={{
                        fontFamily: monoFamily,
                        fontWeight: 700,
                        fontSize: { xs: '1.7rem', md: '1.9rem' },
                        lineHeight: 1.1,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      <CifraAnimada valor={totales.total} />
                    </Typography>
                  </Box>
                </>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    mb: 3,
                    p: 2,
                    borderRadius: `${radii.md}px`,
                    bgcolor: 'rgba(246, 241, 234, 0.06)',
                    border: '1px solid rgba(246, 241, 234, 0.14)',
                  }}
                >
                  <Box aria-hidden sx={{ color: colors.tanLight, mt: 0.25, flexShrink: 0 }}>
                    <FileDown size={17} strokeWidth={2.25} />
                  </Box>
                  <Typography sx={{ fontSize: '0.9rem', color: 'rgba(246, 241, 234, 0.82)', lineHeight: 1.55 }}>
                    Tu PDF llega con el <strong>desglose completo</strong>: cada partida, su valor,
                    descuentos e IVA, según lo que marcaste.
                  </Typography>
                </Box>
              )}

              {/* Estado OK: cotización emitida */}
              <AnimatePresence mode="wait" initial={false}>
                {estado === 'ok' ? (
                  <motion.div
                    key="ok"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1.5,
                        p: 2,
                        borderRadius: `${radii.md}px`,
                        bgcolor: 'rgba(185, 138, 78, 0.16)',
                        border: `1px solid ${colors.tan}`,
                      }}
                    >
                      <Box aria-hidden sx={{ color: colors.tanLight, mt: 0.25 }}>
                        <Check size={18} strokeWidth={2.5} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 0.5 }}>
                          Cotización {folio} descargada
                        </Typography>
                        <Typography sx={{ fontSize: '0.88rem', color: 'rgba(246, 241, 234, 0.8)', lineHeight: 1.5 }}>
                          Revisa tu carpeta de descargas. También quedó registrada con nuestro
                          equipo: te contactaremos para acompañarte en el siguiente paso.
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                      <Box>
                        <Box component="input" type="text" placeholder="Tu nombre" aria-label="Nombre" sx={campoSx} {...register('nombre')} />
                        {errors.nombre && (
                          <Typography sx={{ mt: 0.5, fontSize: '0.82rem', color: '#F0A98A' }}>
                            {errors.nombre.message}
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <Box component="input" type="email" placeholder="tu@correo.cl" aria-label="Email" sx={campoSx} {...register('email')} />
                        {errors.email && (
                          <Typography sx={{ mt: 0.5, fontSize: '0.82rem', color: '#F0A98A' }}>
                            {errors.email.message}
                          </Typography>
                        )}
                      </Box>
                      <Box component="input" type="tel" placeholder="+56 9 … (opcional)" aria-label="Teléfono (opcional)" sx={campoSx} {...register('telefono')} />
                      {/* Honeypot anti-bots: invisible para personas */}
                      <Box
                        component="input"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden
                        sx={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
                        {...register('web')}
                      />
                    </Box>

                    <Button
                      type="submit"
                      variant="contained"
                      color="secondary"
                      size="large"
                      disabled={estado === 'enviando'}
                      fullWidth
                      startIcon={
                        estado === 'enviando' ? (
                          <Box
                            component="span"
                            aria-hidden
                            sx={{
                              display: 'inline-flex',
                              animation: 'giro 1s linear infinite',
                              '@keyframes giro': { to: { transform: 'rotate(360deg)' } },
                            }}
                          >
                            <Loader2 size={18} />
                          </Box>
                        ) : (
                          <FileDown size={18} />
                        )
                      }
                    >
                      {estado === 'enviando' ? 'Generando tu PDF…' : 'Cotizar y descargar PDF'}
                    </Button>

                    {estado === 'error' && (
                      <Box sx={{ display: 'flex', gap: 1, mt: 1.5, alignItems: 'flex-start' }}>
                        <Box aria-hidden sx={{ color: '#F0A98A', mt: 0.2 }}>
                          <TriangleAlert size={15} />
                        </Box>
                        <Typography sx={{ fontSize: '0.85rem', color: '#F0A98A', lineHeight: 1.45 }}>
                          No pudimos generar tu cotización. Inténtalo de nuevo o escríbenos por WhatsApp.
                        </Typography>
                      </Box>
                    )}

                    <Typography sx={{ mt: 1.75, fontSize: '0.78rem', color: 'rgba(246, 241, 234, 0.55)', lineHeight: 1.5 }}>
                      Cotización referencial con validez de {plantilla.validezDias} días hábiles. El valor
                      definitivo se confirma con visita a terreno.
                    </Typography>
                  </motion.form>
                )}
              </AnimatePresence>
            </Box>
          </Box>
        </Reveal>
      </Box>
    </Box>
  );
}

'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, TriangleAlert } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import Button from '@/components/ui/Button';
import { EASE } from '@/lib/motion';
import { contactoSchema, INTERESES, type ContactoInput } from '@/features/contacto/contacto.schema';
import { colors, motionTokens, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

type Estado = 'idle' | 'enviando' | 'ok' | 'error';

const labelSx = {
  fontFamily: monoFamily,
  fontWeight: 700,
  fontSize: '0.7rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'rgba(246, 241, 234, 0.7)',
  mb: 1,
  display: 'block',
} as const;

/** Input y textarea comparten el mismo tratamiento sobre fondo oscuro */
const campoSx = {
  width: '100%',
  bgcolor: 'rgba(246, 241, 234, 0.06)',
  border: '1px solid rgba(246, 241, 234, 0.16)',
  borderRadius: `${radii.md}px`,
  color: colors.cream,
  fontFamily: 'inherit',
  fontSize: '1rem',
  px: 2,
  py: 1.75,
  outline: 'none',
  transition: `border-color 0.25s ${motionTokens.easeCss}, background-color 0.25s ${motionTokens.easeCss}`,
  '&::placeholder': { color: 'rgba(246, 241, 234, 0.35)' },
  '&:hover': { borderColor: 'rgba(246, 241, 234, 0.3)' },
  '&:focus': { borderColor: colors.tan, bgcolor: 'rgba(246, 241, 234, 0.09)' },
} as const;

function MensajeError({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <Typography component="p" sx={{ mt: 0.75, fontSize: '0.85rem', color: '#F0A98A' }}>
      {children}
    </Typography>
  );
}

/**
 * Formulario de contacto: valida en el cliente con el mismo esquema zod
 * que usa la API, y muestra estados de envío, éxito y error.
 */
export default function ContactForm() {
  const [estado, setEstado] = useState<Estado>('idle');
  const [errorServidor, setErrorServidor] = useState<string>('');
  const searchParams = useSearchParams();

  // Si llegan desde "Cotizar este panel" o un modelo, preseleccionamos el interés
  const interesInicial: ContactoInput['interes'] = searchParams.get('panel')
    ? 'paneles'
    : searchParams.get('modelo')
      ? 'modelo'
      : 'modelo';

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<ContactoInput>({
    resolver: zodResolver(contactoSchema),
    defaultValues: { interes: interesInicial, nombre: '', email: '', telefono: '', mensaje: '' },
  });

  // useSearchParams resuelve después del primer render, así que el
  // defaultValue no basta: reaplicamos el interés cuando ya lo conocemos.
  useEffect(() => {
    setValue('interes', interesInicial);
  }, [interesInicial, setValue]);

  // useWatch (y no watch()) para que el React Compiler pueda memoizar
  const interesActual = useWatch({ control, name: 'interes' });

  const onSubmit = async (datos: ContactoInput) => {
    setEstado('enviando');
    setErrorServidor('');
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setErrorServidor(json.error ?? 'No pudimos enviar tu mensaje.');
        setEstado('error');
        return;
      }
      reset();
      setEstado('ok');
    } catch {
      setErrorServidor('Hubo un problema de conexión. Inténtalo de nuevo.');
      setEstado('error');
    }
  };

  if (estado === 'ok') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <Box sx={{ textAlign: 'center', py: { xs: 6, md: 8 } }}>
          <Box
            aria-hidden
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              bgcolor: colors.tan,
              color: colors.tealNight,
              mx: 'auto',
              mb: 3,
            }}
          >
            <Check size={30} strokeWidth={2.5} />
          </Box>
          <Typography variant="h3" component="p" sx={{ mb: 1.5 }}>
            ¡Mensaje enviado!
          </Typography>
          <Typography sx={{ color: 'rgba(246, 241, 234, 0.75)', maxWidth: 420, mx: 'auto', mb: 3.5 }}>
            Te responderemos dentro de las próximas 24 horas hábiles. Si tu proyecto es urgente,
            escríbenos por WhatsApp.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="secondary"
              href="https://wa.me/56940367867"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ir a WhatsApp
            </Button>
            <Button variant="outlined" onDark onClick={() => setEstado('idle')}>
              Enviar otro mensaje
            </Button>
          </Box>
        </Box>
      </motion.div>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Honeypot invisible para bots */}
      <Box
        component="input"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        {...register('web')}
        sx={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
        <Box>
          <Box component="label" htmlFor="nombre" sx={labelSx}>
            Nombre *
          </Box>
          <Box component="input" id="nombre" placeholder="Tu nombre" {...register('nombre')} sx={campoSx} />
          <MensajeError>{errors.nombre?.message}</MensajeError>
        </Box>
        <Box>
          <Box component="label" htmlFor="telefono" sx={labelSx}>
            Teléfono
          </Box>
          <Box component="input" id="telefono" placeholder="+56 9 ..." {...register('telefono')} sx={campoSx} />
          <MensajeError>{errors.telefono?.message}</MensajeError>
        </Box>
      </Box>

      <Box>
        <Box component="label" htmlFor="email" sx={labelSx}>
          Correo *
        </Box>
        <Box component="input" id="email" type="email" placeholder="tucorreo@ejemplo.cl" {...register('email')} sx={campoSx} />
        <MensajeError>{errors.email?.message}</MensajeError>
      </Box>

      <Box>
        <Box component="span" sx={labelSx}>
          ¿Qué te interesa? *
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
          {INTERESES.map((opcion) => {
            const activo = interesActual === opcion.valor;
            return (
            <Box
              key={opcion.valor}
              component="label"
              sx={{
                cursor: 'pointer',
                px: 2,
                py: 1.1,
                borderRadius: `${radii.pill}px`,
                border: '1px solid',
                fontSize: '0.92rem',
                transition: `all 0.25s ${motionTokens.easeCss}`,
                bgcolor: activo ? colors.tan : 'transparent',
                borderColor: activo ? colors.tan : 'rgba(246, 241, 234, 0.2)',
                color: activo ? colors.tealNight : 'rgba(246, 241, 234, 0.8)',
                fontWeight: activo ? 700 : 400,
                '&:hover': { borderColor: activo ? colors.tan : 'rgba(246, 241, 234, 0.45)' },
                '&:has(input:focus-visible)': { outline: `2px solid ${colors.tanLight}`, outlineOffset: 2 },
              }}
            >
              <Box
                component="input"
                type="radio"
                value={opcion.valor}
                {...register('interes')}
                // checked explícito: setValue no toca el DOM y sin esto el
                // lector de pantalla no anuncia la opción preseleccionada
                checked={activo}
                sx={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
              />
              {opcion.label}
            </Box>
            );
          })}
        </Box>
        <MensajeError>{errors.interes?.message}</MensajeError>
      </Box>

      <Box>
        <Box component="label" htmlFor="mensaje" sx={labelSx}>
          Cuéntanos de tu proyecto *
        </Box>
        <Box
          component="textarea"
          id="mensaje"
          rows={5}
          placeholder="Superficie aproximada, comuna donde construirás, si ya tienes planos o terreno…"
          {...register('mensaje')}
          sx={{ ...campoSx, resize: 'vertical', minHeight: 130 }}
        />
        <MensajeError>{errors.mensaje?.message}</MensajeError>
      </Box>

      <AnimatePresence>
        {estado === 'error' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{ overflow: 'hidden' }}
          >
            <Box
              role="alert"
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                p: 2,
                borderRadius: `${radii.md}px`,
                bgcolor: 'rgba(240, 169, 138, 0.12)',
                border: '1px solid rgba(240, 169, 138, 0.4)',
              }}
            >
              <Box aria-hidden sx={{ color: '#F0A98A', mt: 0.25, flexShrink: 0 }}>
                <TriangleAlert size={18} />
              </Box>
              <Typography sx={{ fontSize: '0.95rem', color: 'rgba(246, 241, 234, 0.9)' }}>
                {errorServidor}
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          size="large"
          disabled={estado === 'enviando'}
          arrow={estado !== 'enviando'}
          startIcon={
            estado === 'enviando' ? (
              <Box
                component={motion.span}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                sx={{ display: 'grid' }}
              >
                <Loader2 size={18} />
              </Box>
            ) : undefined
          }
        >
          {estado === 'enviando' ? 'Enviando…' : 'Enviar mensaje'}
        </Button>
        <Typography sx={{ fontSize: '0.85rem', color: 'rgba(246, 241, 234, 0.55)' }}>
          Te respondemos dentro de 24 horas hábiles.
        </Typography>
      </Box>
    </Box>
  );
}

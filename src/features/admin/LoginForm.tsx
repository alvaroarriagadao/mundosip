'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Loader2, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import Button from '@/components/ui/Button';
import { colors, motionTokens, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

const campoSx = {
  width: '100%',
  bgcolor: 'rgba(246, 241, 234, 0.06)',
  border: '1px solid rgba(246, 241, 234, 0.16)',
  borderRadius: `${radii.md}px`,
  color: colors.cream,
  fontFamily: 'inherit',
  fontSize: '1rem',
  px: 2,
  py: 1.6,
  outline: 'none',
  transition: `border-color 0.25s ${motionTokens.easeCss}`,
  '&::placeholder': { color: 'rgba(246, 241, 234, 0.35)' },
  '&:focus': { borderColor: colors.tan },
} as const;

export default function LoginForm() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // React 19: el form llama esta acción con su FormData (sin manejar eventos)
  async function onSubmit(datos: FormData) {
    setEnviando(true);
    setError(null);

    try {
      const respuesta = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: datos.get('usuario'), clave: datos.get('clave') }),
      });
      if (!respuesta.ok) {
        const cuerpo = (await respuesta.json().catch(() => null)) as { error?: string } | null;
        setError(cuerpo?.error ?? 'No pudimos iniciar sesión.');
        setEnviando(false);
        return;
      }
      router.replace('/admin/cotizaciones');
      router.refresh();
    } catch {
      setError('No pudimos iniciar sesión. Revisa tu conexión.');
      setEnviando(false);
    }
  }

  return (
    <Box
      component="form"
      action={onSubmit}
      sx={{
        width: '100%',
        maxWidth: 400,
        mx: 'auto',
        p: { xs: 3, md: 4 },
        borderRadius: `${radii.lg}px`,
        bgcolor: colors.tealDeep,
        color: colors.cream,
        boxShadow: '0 34px 80px -34px rgba(13, 33, 41, 0.55)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box
          aria-hidden
          sx={{
            width: 38,
            height: 38,
            borderRadius: `${radii.sm}px`,
            display: 'grid',
            placeItems: 'center',
            bgcolor: colors.tan,
            color: colors.tealNight,
          }}
        >
          <Lock size={18} strokeWidth={2.25} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.2 }}>Panel MundoSIP</Typography>
          <Typography
            sx={{ fontFamily: monoFamily, fontSize: '0.7rem', letterSpacing: '0.18em', color: 'rgba(246, 241, 234, 0.6)' }}
          >
            SOLO EQUIPO
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2.5 }}>
        <Box component="input" name="usuario" type="text" placeholder="Usuario" autoComplete="username" required sx={campoSx} />
        <Box component="input" name="clave" type="password" placeholder="Contraseña" autoComplete="current-password" required sx={campoSx} />
      </Box>

      <Button type="submit" variant="contained" color="secondary" fullWidth size="large" disabled={enviando}>
        {enviando ? (
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="span"
              aria-hidden
              sx={{ display: 'inline-flex', animation: 'giro 1s linear infinite', '@keyframes giro': { to: { transform: 'rotate(360deg)' } } }}
            >
              <Loader2 size={17} />
            </Box>
            Entrando…
          </Box>
        ) : (
          'Entrar'
        )}
      </Button>

      {error && (
        <Typography sx={{ mt: 1.75, fontSize: '0.88rem', color: '#F0A98A', textAlign: 'center' }}>{error}</Typography>
      )}
    </Box>
  );
}

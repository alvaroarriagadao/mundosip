import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Image from 'next/image';

import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import type { Proyecto } from '@/features/proyectos/proyecto.types';
import { colors, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

/** Hero del proyecto: imagen de portada a pantalla + banda de especificaciones */
export default function ProjectHero({ proyecto }: { proyecto: Proyecto }) {
  const specs = [
    { label: 'Superficie', value: `${proyecto.superficieM2} m²` },
    { label: 'Año diseño', value: `${proyecto.anoDiseno}` },
    { label: 'Año construcción', value: `${proyecto.anoConstruccion}` },
    { label: 'Ubicación', value: proyecto.ubicacion },
  ];

  return (
    <Box component="header">
      <Box sx={{ position: 'relative', height: { xs: '68svh', md: '78svh' }, bgcolor: colors.tealDeep }}>
        <Image
          src={proyecto.portada.url}
          alt={proyecto.portada.alt}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(13, 33, 41, 0.5) 0%, rgba(13, 33, 41, 0.08) 40%, rgba(13, 33, 41, 0.55) 100%)',
          }}
        />
        <Box sx={{ position: 'absolute', inset: 'auto 0 0 0', pb: { xs: 10, md: 12 }, color: colors.cream }}>
          <Container>
            <Eyebrow sx={{ color: colors.tanLight }}>
              Proyecto · Región de {proyecto.region.nombre}
              {proyecto.estado === 'en_proceso' && ' · En construcción'}
            </Eyebrow>
            <Typography variant="h1" component="h1" sx={{ mt: 1.5, maxWidth: '16ch' }}>
              {proyecto.nombre}
            </Typography>
          </Container>
        </Box>
      </Box>

      {/* Banda de especificaciones montada sobre el hero */}
      <Container sx={{ position: 'relative', zIndex: 2, mt: { xs: -5, md: -6 } }}>
        <Box
          sx={{
            bgcolor: colors.tealDeep,
            color: colors.cream,
            borderRadius: `${radii.lg}px`,
            px: { xs: 3, md: 6 },
            py: { xs: 3, md: 4 },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1.6fr' },
            gap: { xs: 3, md: 4 },
            boxShadow: '0 30px 70px -30px rgba(13, 33, 41, 0.45)',
          }}
        >
          {specs.map((spec) => (
            <Box key={spec.label}>
              <Typography
                component="p"
                sx={{
                  fontFamily: monoFamily,
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  color: colors.tanLight,
                  mb: 1,
                }}
              >
                {spec.label}
              </Typography>
              <Typography component="p" sx={{ fontWeight: 700, fontSize: { xs: '1rem', md: '1.15rem' }, lineHeight: 1.3 }}>
                {spec.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

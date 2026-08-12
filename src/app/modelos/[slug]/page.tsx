import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import GalleryMosaic from '@/components/ui/GalleryMosaic';
import Reveal from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';
import { esAdmin } from '@/features/admin/auth';
import ModeloCaracteristicas from '@/features/modelos/ModeloCaracteristicas';
import ModeloHero from '@/features/modelos/ModeloHero';
import ModeloKits from '@/features/modelos/ModeloKits';
import { getModeloPorSlug } from '@/features/modelos/modelos.db';
import { formatCLP } from '@/lib/format';
import { colors, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

interface ModeloPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

// El contenido lo edita el equipo en /admin/modelos: siempre fresco
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: ModeloPageProps): Promise<Metadata> {
  const { slug } = await params;
  const modelo = await getModeloPorSlug(slug);
  if (!modelo) return {};
  return {
    title: `${modelo.nombre} · ${modelo.superficieM2} m²`,
    description: modelo.resumen,
  };
}

/**
 * Plantilla FIJA de ficha de modelo. Todo el contenido viene de la base
 * de datos: un modelo nuevo aparece aquí sin tocar código.
 *
 * Con `?preview=1` y sesión de admin también muestra borradores, para
 * revisar la ficha real antes de publicarla.
 */
export default async function ModeloPage({ params, searchParams }: ModeloPageProps) {
  const [{ slug }, { preview }] = await Promise.all([params, searchParams]);

  // El borrador solo se revela a alguien con sesión abierta en el panel
  const quierePreview = preview === '1';
  const puedeVerBorradores = quierePreview && (await esAdmin());
  const modelo = await getModeloPorSlug(slug, puedeVerBorradores);

  if (!modelo) notFound();

  return (
    <>
      {!modelo.publicado && (
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1200,
            bgcolor: colors.tan,
            color: colors.tealNight,
            px: 2,
            py: 1.25,
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>
            Vista previa · este modelo aún no está publicado
          </Typography>
          <Box
            component="a"
            href={`/admin/modelos/${modelo.id}`}
            sx={{
              display: 'inline-block',
              mt: 0.25,
              fontSize: '0.85rem',
              color: colors.tealNight,
              borderRadius: `${radii.sm}px`,
            }}
          >
            Volver a editarlo
          </Box>
        </Box>
      )}

      <ModeloHero modelo={modelo} />
      <ModeloCaracteristicas nombre={modelo.nombre} caracteristicas={modelo.caracteristicas} />
      <ModeloKits modeloSlug={modelo.slug} kitInicial={modelo.kitInicial} kitFullExtras={modelo.kitFullExtras} />
      <GalleryMosaic nombre={modelo.nombre} imagenes={modelo.galeria} titulo="Recorre el modelo." />

      {/* Cierre con precio y CTA */}
      <Section tone="dark" sx={{ py: { xs: 8, md: 11 } }}>
        <Container sx={{ textAlign: 'center' }}>
          <Reveal>
            <Typography
              component="p"
              sx={{
                fontFamily: monoFamily,
                fontWeight: 700,
                fontSize: '0.8rem',
                letterSpacing: '0.24em',
                color: colors.tanLight,
                mb: 1.5,
              }}
            >
              {modelo.nombre.toUpperCase()} · KIT DESDE {formatCLP(modelo.precioDesdeCLP)}
            </Typography>
            <Typography variant="h2" sx={{ mb: 4, mx: 'auto', maxWidth: '18ch' }}>
              Tu {modelo.nombre} puede estar en obra en semanas.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" color="secondary" size="large" arrow href="/contacto">
                Cotizar {modelo.nombre}
              </Button>
              <Button variant="outlined" size="large" onDark href="/modelos">
                Ver otros modelos
              </Button>
            </Box>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}

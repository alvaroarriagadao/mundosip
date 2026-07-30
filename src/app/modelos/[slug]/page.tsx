import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import GalleryMosaic from '@/components/ui/GalleryMosaic';
import Reveal from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';
import ModeloCaracteristicas from '@/features/modelos/ModeloCaracteristicas';
import ModeloHero from '@/features/modelos/ModeloHero';
import ModeloKits from '@/features/modelos/ModeloKits';
import { formatCLP } from '@/lib/format';
import { getModeloBySlug, getModelos } from '@/data/repository';
import { colors } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

interface ModeloPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const modelos = await getModelos();
  return modelos.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: ModeloPageProps): Promise<Metadata> {
  const { slug } = await params;
  const modelo = await getModeloBySlug(slug);
  if (!modelo) return {};
  return {
    title: `${modelo.nombre} · ${modelo.superficieM2} m²`,
    description: modelo.resumen,
  };
}

/**
 * Plantilla FIJA de ficha de modelo. Todo el contenido viene del
 * repositorio: un modelo nuevo aparece aquí sin tocar código.
 */
export default async function ModeloPage({ params }: ModeloPageProps) {
  const { slug } = await params;
  const modelo = await getModeloBySlug(slug);

  if (!modelo) notFound();

  return (
    <>
      <ModeloHero modelo={modelo} />
      <ModeloCaracteristicas nombre={modelo.nombre} caracteristicas={modelo.caracteristicas} />
      <ModeloKits kitInicial={modelo.kitInicial} kitFullExtras={modelo.kitFullExtras} />
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

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Section from '@/components/ui/Section';
import Cotizador from '@/features/cotizador/Cotizador';
import type { KitCotizacion } from '@/features/cotizador/cotizacion.types';
import { getPlantillasDeModelo } from '@/features/cotizador/cotizador.db';
import { getModeloBySlug } from '@/data/repository';

interface CotizarPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ kit?: string }>;
}

// Los precios salen de la DB y deben estar siempre frescos
export const dynamic = 'force-dynamic';

/**
 * Interruptor comercial: false = la web solo muestra qué incluye cada
 * sección y el desglose de valores viaja únicamente en el PDF emitido.
 * Cambiar a true para volver a mostrar precios en vivo en la página.
 */
const MOSTRAR_PRECIOS = false;

/** Kit Inicial siempre a la izquierda del toggle */
const ORDEN_KIT: Record<KitCotizacion, number> = { inicial: 0, full: 1 };

export async function generateMetadata({ params }: CotizarPageProps): Promise<Metadata> {
  const { slug } = await params;
  const modelo = await getModeloBySlug(slug);
  if (!modelo) return {};
  return {
    title: `Cotizar ${modelo.nombre} llave en mano`,
    description: `Arma tu cotización llave en mano del modelo ${modelo.nombre}: elige las partidas que necesitas y descarga tu PDF al instante.`,
  };
}

/**
 * Cotizador llave en mano por modelo. El cliente arma su cotización
 * marcando secciones y descarga un PDF con folio; cada emisión queda
 * registrada como lead.
 */
export default async function CotizarPage({ params, searchParams }: CotizarPageProps) {
  const [{ slug }, { kit }] = await Promise.all([params, searchParams]);
  const modelo = await getModeloBySlug(slug);
  if (!modelo) notFound();

  // Si la base no responde, la página degrada al bloque "escríbenos" en vez
  // de reventar: el cliente igual llega a contacto y no perdemos el lead.
  const plantillas = await getPlantillasDeModelo(slug)
    .then((lista) => [...lista].sort((a, b) => ORDEN_KIT[a.kit] - ORDEN_KIT[b.kit]))
    .catch((error) => {
      console.error('[cotizar] no se pudieron cargar las plantillas', error);
      return [];
    });
  const kitInicialSeleccion: KitCotizacion = kit === 'full' || kit === 'inicial' ? kit : 'inicial';

  return (
    <Section tone="paper" belowHeader>
      <Container>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' },
            gap: { xs: 3, md: 10 },
            alignItems: 'start',
            mb: { xs: 4, md: 6 },
          }}
        >
          <Box>
            <Eyebrow>Cotizador llave en mano</Eyebrow>
            <Typography variant="h1" component="h1" sx={{ mt: 2, maxWidth: '14ch' }}>
              Arma tu {modelo.nombre}.
            </Typography>
          </Box>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary', maxWidth: 460, alignSelf: 'end' }}>
            Elige tu kit, marca las secciones que necesitas y descarga al instante tu cotización en
            PDF — con folio y el desglose completo de partidas y valores.
          </Typography>
        </Box>

        {plantillas.length > 0 ? (
          <Cotizador
            modeloNombre={modelo.nombre}
            modeloSlug={modelo.slug}
            plantillas={plantillas}
            kitInicialSeleccion={kitInicialSeleccion}
            mostrarPrecios={MOSTRAR_PRECIOS}
          />
        ) : (
          <Box sx={{ py: { xs: 4, md: 6 }, maxWidth: 560 }}>
            <Typography variant="h3" component="p" sx={{ mb: 2 }}>
              Este modelo aún no tiene cotizador en línea.
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 3 }}>
              Escríbenos y te preparamos una cotización llave en mano a medida para el{' '}
              {modelo.nombre}.
            </Typography>
            <Button variant="contained" color="secondary" arrow href="/contacto">
              Cotizar por contacto
            </Button>
          </Box>
        )}
      </Container>
    </Section>
  );
}

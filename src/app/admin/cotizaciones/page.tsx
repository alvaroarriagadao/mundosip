import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { FileDown } from 'lucide-react';

import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Section from '@/components/ui/Section';
import BotonSalir from '@/features/admin/BotonSalir';
import ListadoPlantillas from '@/features/admin/ListadoPlantillas';
import { exigirAdmin } from '@/features/admin/auth';
import { KIT_LABEL } from '@/features/cotizador/cotizacion.types';
import { getEmitidas, getPlantillasResumen } from '@/features/cotizador/cotizador.db';
import { formatearFolio } from '@/features/cotizador/folio';
import { formatCLP } from '@/lib/format';
import { colors, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

export const metadata: Metadata = {
  title: 'Cotizaciones · Panel MundoSIP',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const fechaFmt = new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });

const celdaSx = {
  px: 1.5,
  py: 1.25,
  fontSize: '0.9rem',
  borderBottom: '1px solid',
  borderColor: 'divider',
  textAlign: 'left',
  verticalAlign: 'top',
} as const;

const cabeceraSx = {
  ...celdaSx,
  fontFamily: monoFamily,
  fontWeight: 700,
  fontSize: '0.68rem',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: colors.muted,
  borderBottomColor: colors.ink,
} as const;

/** Panel del equipo: plantillas editables + cotizaciones emitidas. */
export default async function AdminCotizacionesPage() {
  await exigirAdmin();
  const [plantillas, emitidas] = await Promise.all([getPlantillasResumen(), getEmitidas()]);

  return (
    <Section tone="paper" belowHeader>
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2, mb: { xs: 4, md: 5 } }}>
          <Box>
            <Eyebrow>Panel · Cotizaciones</Eyebrow>
            <Typography variant="h1" component="h1" sx={{ mt: 2 }}>
              Plantillas y emisiones.
            </Typography>
          </Box>
          <BotonSalir />
        </Box>

        {/* ── Plantillas agrupadas por modelo, con buscador y duplicado ── */}
        <Box sx={{ mb: { xs: 6, md: 8 } }}>
          <ListadoPlantillas plantillas={plantillas} />
        </Box>

        {/* ── Cotizaciones emitidas ── */}
        <Typography variant="h3" component="h2" sx={{ mb: 2.5 }}>
          Cotizaciones emitidas
        </Typography>
        {emitidas.length === 0 ? (
          <Typography sx={{ color: 'text.secondary' }}>
            Aún no hay cotizaciones emitidas desde el sitio.
          </Typography>
        ) : (
          <Box sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: `${radii.md}px` }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
              <Box component="thead">
                <Box component="tr">
                  <Box component="th" sx={cabeceraSx}>Folio</Box>
                  <Box component="th" sx={cabeceraSx}>Fecha</Box>
                  <Box component="th" sx={cabeceraSx}>Cliente</Box>
                  <Box component="th" sx={cabeceraSx}>Modelo</Box>
                  <Box component="th" sx={{ ...cabeceraSx, textAlign: 'right' }}>Total</Box>
                  <Box component="th" sx={cabeceraSx}>PDF</Box>
                </Box>
              </Box>
              <Box component="tbody">
                {emitidas.map((e) => (
                  <Box component="tr" key={e.id} sx={{ '&:last-of-type td': { borderBottom: 0 } }}>
                    <Box component="td" sx={{ ...celdaSx, fontFamily: monoFamily, fontWeight: 700 }}>
                      {formatearFolio(e.folioNum)}
                    </Box>
                    <Box component="td" sx={celdaSx}>{fechaFmt.format(new Date(e.createdAt))}</Box>
                    <Box component="td" sx={celdaSx}>
                      {e.nombre}
                      <Typography component="span" sx={{ display: 'block', fontSize: '0.8rem', color: 'text.secondary' }}>
                        {e.email}
                        {e.telefono ? ` · ${e.telefono}` : ''}
                      </Typography>
                    </Box>
                    <Box component="td" sx={{ ...celdaSx, textTransform: 'capitalize' }}>
                      {e.modeloSlug} · {KIT_LABEL[e.kit]}
                    </Box>
                    <Box component="td" sx={{ ...celdaSx, textAlign: 'right', fontFamily: monoFamily, fontWeight: 700 }}>
                      {formatCLP(e.totalClp)}
                    </Box>
                    <Box component="td" sx={celdaSx}>
                      <Box
                        component="a"
                        href={`/api/admin/emitidas/${e.id}/pdf`}
                        aria-label={`Descargar PDF de ${formatearFolio(e.folioNum)}`}
                        sx={{ color: colors.teal, display: 'inline-flex', '&:hover': { color: colors.tanDark } }}
                      >
                        <FileDown size={18} />
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </Container>
    </Section>
  );
}

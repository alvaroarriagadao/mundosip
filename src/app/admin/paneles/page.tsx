import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ArrowLeft, FileDown } from 'lucide-react';

import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Section from '@/components/ui/Section';
import BotonSalir from '@/features/admin/BotonSalir';
import GestorPaneles from '@/features/admin/GestorPaneles';
import { exigirAdmin } from '@/features/admin/auth';
import { getPanelesAdmin, getPedidosPaneles } from '@/features/paneles/paneles.db';
import { formatearFolioPedido } from '@/features/paneles/pedido.schema';
import { formatCLP } from '@/lib/format';
import { colors, radii } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

export const metadata: Metadata = {
  title: 'Paneles · Panel MundoSIP',
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
  fontWeight: 700,
  fontSize: '0.8rem',
  color: 'text.secondary',
  borderBottomColor: colors.ink,
} as const;

/** Gestión de la tienda de paneles: productos + pedidos cotizados. */
export default async function AdminPanelesPage() {
  await exigirAdmin();
  const [paneles, pedidos] = await Promise.all([getPanelesAdmin(), getPedidosPaneles()]);

  return (
    <Section tone="paper" belowHeader>
      <Container>
        <Box
          component="a"
          href="/admin"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            textDecoration: 'none',
            color: colors.muted,
            fontSize: '0.9rem',
            fontWeight: 600,
            mb: 3,
            '&:hover': { color: colors.teal },
          }}
        >
          <ArrowLeft size={15} /> Volver al panel
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2, mb: { xs: 4, md: 5 } }}>
          <Box>
            <Eyebrow>Panel · Tienda de paneles</Eyebrow>
            <Typography variant="h1" component="h1" sx={{ mt: 2 }}>
              Productos.
            </Typography>
          </Box>
          <BotonSalir />
        </Box>

        <Box sx={{ mb: { xs: 6, md: 8 } }}>
          <GestorPaneles paneles={paneles} />
        </Box>

        {/* ── Pedidos cotizados desde la tienda ── */}
        <Typography variant="h3" component="h2" sx={{ mb: 2.5 }}>
          Pedidos cotizados
        </Typography>
        {pedidos.length === 0 ? (
          <Typography sx={{ color: 'text.secondary' }}>
            Aún no hay cotizaciones de paneles desde el sitio.
          </Typography>
        ) : (
          <Box sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: `${radii.md}px` }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <Box component="thead">
                <Box component="tr">
                  <Box component="th" sx={cabeceraSx}>Folio</Box>
                  <Box component="th" sx={cabeceraSx}>Fecha</Box>
                  <Box component="th" sx={cabeceraSx}>Cliente</Box>
                  <Box component="th" sx={{ ...cabeceraSx, textAlign: 'right' }}>Total</Box>
                  <Box component="th" sx={cabeceraSx}>PDF</Box>
                </Box>
              </Box>
              <Box component="tbody">
                {pedidos.map((p) => (
                  <Box component="tr" key={p.id} sx={{ '&:last-of-type td': { borderBottom: 0 } }}>
                    <Box component="td" sx={{ ...celdaSx, fontFamily: monoFamily, fontWeight: 700 }}>
                      {formatearFolioPedido(p.folioNum)}
                    </Box>
                    <Box component="td" sx={celdaSx}>{fechaFmt.format(new Date(p.createdAt))}</Box>
                    <Box component="td" sx={celdaSx}>
                      {p.nombre}
                      <Typography component="span" sx={{ display: 'block', fontSize: '0.8rem', color: 'text.secondary' }}>
                        {p.email}
                        {p.telefono ? ` · ${p.telefono}` : ''}
                      </Typography>
                    </Box>
                    <Box component="td" sx={{ ...celdaSx, textAlign: 'right', fontFamily: monoFamily, fontWeight: 700 }}>
                      {formatCLP(p.totalClp)}
                    </Box>
                    <Box component="td" sx={celdaSx}>
                      <Box
                        component="a"
                        href={`/api/admin/pedidos-paneles/${p.id}/pdf`}
                        aria-label={`Descargar PDF de ${formatearFolioPedido(p.folioNum)}`}
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

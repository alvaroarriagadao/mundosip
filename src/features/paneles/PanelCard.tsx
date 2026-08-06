import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Button from '@/components/ui/Button';
import PanelCorte from '@/features/paneles/PanelCorte';
import { formatCLP } from '@/lib/format';
import type { PanelSIP } from '@/features/paneles/panel.types';
import { colors, radii } from '@/theme/tokens';
import { displayFamily, monoFamily } from '@/theme/typography';

/** Fila de la ficha técnica */
function Spec({ label, valor }: { label: string; valor: string }) {
  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: 2,
        py: 1,
        borderBottom: '1px dashed',
        borderColor: 'divider',
      }}
    >
      <Typography
        component="span"
        sx={{ fontFamily: monoFamily, fontSize: '0.76rem', letterSpacing: '0.1em', color: 'text.secondary', textTransform: 'uppercase' }}
      >
        {label}
      </Typography>
      <Typography component="span" sx={{ fontSize: '0.98rem', fontWeight: 700, textAlign: 'right' }}>
        {valor}
      </Typography>
    </Box>
  );
}

/** Card de panel: corte a escala + ficha técnica + precio */
export default function PanelCard({ panel }: { panel: PanelSIP }) {
  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: `${radii.lg}px`,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: panel.destacado ? colors.tan : 'divider',
      }}
    >
      {panel.destacado && (
        <Typography
          component="span"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1,
            fontFamily: monoFamily,
            fontWeight: 700,
            fontSize: '0.66rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: colors.tealNight,
            bgcolor: colors.tan,
            px: 1.5,
            py: 0.55,
            borderRadius: `${radii.pill}px`,
          }}
        >
          El más pedido
        </Typography>
      )}

      {/* Corte transversal a escala */}
      <Box sx={{ bgcolor: 'background.default', px: 3, py: 4, borderBottom: '1px solid', borderColor: 'divider' }}>
        <PanelCorte panel={panel} alto={panel.espesorTotalMM * 1.35} />
      </Box>

      <Box sx={{ p: { xs: 3, md: 3.5 }, display: 'flex', flexDirection: 'column', gap: 2.5, flex: 1 }}>
        <Box>
          {/* Altura fija: los nombres de 1 y 2 líneas no desalinean las fichas */}
          <Typography
            variant="h3"
            component="h2"
            sx={{
              mb: 1,
              minHeight: { xs: 'auto', sm: '2.3em' },
              display: 'flex',
              alignItems: 'flex-start',
            }}
          >
            {panel.nombre}
          </Typography>
          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: '0.98rem',
              lineHeight: 1.6,
              height: '4.8em',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3,
              overflow: 'hidden',
            }}
          >
            {panel.descripcion}
          </Typography>
        </Box>

        {/* Usos recomendados — alto reservado para 2 filas de chips */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', gap: 0.75, minHeight: { sm: 66 } }}>
          {panel.usos.map((uso) => (
            <Typography
              key={uso}
              component="span"
              sx={{
                fontFamily: monoFamily,
                fontSize: '0.72rem',
                letterSpacing: '0.04em',
                color: 'text.secondary',
                px: 1.25,
                py: 0.5,
                borderRadius: `${radii.pill}px`,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {uso}
            </Typography>
          ))}
        </Box>

        {/* Ficha técnica */}
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          <Spec label="Dimensiones" valor={panel.dimensiones} />
          <Spec label="Espesor OSB" valor={`${String(panel.espesorOSBMM).replace('.', ',')} mm`} />
          <Spec label="Espesor EPS" valor={`${panel.espesorEPSMM} mm`} />
          <Spec label="Densidad EPS" valor={panel.densidadEPS} />
          <Spec label="Apto para" valor={panel.aptoParaMadera} />
        </Box>

        {/* Precio + CTA */}
        <Box sx={{ mt: 'auto', pt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, mb: 2 }}>
            <Box>
              <Typography
                component="p"
                sx={{ fontFamily: monoFamily, fontSize: '0.68rem', letterSpacing: '0.2em', color: 'text.secondary', mb: 0.25 }}
              >
                POR PANEL
              </Typography>
              <Typography
                component="p"
                sx={{
                  fontFamily: displayFamily,
                  fontWeight: 800,
                  fontSize: '1.6rem',
                  lineHeight: 1,
                  letterSpacing: '-0.01em',
                  color: colors.tanDark,
                }}
              >
                {formatCLP(panel.precioCLP)}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', textAlign: 'right' }}>
              IVA incluido
            </Typography>
          </Box>
          <Button
            variant={panel.destacado ? 'contained' : 'outlined'}
            color={panel.destacado ? 'secondary' : 'primary'}
            arrow
            fullWidth
            href={`/contacto?panel=${panel.slug}`}
          >
            Cotizar este panel
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

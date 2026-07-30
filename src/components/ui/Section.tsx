import Box from '@mui/material/Box';
import type { BoxProps } from '@mui/material/Box';

import { colors, layout } from '@/theme/tokens';

type SectionTone = 'cream' | 'paper' | 'dark';

interface SectionProps extends BoxProps {
  /** Fondo de la sección; `dark` invierte el color de texto */
  tone?: SectionTone;
  /**
   * Primera sección de una página interior: reserva el alto del header fijo
   * más el aire del titular. Centralizado aquí para que todas las páginas
   * arranquen el título exactamente a la misma altura.
   */
  belowHeader?: boolean;
}

const tones: Record<SectionTone, object> = {
  cream: { bgcolor: 'background.default', color: 'text.primary' },
  paper: { bgcolor: 'background.paper', color: 'text.primary' },
  dark: { bgcolor: colors.tealDeep, color: colors.cream },
};

/** Bloque de página con ritmo vertical generoso y consistente */
export default function Section({ tone = 'cream', belowHeader = false, sx, children, ...rest }: SectionProps) {
  const paddingTop = belowHeader
    ? {
        xs: `${layout.headerHeight.mobile + 40}px`,
        md: `${layout.headerHeight.desktop + 80}px`,
      }
    : { xs: 10, md: 15 };

  return (
    <Box
      component="section"
      {...rest}
      sx={[
        {
          // pt/pb separados y NO `py`: el shorthand pisa cualquier `pt` que
          // llegue por sx y el padding superior deja de respetarse
          pt: paddingTop,
          pb: { xs: 10, md: 15 },
          ...tones[tone],
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}

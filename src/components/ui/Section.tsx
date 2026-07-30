import Box from '@mui/material/Box';
import type { BoxProps } from '@mui/material/Box';

import { colors } from '@/theme/tokens';

type SectionTone = 'cream' | 'paper' | 'dark';

interface SectionProps extends BoxProps {
  /** Fondo de la sección; `dark` invierte el color de texto */
  tone?: SectionTone;
}

const tones: Record<SectionTone, object> = {
  cream: { bgcolor: 'background.default', color: 'text.primary' },
  paper: { bgcolor: 'background.paper', color: 'text.primary' },
  dark: { bgcolor: colors.tealDeep, color: colors.cream },
};

/** Bloque de página con ritmo vertical generoso y consistente */
export default function Section({ tone = 'cream', sx, children, ...rest }: SectionProps) {
  return (
    <Box
      component="section"
      {...rest}
      sx={[
        {
          py: { xs: 10, md: 15 },
          ...tones[tone],
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}

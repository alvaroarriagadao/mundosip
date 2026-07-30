import Box from '@mui/material/Box';
import type { BoxProps } from '@mui/material/Box';

import { layout } from '@/theme/tokens';

/** Ancho de lectura del sitio con gutters responsivos */
export default function Container({ sx, children, ...rest }: BoxProps) {
  return (
    <Box
      {...rest}
      sx={[
        {
          width: '100%',
          maxWidth: `${layout.maxWidth}px`,
          mx: 'auto',
          px: { xs: 2.5, sm: 3.5, md: 4.5 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}

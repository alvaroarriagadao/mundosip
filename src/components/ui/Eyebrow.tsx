import Typography from '@mui/material/Typography';
import type { TypographyProps } from '@mui/material/Typography';

/**
 * Kicker mono en mayúsculas con guión inicial.
 * Marca el inicio de cada sección con voz de "ficha técnica".
 */
export default function Eyebrow({ sx, children, ...rest }: TypographyProps) {
  return (
    <Typography
      variant="overline"
      component="span"
      {...rest}
      sx={[
        {
          // flex (no inline-flex) + fit-content: al ser block-level su posición
          // no depende del strut de la línea del contenedor, así el kicker
          // arranca exactamente a la misma altura en todas las páginas
          display: 'flex',
          width: 'fit-content',
          alignItems: 'center',
          gap: 1.5,
          color: 'secondary.main',
          '&::before': {
            content: '""',
            display: 'inline-block',
            width: 32,
            height: '1px',
            bgcolor: 'currentColor',
            opacity: 0.7,
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Typography>
  );
}

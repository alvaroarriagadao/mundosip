import Typography from '@mui/material/Typography';

import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Section from '@/components/ui/Section';
import { layout } from '@/theme/tokens';

interface PagePlaceholderProps {
  eyebrow: string;
  title: string;
  description: string;
}

/** Placeholder temporal para rutas cuyo contenido llega en las próximas entregas */
export default function PagePlaceholder({ eyebrow, title, description }: PagePlaceholderProps) {
  return (
    <Section sx={{ pt: `${layout.headerHeight.desktop + 96}px`, minHeight: '72svh' }}>
      <Container>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Typography variant="h1" component="h1" sx={{ mt: 2, mb: 3, maxWidth: '14ch' }}>
          {title}
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary', maxWidth: 520 }}>
          {description}
        </Typography>
      </Container>
    </Section>
  );
}

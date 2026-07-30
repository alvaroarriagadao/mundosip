import type { Metadata } from 'next';

import PagePlaceholder from '@/components/ui/PagePlaceholder';

export const metadata: Metadata = {
  title: 'Paneles SIP',
};

export default function PanelesPage() {
  return (
    <PagePlaceholder
      eyebrow="Paneles SIP"
      title="El material, a tu medida."
      description="Catálogo de paneles SIP con ficha técnica y precios. Muy pronto aquí."
    />
  );
}

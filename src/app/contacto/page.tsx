import type { Metadata } from 'next';

import PagePlaceholder from '@/components/ui/PagePlaceholder';

export const metadata: Metadata = {
  title: 'Contacto',
};

export default function ContactoPage() {
  return (
    <PagePlaceholder
      eyebrow="Contacto"
      title="Hablemos de tu proyecto."
      description="El formulario de cotización llega en la próxima entrega. Mientras tanto, escríbenos a contacto@mundosip.cl."
    />
  );
}

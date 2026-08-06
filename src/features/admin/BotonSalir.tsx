'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

import Button from '@/components/ui/Button';

export default function BotonSalir() {
  const router = useRouter();

  async function salir() {
    await fetch('/api/admin/salir', { method: 'POST' });
    router.replace('/admin');
    router.refresh();
  }

  return (
    <Button variant="outlined" color="primary" size="small" onClick={salir} startIcon={<LogOut size={15} />}>
      Salir
    </Button>
  );
}

'use client';

import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { layout } from '@/theme/tokens';

/** Scroll suave global; se desactiva con prefers-reduced-motion */
export default function LenisProvider() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // `anchors` hace que los enlaces #ancla scrolleen suave (Lenis fuerza
    // scroll-behavior:auto, así que sin esto saltarían de golpe). El offset
    // deja el título libre del header fijo.
    const lenis = new Lenis({
      lerp: 0.11,
      smoothWheel: true,
      anchors: { offset: -(layout.headerHeight.desktop + 16) },
    });
    lenisRef.current = lenis;

    let raf = requestAnimationFrame(function loop(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  /**
   * Al cambiar de página, volver arriba.
   *
   * Lenis lleva su propia posición de scroll y sigue mandando después de
   * la navegación, así que el reset de Next no le llega: la página nueva
   * aparecía a media altura. Se salta cuando la URL trae hash, para no
   * pisar el scroll hacia el ancla.
   */
  useEffect(() => {
    if (window.location.hash) return;
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}

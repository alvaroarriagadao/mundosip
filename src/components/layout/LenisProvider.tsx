'use client';

import Lenis from 'lenis';
import { useEffect } from 'react';

import { layout } from '@/theme/tokens';

/** Scroll suave global; se desactiva con prefers-reduced-motion */
export default function LenisProvider() {
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
    let raf = requestAnimationFrame(function loop(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}

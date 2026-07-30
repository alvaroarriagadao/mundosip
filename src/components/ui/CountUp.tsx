'use client';

import { useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { formatNumber } from '@/lib/format';

interface CountUpProps {
  to: number;
  /** Duración de la animación en segundos */
  duration?: number;
  prefix?: string;
  suffix?: string;
}

/** Contador animado al entrar en viewport, con formato es-CL (48.000) */
export default function CountUp({ to, duration = 1.8, prefix = '', suffix = '' }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setValue(Math.round(to * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, to, duration]);

  const displayed = reduced ? to : value;

  return (
    <span ref={ref}>
      {prefix}
      {formatNumber(displayed)}
      {suffix}
    </span>
  );
}

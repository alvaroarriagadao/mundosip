'use client';

import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';

import { colors } from '@/theme/tokens';

/** Barra sutil de progreso de lectura, fija arriba del todo */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });
  const reduced = useReducedMotion();

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden
      style={{
        scaleX,
        transformOrigin: '0 0',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: colors.tan,
        zIndex: 1500,
      }}
    />
  );
}

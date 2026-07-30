'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

import { EASE } from '@/lib/motion';

interface RevealProps {
  children: ReactNode;
  /** Retardo en segundos (para escalonar hermanos) */
  delay?: number;
  /** Desplazamiento vertical inicial en px */
  y?: number;
  /** Desplazamiento horizontal inicial en px (negativo = entra desde la izquierda) */
  x?: number;
  once?: boolean;
  style?: React.CSSProperties;
}

/** Fade + translate al entrar en viewport; inerte con prefers-reduced-motion */
export default function Reveal({ children, delay = 0, y = 28, x = 0, once = true, style }: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div style={style}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, amount: 0.25, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.8, ease: EASE, delay }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

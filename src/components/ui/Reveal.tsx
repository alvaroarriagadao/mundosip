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
  /** Fracción del elemento que debe verse para disparar (0–1). Bajarla en cards altas. */
  amount?: number;
  /** Margen del viewport para el observer; '0px' dispara apenas asoma */
  margin?: string;
  style?: React.CSSProperties;
}

/**
 * Fade + translate al entrar en viewport; inerte con prefers-reduced-motion.
 *
 * Dispara apenas asoma el 10 % del elemento: con umbrales más altos las
 * cards altas quedaban en blanco media pantalla mientras se scrolleaba.
 * En listas, escalonar con `(i % columnas) * x` y no con `i * x`: si no,
 * el elemento 8 siempre espera medio segundo aunque entre solo.
 */
export default function Reveal({ children, delay = 0, y = 28, x = 0, once = true, amount = 0.1, margin = '0px', style }: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div style={style}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, amount, margin }}
      transition={{ duration: 0.65, ease: EASE, delay }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

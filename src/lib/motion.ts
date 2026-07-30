import type { Variants } from 'framer-motion';

import { motionTokens } from '@/theme/tokens';

export const EASE = motionTokens.ease;

/** Fade + translateY estándar para reveals on-scroll */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionTokens.dur.reveal, ease: EASE },
  },
};

/** Contenedor que escalona a sus hijos */
export const stagger = (staggerChildren = 0.09, delayChildren = 0.1): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren, delayChildren },
  },
});

/** Revelado línea a línea para titulares (usar dentro de un wrapper con overflow hidden) */
export const lineReveal: Variants = {
  hidden: { y: '112%' },
  visible: {
    y: '0%',
    transition: { duration: 0.95, ease: EASE },
  },
};

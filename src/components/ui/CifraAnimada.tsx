'use client';

import { animate } from 'framer-motion';
import { useEffect, useRef } from 'react';

import { formatCLP } from '@/lib/format';
import { EASE } from '@/lib/motion';

/**
 * Monto CLP que interpola suave hacia su nuevo valor.
 *
 * Detalles que importan (aprendidos a golpes):
 * - Muta `nodeValue` del nodo de texto EXISTENTE — nunca `textContent`,
 *   que crea un nodo nuevo y deja al de React desconectado (el número
 *   visible quedaba congelado un estado atrás).
 * - El efecto corre en cada render y parte desde lo que realmente se ve
 *   en pantalla: si una animación quedó a medias o algo desincronizó el
 *   DOM, la siguiente pasada lo corrige sola.
 */
export default function CifraAnimada({ valor }: { valor: number }) {
  const nodoRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const texto = nodoRef.current?.firstChild;
    if (!texto) return;

    const visible = Number((texto.nodeValue ?? '').replace(/[^\d-]/g, ''));
    if (!Number.isFinite(visible) || visible === valor) return;

    const control = animate(visible, valor, {
      duration: 0.5,
      ease: EASE,
      onUpdate: (v) => {
        texto.nodeValue = formatCLP(Math.round(v));
      },
    });
    return () => control.stop();
  });

  return <span ref={nodoRef}>{formatCLP(valor)}</span>;
}

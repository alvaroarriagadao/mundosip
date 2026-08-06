import Box from '@mui/material/Box';

import type { PanelSIP } from '@/features/paneles/panel.types';
import { colors } from '@/theme/tokens';
import { monoFamily } from '@/theme/typography';

interface PanelCorteProps {
  panel: PanelSIP;
  /** Alto del dibujo en px; el grosor de las capas se escala proporcionalmente */
  alto?: number;
}

/**
 * Corte transversal del panel dibujado A ESCALA a partir de sus espesores
 * reales: dos placas de OSB y el núcleo de EPS. Comunica la ficha técnica
 * mejor que una foto y diferencia visualmente un espesor de otro.
 */
export default function PanelCorte({ panel, alto = 180 }: PanelCorteProps) {
  const { espesorOSBMM, espesorEPSMM, espesorTotalMM } = panel;
  const escala = alto / espesorTotalMM;
  const hOSB = espesorOSBMM * escala;
  const hEPS = espesorEPSMM * escala;
  const ancho = 240;

  // Vetas de la OSB: líneas cortas irregulares pero deterministas
  const vetas = Array.from({ length: 26 }, (_, i) => {
    const x = 6 + i * 9;
    const w = 4 + ((i * 7) % 5);
    return { x, w };
  });

  // Perlas del EPS: retícula de puntos, deterministas para no romper SSR
  const perlas = Array.from({ length: 90 }, (_, i) => {
    const col = i % 15;
    const fil = Math.floor(i / 15);
    return {
      cx: 10 + col * 15.5 + ((i * 5) % 7),
      cy: 6 + fil * (hEPS / 6) + ((i * 3) % 5),
      r: 1.6 + ((i * 3) % 4) * 0.35,
    };
  });

  return (
    <Box
      component="svg"
      viewBox={`0 0 ${ancho} ${alto}`}
      role="img"
      aria-label={`Corte del ${panel.nombre}: OSB ${espesorOSBMM} mm, EPS ${espesorEPSMM} mm, OSB ${espesorOSBMM} mm`}
      sx={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
    >
      <defs>
        <clipPath id={`clip-eps-${panel.slug}`}>
          <rect x="0" y={hOSB} width={ancho} height={hEPS} />
        </clipPath>
      </defs>

      {/* Placa OSB superior */}
      <rect x="0" y="0" width={ancho} height={hOSB} fill={colors.tan} />
      {vetas.map((v, i) => (
        <rect
          key={`t-${i}`}
          x={v.x}
          y={hOSB * 0.3}
          width={v.w}
          height={Math.max(hOSB * 0.28, 1)}
          fill={colors.tanDark}
          opacity="0.55"
          rx="0.5"
        />
      ))}

      {/* Núcleo EPS */}
      <rect x="0" y={hOSB} width={ancho} height={hEPS} fill="#EDEAE4" />
      <g clipPath={`url(#clip-eps-${panel.slug})`}>
        {perlas.map((p, i) => (
          <circle key={`p-${i}`} cx={p.cx} cy={p.cy} r={p.r} fill="#FFFFFF" stroke="#D8D3CA" strokeWidth="0.6" />
        ))}
      </g>

      {/* Placa OSB inferior */}
      <rect x="0" y={hOSB + hEPS} width={ancho} height={hOSB} fill={colors.tan} />
      {vetas.map((v, i) => (
        <rect
          key={`b-${i}`}
          x={v.x + 3}
          y={hOSB + hEPS + hOSB * 0.35}
          width={v.w}
          height={Math.max(hOSB * 0.28, 1)}
          fill={colors.tanDark}
          opacity="0.55"
          rx="0.5"
        />
      ))}

      {/* Cota del espesor total */}
      <line x1={ancho - 1} y1="0" x2={ancho - 1} y2={alto} stroke={colors.muted} strokeWidth="1" />
      <line x1={ancho - 6} y1="0.5" x2={ancho + 4} y2="0.5" stroke={colors.muted} strokeWidth="1" />
      <line x1={ancho - 6} y1={alto - 0.5} x2={ancho + 4} y2={alto - 0.5} stroke={colors.muted} strokeWidth="1" />
      <text
        x={ancho - 10}
        y={alto / 2}
        textAnchor="end"
        dominantBaseline="middle"
        fill={colors.ink}
        style={{ fontFamily: monoFamily, fontSize: 13, fontWeight: 700 }}
      >
        {String(espesorTotalMM).replace('.', ',')} mm
      </text>
    </Box>
  );
}

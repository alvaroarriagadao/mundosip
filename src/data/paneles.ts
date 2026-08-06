import type { PanelSIP } from '@/features/paneles/panel.types';

/**
 * Catálogo de paneles SIP. En fase 2 sale del CMS.
 * Precios por panel completo (1220 x 2440 mm), IVA incluido.
 */
export const paneles: PanelSIP[] = [
  {
    id: 'p-94',
    slug: 'panel-sip-94mm',
    nombre: 'Panel SIP 94 mm',
    espesorTotalMM: 94,
    precioCLP: 61000,
    dimensiones: '1220 x 2440 mm',
    espesorOSBMM: 9.5,
    espesorEPSMM: 75,
    densidadEPS: '15 kg/m³',
    aptoParaMadera: '2×3" calibrada',
    descripcion:
      'El panel de muros por excelencia: resuelve estructura y aislación en una sola pieza. Es el que usamos en los muros exteriores e interiores de todos nuestros modelos.',
    usos: ['Muros exteriores', 'Muros interiores', 'Tabiques divisorios'],
    destacado: true,
    orden: 1,
  },
  {
    id: 'p-119',
    slug: 'panel-sip-119mm',
    nombre: 'Panel SIP 119 mm',
    espesorTotalMM: 119,
    precioCLP: 65000,
    dimensiones: '1220 x 2440 mm',
    espesorOSBMM: 9.5,
    espesorEPSMM: 100,
    densidadEPS: '15 kg/m³',
    aptoParaMadera: '2×4" calibrada',
    descripcion:
      'Un tercio más de aislación que el de 94 mm por poco más de precio. La opción recomendada para muros perimetrales en zonas frías del sur.',
    usos: ['Muros perimetrales', 'Zonas de clima frío', 'Envolvente térmica exigente'],
    destacado: false,
    orden: 2,
  },
  {
    id: 'p-122',
    slug: 'panel-sip-122mm',
    nombre: 'Panel SIP 122,2 mm',
    espesorTotalMM: 122,
    precioCLP: 73000,
    dimensiones: '1220 x 2440 mm',
    espesorOSBMM: 11,
    espesorEPSMM: 100,
    densidadEPS: '15 kg/m³',
    aptoParaMadera: '2×4" calibrada',
    descripcion:
      'OSB de 11 mm en ambas caras: más resistencia estructural para cubrir luces mayores. Pensado para cubiertas y entrepisos que reciben carga.',
    usos: ['Cubiertas', 'Entrepisos', 'Losas con carga'],
    destacado: false,
    orden: 3,
  },
];

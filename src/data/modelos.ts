import type { Modelo } from '@/features/modelos/modelo.types';

/** Ítems del Kit Básico (mismos para todos los modelos hoy; editables por modelo en fase 2) */
const KIT_BASICO = [
  'Muros exteriores – panel SIP 94 mm',
  'Muros interiores – panel SIP 94 mm',
  'Cubierta – panel SIP 169 mm',
  'Todas las maderas verticales y horizontales de unión',
  'Todas las fijaciones',
  'Espuma poliuretano',
  'Membrana hidrófuga',
  'Planos generales de arquitectura',
  'Planos de montaje',
  'Dimensionado de paneles listo para armar',
  'Instructivo de montaje',
  'Plano esquemático de electricidad',
  'Plano esquemático sanitario',
  'Capacitación en terreno antes de comenzar obra',
];

/** Kit Full = Básico + piso estructural en panel SIP */
const KIT_FULL = [
  'Muros exteriores – panel SIP 94 mm',
  'Muros interiores – panel SIP 94 mm',
  'Cubierta – panel SIP 169 mm',
  'Piso – panel SIP 169 mm',
  'Todas las maderas verticales y horizontales de unión',
  'Todas las maderas de piso',
  'Todas las fijaciones',
  'Espuma poliuretano',
  'Membrana hidrófuga',
  'Planos generales de arquitectura',
  'Planos de montaje',
  'Dimensionado de paneles listo para armar',
  'Instructivo de montaje',
  'Plano esquemático de electricidad',
  'Plano esquemático sanitario',
  'Capacitación en terreno antes de comenzar obra',
];

/**
 * Datos semilla de modelos. En fase 2 esta lista sale del CMS.
 * Precios y specs del catálogo vigente de MundoSIP.
 */
export const modelos: Modelo[] = [
  {
    id: 'm-tulipan',
    slug: 'tulipan',
    nombre: 'Tulipán',
    superficieM2: 80,
    habitaciones: 3,
    banos: 2,
    precioDesdeCLP: 12400000,
    resumen: 'Tres dormitorios en una planta eficiente y luminosa: la puerta de entrada a la casa propia.',
    descripcion:
      'El Tulipán concentra todo lo esencial en 80 m² bien pensados: tres dormitorios, dos baños y un living-comedor que se abre a la terraza de deck. Su planta en un piso simplifica el montaje y lo convierte en el kit más rápido de armar del catálogo.',
    caracteristicas: [
      'Planta en un piso, ideal para montaje rápido',
      'Living-comedor integrado abierto a la terraza',
      'Terraza de deck incluida en el diseño',
      'Dormitorio principal con baño privado',
      'Volumen de servicios agrupado: menos metros de instalaciones',
      'Fachada mixta: madera clara + acento oscuro',
    ],
    kitBasico: KIT_BASICO,
    kitFull: KIT_FULL,
    portada: { url: '/images/modelos/tulipan/portada.jpg', alt: 'Render del modelo Tulipán de 80 m²' },
    galeria: [
      { url: '/images/modelos/tulipan/galeria-1.jpg', alt: 'Fachada principal del modelo Tulipán' },
      { url: '/images/modelos/tulipan/galeria-2.jpg', alt: 'Vista lateral del modelo Tulipán' },
      { url: '/images/modelos/tulipan/galeria-3.jpg', alt: 'Perspectiva del modelo Tulipán y su terraza' },
    ],
    destacado: true,
    orden: 1,
  },
  {
    id: 'm-lupino',
    slug: 'lupino',
    nombre: 'Lupino',
    superficieM2: 125,
    habitaciones: 4,
    banos: 3,
    precioDesdeCLP: 17500000,
    resumen: 'Cuatro dormitorios y un living de doble altura con ventanales que buscan el sol de tarde.',
    descripcion:
      'El Lupino es la casa familiar del catálogo: 125 m² con cuatro dormitorios, tres baños y un volumen central de doble altura que inunda de luz el living. Sus dos alas laterales separan el área de dormitorios del área común, dando privacidad sin perder conexión.',
    caracteristicas: [
      'Volumen central de doble altura con ventanal completo',
      'Cuatro dormitorios en dos alas independientes',
      'Tres baños: suite principal + familiar + visitas',
      'Terraza de deck perimetral',
      'Cocina integrada con vista al acceso',
      'Acento de madera oscura en el volumen central',
    ],
    kitBasico: KIT_BASICO,
    kitFull: KIT_FULL,
    portada: { url: '/images/modelos/lupino/portada.jpg', alt: 'Render del modelo Lupino de 125 m²' },
    galeria: [
      { url: '/images/modelos/lupino/galeria-1.jpg', alt: 'Fachada principal del modelo Lupino' },
      { url: '/images/modelos/lupino/galeria-2.jpg', alt: 'Vista del volumen central del Lupino' },
      { url: '/images/modelos/lupino/galeria-3.jpg', alt: 'Perspectiva del modelo Lupino al atardecer' },
    ],
    destacado: true,
    orden: 2,
  },
  {
    id: 'm-azucena',
    slug: 'azucena',
    nombre: 'Azucena',
    superficieM2: 140,
    habitaciones: 4,
    banos: 3,
    precioDesdeCLP: 20400000,
    resumen: 'El modelo más amplio: dos volúmenes con cubiertas asimétricas unidos por una gran terraza.',
    descripcion:
      'La Azucena separa la casa en dos volúmenes de cubiertas asimétricas — área común y área de dormitorios — unidos por una terraza de deck protagonista. Sus 140 m² incluyen suite principal con walk-in closet y un living con ventanales de piso a cielo.',
    caracteristicas: [
      'Dos volúmenes con cubiertas asimétricas',
      'Gran terraza central de deck que une ambos cuerpos',
      'Living con ventanales de piso a cielo',
      'Suite principal con walk-in closet',
      'Cuatro dormitorios y tres baños',
      'Fachada en madera clara con contrafuerte oscuro',
    ],
    kitBasico: KIT_BASICO,
    kitFull: KIT_FULL,
    portada: { url: '/images/modelos/azucena/portada.jpg', alt: 'Render del modelo Azucena de 140 m²' },
    galeria: [
      { url: '/images/modelos/azucena/galeria-1.jpg', alt: 'Fachada principal del modelo Azucena' },
      { url: '/images/modelos/azucena/galeria-2.jpg', alt: 'Vista de los dos volúmenes del Azucena' },
      { url: '/images/modelos/azucena/galeria-3.jpg', alt: 'Terraza central del modelo Azucena' },
    ],
    destacado: true,
    orden: 3,
  },
];

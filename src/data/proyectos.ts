import type { Proyecto } from '@/features/proyectos/proyecto.types';

const LOS_RIOS = { slug: 'los-rios', nombre: 'Los Ríos' };
const LOS_LAGOS = { slug: 'los-lagos', nombre: 'Los Lagos' };

/**
 * Datos semilla de proyectos construidos.
 * En fase 2 esta lista sale del CMS; el equipo la administra sin código.
 * Las URLs de imágenes pasarán a ser de Cloudinary.
 */
export const proyectos: Proyecto[] = [
  {
    id: 'p-casa-lago-panguipulli',
    slug: 'casa-lago-panguipulli',
    nombre: 'Casa Lago Panguipulli',
    region: LOS_RIOS,
    ubicacion: 'Panguipulli, Región de Los Ríos',
    superficieM2: 170,
    anoDiseno: 2023,
    anoConstruccion: 2024,
    resumen: 'Refugio sureño en primera línea de lago, revestido en tejuela de alerce.',
    resenaDestacada:
      'Inspirada en los galpones tradicionales del sur, la casa combina tejuelas de alerce reciclado con planchas de zinc prepintado. El panel SIP dejó la estructura lista en cinco semanas, con la aislación resuelta desde fábrica.',
    resena:
      'Ubicada en la primera línea del lago Panguipulli, la vivienda se organiza en dos volúmenes que abrazan la vista al agua. Los ventanales del living se orientan al poniente para capturar la última luz de la tarde.',
    portada: {
      url: '/images/proyectos/casa-lago-panguipulli/portada.jpg',
      alt: 'Casa Lago Panguipulli revestida en tejuelas junto al lago',
    },
    imagenResena: {
      url: '/images/proyectos/casa-lago-panguipulli/resena.jpg',
      alt: 'Vista aérea de Casa Lago Panguipulli entre árboles',
    },
    galeria: [
      { url: '/images/proyectos/casa-lago-panguipulli/galeria-1.jpg', alt: 'Fachada principal hacia el lago' },
      { url: '/images/proyectos/casa-lago-panguipulli/galeria-2.jpg', alt: 'Detalle de revestimiento en tejuela' },
      { url: '/images/proyectos/casa-lago-panguipulli/galeria-3.jpg', alt: 'Emplazamiento en el bosque' },
      { url: '/images/proyectos/casa-lago-panguipulli/galeria-4.jpg', alt: 'Vista del volumen principal' },
      { url: '/images/proyectos/casa-lago-panguipulli/galeria-5.jpg', alt: 'Casa vista desde el acceso' },
    ],
    destacado: true,
    orden: 1,
  },
  {
    id: 'p-casa-ladera-ranco',
    slug: 'casa-ladera-ranco',
    nombre: 'Casa Ladera Ranco',
    region: LOS_RIOS,
    ubicacion: 'Lago Ranco, Región de Los Ríos',
    superficieM2: 185,
    anoDiseno: 2022,
    anoConstruccion: 2024,
    resumen: 'Volumen contemporáneo suspendido sobre la pendiente, con vista abierta al valle.',
    resenaDestacada:
      'La casa se posa sobre pilotes para tocar lo menos posible la ladera. Sus dos pisos en panel SIP se montaron en cuatro semanas, y el revestimiento mixto de zinc negro y madera nativa dialoga con el paisaje sin imitarlo.',
    resena:
      'Cada recinto busca una vista distinta del valle: el estar se abre en esquina con termopaneles de piso a cielo, mientras la terraza en voladizo extiende el living hacia el exterior durante el verano.',
    portada: {
      url: '/images/proyectos/casa-ladera-ranco/portada.jpg',
      alt: 'Casa Ladera Ranco sobre pilotes en la pendiente',
    },
    imagenResena: {
      url: '/images/proyectos/casa-ladera-ranco/resena.jpg',
      alt: 'Fachada de Casa Ladera Ranco con revestimiento mixto',
    },
    galeria: [
      { url: '/images/proyectos/casa-ladera-ranco/galeria-1.jpg', alt: 'Vista lateral del volumen principal' },
      { url: '/images/proyectos/casa-ladera-ranco/galeria-2.jpg', alt: 'La casa en su contexto de pradera' },
      { url: '/images/proyectos/casa-ladera-ranco/galeria-3.jpg', alt: 'Detalle de balcones y celosías' },
      { url: '/images/proyectos/casa-ladera-ranco/galeria-4.jpg', alt: 'Vista desde el camino de acceso' },
      { url: '/images/proyectos/casa-ladera-ranco/galeria-5.jpg', alt: 'Fachada poniente al atardecer' },
    ],
    destacado: true,
    orden: 2,
  },
  {
    id: 'p-refugio-bosque-nativo',
    slug: 'refugio-bosque-nativo',
    nombre: 'Refugio Bosque Nativo',
    region: LOS_LAGOS,
    ubicacion: 'Puerto Varas, Región de Los Lagos',
    superficieM2: 124,
    anoDiseno: 2023,
    anoConstruccion: 2024,
    resumen: 'Casa de dos pisos escondida entre coigües, pensada para desconectarse.',
    resenaDestacada:
      'El encargo era claro: una casa que desapareciera en el bosque. El volumen compacto en panel SIP minimiza la huella sobre el terreno y el zinc negro del revestimiento se funde con las sombras de los coigües.',
    resena:
      'La aislación térmica del SIP permitió reducir la calefacción a una sola estufa de pellet. Los ventanales del segundo piso enmarcan las copas de los árboles, como vivir en una casa-mirador.',
    portada: {
      url: '/images/proyectos/refugio-bosque-nativo/portada.jpg',
      alt: 'Refugio Bosque Nativo entre coigües',
    },
    imagenResena: {
      url: '/images/proyectos/refugio-bosque-nativo/resena.jpg',
      alt: 'Fachada del refugio con revestimiento negro',
    },
    galeria: [
      { url: '/images/proyectos/refugio-bosque-nativo/galeria-1.jpg', alt: 'La casa camuflada en el bosque' },
      { url: '/images/proyectos/refugio-bosque-nativo/galeria-2.jpg', alt: 'Acceso principal entre árboles' },
      { url: '/images/proyectos/refugio-bosque-nativo/galeria-3.jpg', alt: 'Detalle de fachada y ventanas' },
      { url: '/images/proyectos/refugio-bosque-nativo/galeria-4.jpg', alt: 'Vista del entorno de pradera y bosque' },
    ],
    destacado: false,
    orden: 3,
  },
  {
    id: 'p-casa-costa-pacifico',
    slug: 'casa-costa-pacifico',
    nombre: 'Casa Costa Pacífico',
    region: LOS_LAGOS,
    ubicacion: 'Maicolpué, Región de Los Lagos',
    superficieM2: 98,
    anoDiseno: 2024,
    anoConstruccion: 2025,
    resumen: 'Casa compacta frente al mar, diseñada para resistir el clima costero.',
    resenaDestacada:
      'Frente al Pacífico el clima no perdona: viento, sal y lluvia horizontal. El panel SIP con revestimiento ventilado protege la estructura, y la planta compacta concentra el calor en los meses de invierno.',
    resena:
      'La casa se orienta hacia la rompiente y abre su fachada norte a un patio protegido del viento sur. Todo el programa cabe en un piso, pensado para habitarse todo el año.',
    portada: {
      url: '/images/proyectos/casa-costa-pacifico/portada.jpg',
      alt: 'Casa Costa Pacífico frente al mar',
    },
    imagenResena: {
      url: '/images/proyectos/casa-costa-pacifico/resena.jpg',
      alt: 'Vista aérea de la casa y la costa',
    },
    galeria: [
      { url: '/images/proyectos/casa-costa-pacifico/galeria-1.jpg', alt: 'La casa sobre la pradera costera' },
      { url: '/images/proyectos/casa-costa-pacifico/galeria-2.jpg', alt: 'Vista hacia la rompiente' },
      { url: '/images/proyectos/casa-costa-pacifico/galeria-3.jpg', alt: 'Volumen principal al atardecer' },
      { url: '/images/proyectos/casa-costa-pacifico/galeria-4.jpg', alt: 'Contexto costero del proyecto' },
    ],
    destacado: false,
    orden: 4,
  },
];

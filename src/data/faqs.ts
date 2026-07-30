import type { Faq } from '@/features/faqs/faq.types';

/** Preguntas frecuentes del catálogo vigente. En fase 2 salen del CMS. */
export const faqs: Faq[] = [
  {
    id: 'faq-ventajas',
    pregunta: '¿Cuáles son las ventajas de construir en paneles SIP?',
    puntos: [
      { titulo: 'Eficiencia energética', texto: 'Gran aislamiento que reduce costos de energía reflejados en boletas de suministros.' },
      { titulo: 'Rapidez de construcción', texto: 'Montaje rápido, menos tiempo en construcción.' },
      { titulo: 'Resistencia estructural', texto: 'Sólidos y estables en condiciones climáticas adversas.' },
      { titulo: 'Menor desperdicio', texto: 'Producción controlada, reduce residuos en obra.' },
      { titulo: 'Aislamiento acústico', texto: 'Reduce el ruido exterior.' },
      { titulo: 'Durabilidad', texto: 'Larga vida útil que disminuye el impacto ambiental.' },
      { titulo: 'Flexibilidad de diseño', texto: 'Personalizables para diferentes estilos arquitectónicos.' },
    ],
    orden: 1,
  },
  {
    id: 'faq-tipos-construccion',
    pregunta: '¿Qué tipo de construcciones se pueden realizar en paneles SIP?',
    respuesta:
      'Su versatilidad permite adaptarse a diferentes estilos y necesidades arquitectónicas, desde la habitacional hasta la comercial o industrial.',
    orden: 2,
  },
  {
    id: 'faq-espesor',
    pregunta: '¿Qué espesor se recomienda para usar en una vivienda?',
    respuesta:
      'Los espesores deben dar respuesta a la normativa térmica vigente en nuestro país (Art. 4.1.10, OGUC) según las diferentes zonas que lo componen.',
    orden: 3,
  },
  {
    id: 'faq-tiempo',
    pregunta: '¿Cuánto tiempo se tarda en construir con paneles SIP?',
    respuesta:
      'Depende de la envergadura del proyecto, pero se reduce hasta un 45% del tiempo respecto de las construcciones tradicionales.',
    orden: 4,
  },
  {
    id: 'faq-costo',
    pregunta: '¿Es más caro construir que con el sistema tradicional?',
    respuesta:
      'Construir con paneles SIP puede ser más caro inicialmente que los métodos tradicionales, pero tiene sus fundamentos:',
    puntos: [
      { titulo: 'Paneles', texto: 'Pueden costar más por metro cuadrado que el sistema tradicional de madera, pero su eficiencia energética compensa esta diferencia a largo plazo.' },
      { titulo: 'Ahorro en mano de obra', texto: 'Se instalan más rápido, lo que reduce costos laborales y puede equilibrar el costo total de la obra.' },
      { titulo: 'Eficiencia energética', texto: 'Ahorran en gastos de energía a largo plazo, lo que hace que sea una inversión inicial rentable.' },
      { titulo: 'Durabilidad', texto: 'Menor mantenimiento reduce gastos a lo largo de los años.' },
    ],
    orden: 5,
  },
  {
    id: 'faq-ampliacion',
    pregunta: '¿Es posible construir una ampliación en paneles SIP?',
    respuesta:
      'Sí, es totalmente posible, pero se recomienda consultar a un profesional para asegurar que la ampliación cumpla con las normativas locales y se integre correctamente con la estructura existente.',
    orden: 6,
  },
  {
    id: 'faq-experiencia',
    pregunta: '¿Es necesario tener experiencia en construcción para instalar paneles SIP?',
    respuesta:
      'No es estrictamente necesario tener experiencia para su instalación, pero sí es recomendable investigar para tener un conocimiento técnico, contar con algunas herramientas específicas y asesorías profesionales si gustas.',
    orden: 7,
  },
  {
    id: 'faq-termitas',
    pregunta: '¿Los paneles SIP son resistentes a termitas u otros insectos?',
    respuesta:
      'Los paneles SIP son generalmente resistentes a termitas y otros insectos, especialmente si están elaborados con materiales tratados como el OSB LP APA PROTEC, que cuenta con una protección antimicrobiana.',
    orden: 8,
  },
  {
    id: 'faq-dos-pisos',
    pregunta: '¿Es posible construir una vivienda de 2 pisos en paneles SIP?',
    respuesta:
      'Sí, es completamente posible. Es recomendable trabajar con un profesional con experiencia en construcción con paneles SIP para garantizar que la estructura cumpla con las normativas de construcción y sea segura.',
    orden: 9,
  },
  {
    id: 'faq-revestimiento',
    pregunta: '¿Qué tipo de revestimiento se puede utilizar en el panel SIP?',
    respuesta:
      'Los paneles SIP pueden recibir varios tipos de revestimientos, tanto para exterior como interior. Es importante elegir revestimientos compatibles con los paneles y que cumplan con los requisitos de seguridad y estética del proyecto.',
    orden: 10,
  },
  {
    id: 'faq-costos-asociados',
    pregunta: '¿Cuáles son los costos asociados a la construcción en paneles SIP?',
    respuesta:
      'Los costos asociados pueden variar según varios factores: el tipo de fundación que se debe utilizar en cada terreno, tipos de revestimientos, tonos de ventanas, transporte y mano de obra.',
    orden: 11,
  },
];

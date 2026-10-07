import type { Faq } from '@/features/faqs/faq.types';
import type { Modelo } from '@/features/modelos/modelo.types';
import type { PanelProducto } from '@/features/paneles/panel.types';
import type { Proyecto } from '@/features/proyectos/proyecto.types';
import { EMPRESA, SITE_DESCRIPTION, SITE_NAME, SITE_URL, urlAbsoluta } from '@/lib/site';

/**
 * Datos estructurados schema.org del sitio. Google los usa para los
 * resultados enriquecidos (precio, FAQ, migas, ficha de empresa) y los
 * asistentes de IA para citar la fuente con datos exactos (GEO).
 */

const ORG_ID = `${SITE_URL}/#organizacion`;

/** La empresa: ficha local + organización (una sola entidad con dos tipos) */
export function schemaEmpresa() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'HomeAndConstructionBusiness'],
    '@id': ORG_ID,
    name: SITE_NAME,
    legalName: EMPRESA.nombreLegal,
    alternateName: 'Mundo SIP',
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo-dark.png`,
    image: `${SITE_URL}/opengraph-image.jpg`,
    description: SITE_DESCRIPTION,
    email: EMPRESA.email,
    telephone: EMPRESA.telefono,
    address: {
      '@type': 'PostalAddress',
      streetAddress: EMPRESA.direccion.calle,
      addressLocality: EMPRESA.direccion.comuna,
      addressRegion: EMPRESA.direccion.region,
      postalCode: EMPRESA.direccion.codigoPostal,
      addressCountry: EMPRESA.direccion.pais,
    },
    geo: { '@type': 'GeoCoordinates', latitude: EMPRESA.geo.lat, longitude: EMPRESA.geo.lng },
    areaServed: { '@type': 'Country', name: 'Chile' },
    sameAs: [EMPRESA.redes.instagram, EMPRESA.redes.facebook],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: EMPRESA.telefono,
      email: EMPRESA.email,
      contactType: 'sales',
      availableLanguage: 'es',
    },
    knowsAbout: ['Paneles SIP', 'Casas en kit de autoconstrucción', 'Panelizado', 'Construcción eficiente'],
  };
}

export function schemaSitioWeb() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#sitio`,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: 'es-CL',
    publisher: { '@id': ORG_ID },
  };
}

export function schemaMigas(migas: Array<{ nombre: string; ruta: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: migas.map((m, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: m.nombre,
      item: urlAbsoluta(m.ruta),
    })),
  };
}

/** Un modelo de casa como producto con su precio de kit */
export function schemaModelo(modelo: Modelo, precioKit: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_URL}/modelos/${modelo.slug}#producto`,
    name: `Casa ${modelo.nombre} · kit de autoconstrucción en panel SIP`,
    description: modelo.descripcion || modelo.resumen,
    image: [modelo.portada.url, ...modelo.galeria.map((g) => g.url)].map(urlAbsoluta),
    url: `${SITE_URL}/modelos/${modelo.slug}`,
    brand: { '@type': 'Brand', name: SITE_NAME },
    manufacturer: { '@id': ORG_ID },
    category: 'Casas prefabricadas en panel SIP',
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Superficie', value: modelo.superficieM2, unitText: 'm²' },
      { '@type': 'PropertyValue', name: 'Dormitorios', value: modelo.habitaciones },
      { '@type': 'PropertyValue', name: 'Baños', value: modelo.banos },
    ],
    offers: {
      '@type': 'Offer',
      price: precioKit,
      priceCurrency: 'CLP',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: `${SITE_URL}/modelos/${modelo.slug}`,
      seller: { '@id': ORG_ID },
      areaServed: { '@type': 'Country', name: 'Chile' },
    },
  };
}

/** Catálogo de modelos como lista (para la página /modelos) */
export function schemaListaModelos(modelos: Modelo[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Modelos de casas en panel SIP',
    numberOfItems: modelos.length,
    itemListElement: modelos.map((m, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: m.nombre,
      url: `${SITE_URL}/modelos/${m.slug}`,
    })),
  };
}

/** Un panel SIP como producto con precio */
export function schemaPanel(panel: PanelProducto) {
  return {
    '@type': 'Product',
    name: panel.nombre,
    description:
      panel.descripcion ||
      `Panel SIP ${panel.dimensiones ?? ''} con OSB de ${panel.espesorOsb ?? ''} y núcleo EPS de ${panel.espesorEps ?? ''}`.trim(),
    image: urlAbsoluta(panel.imagenUrl || '/images/paneles/panel-sip.png'),
    url: `${SITE_URL}/paneles#${panel.slug}`,
    sku: panel.slug,
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      price: panel.precioClp,
      priceCurrency: 'CLP',
      availability: 'https://schema.org/InStock',
      seller: { '@id': ORG_ID },
    },
  };
}

export function schemaListaPaneles(paneles: PanelProducto[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Paneles SIP por unidad',
    numberOfItems: paneles.length,
    itemListElement: paneles.map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: schemaPanel(p) })),
  };
}

/** Preguntas frecuentes: habilita el resultado enriquecido de FAQ */
export function schemaFaqs(faqs: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.pregunta,
      acceptedAnswer: {
        '@type': 'Answer',
        text: [f.respuesta, ...(f.puntos ?? []).map((p) => `${p.titulo}: ${p.texto}`)].filter(Boolean).join(' '),
      },
    })),
  };
}

/** Una obra construida */
export function schemaProyecto(proyecto: Proyecto) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${SITE_URL}/proyecto/${proyecto.slug}#obra`,
    name: proyecto.nombre,
    description: proyecto.resumen,
    image: [proyecto.portada.url, ...proyecto.galeria.map((g) => g.url)].map(urlAbsoluta),
    url: `${SITE_URL}/proyecto/${proyecto.slug}`,
    creator: { '@id': ORG_ID },
    dateCreated: String(proyecto.anoConstruccion),
    locationCreated: { '@type': 'Place', name: proyecto.ubicacion },
    keywords: ['casa en panel SIP', proyecto.region.nombre, `${proyecto.superficieM2} m²`],
  };
}

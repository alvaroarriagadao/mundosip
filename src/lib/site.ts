/**
 * Identidad pública del sitio para SEO: URL canónica, nombre, datos de
 * contacto y redes. Una sola fuente para metadatos, sitemap, JSON-LD y
 * footer, así nunca se contradicen.
 */

/** Dominio canónico. El apex (mundosip.cl) redirige aquí con 308. */
export const SITE_URL = 'https://www.mundosip.cl';

export const SITE_NAME = 'MundoSIP';

export const SITE_DESCRIPTION =
  'Fabricamos paneles SIP en Purranque, Región de Los Lagos: casas en kit de autoconstrucción, venta de paneles SIP por unidad y panelizado a medida, con despacho a todo Chile.';

export const EMPRESA = {
  nombreLegal: 'Mundo SIP',
  email: 'contacto.mundosip@gmail.com',
  telefono: '+56940367867',
  telefonoDisplay: '+56 9 4036 7867',
  direccion: {
    calle: 'Arturo Prat 742',
    comuna: 'Purranque',
    region: 'Los Lagos',
    codigoPostal: '5380000',
    pais: 'CL',
  },
  /** Coordenadas aproximadas del centro de Purranque */
  geo: { lat: -40.9128, lng: -73.1594 },
  redes: {
    instagram: 'https://www.instagram.com/mundo.sip/',
    facebook: 'https://www.facebook.com/profile.php?id=61559937455566',
    whatsapp: 'https://wa.me/56940367867',
  },
} as const;

/**
 * Base de Open Graph para TODAS las páginas. Next reemplaza el objeto
 * `openGraph` completo cuando una página define el suyo, así que cada
 * una lo extiende con `...OG_BASE` para no perder sitio e idioma.
 */
export const OG_BASE = { type: 'website', locale: 'es_CL', siteName: SITE_NAME } as const;

/** URL absoluta a partir de una ruta del sitio o de una URL ya absoluta */
export function urlAbsoluta(ruta: string): string {
  if (/^https?:\/\//.test(ruta)) return ruta;
  return `${SITE_URL}${ruta.startsWith('/') ? ruta : `/${ruta}`}`;
}

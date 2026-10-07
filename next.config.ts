import type { NextConfig } from "next";

/**
 * Redirecciones permanentes (308) desde las URLs del sitio anterior en
 * WordPress (WooCommerce + tema inmobiliario) hacia su equivalente aquí.
 * Google todavía las tiene indexadas; así traspasan su autoridad en vez
 * de morir en un 404. Lo que no tiene equivalente (páginas demo del tema,
 * feeds, wp-admin) responde 410 en src/proxy.ts.
 */
const REDIRECCIONES_SITIO_ANTERIOR = [
  // Tienda WooCommerce → tienda de paneles
  { source: '/product/:path*', destination: '/paneles' },
  { source: '/product-tag/:path*', destination: '/paneles' },
  { source: '/product-category/:path*', destination: '/paneles' },
  { source: '/shop', destination: '/paneles' },
  { source: '/shop/:path*', destination: '/paneles' },
  { source: '/tienda', destination: '/paneles' },
  { source: '/tienda/:path*', destination: '/paneles' },
  { source: '/paneles-sip', destination: '/paneles' },
  { source: '/paneles-sip/:path*', destination: '/paneles' },
  { source: '/cart', destination: '/paneles' },
  { source: '/checkout', destination: '/paneles' },
  { source: '/my-account', destination: '/paneles' },
  // Tema inmobiliario: "propiedades" eran los modelos de casa
  { source: '/property_type/:path*', destination: '/modelos' },
  { source: '/property/:path*', destination: '/modelos' },
  { source: '/properties', destination: '/modelos' },
  { source: '/properties/:path*', destination: '/modelos' },
  { source: '/kit-autoconstruccion', destination: '/modelos' },
  { source: '/kit-autoconstruccion/:path*', destination: '/modelos' },
  { source: '/casas', destination: '/modelos' },
  { source: '/casas/:path*', destination: '/modelos' },
  // Portafolio de obras → proyectos
  { source: '/blog/portfolio_entries/:path*', destination: '/proyectos' },
  { source: '/portfolio_entries/:path*', destination: '/proyectos' },
  { source: '/portfolio', destination: '/proyectos' },
  { source: '/portfolio/:path*', destination: '/proyectos' },
  { source: '/obras', destination: '/proyectos' },
  { source: '/obras/:path*', destination: '/proyectos' },
  // Páginas institucionales
  { source: '/nosotros', destination: '/' },
  { source: '/quienes-somos', destination: '/' },
  { source: '/inicio', destination: '/' },
  { source: '/home', destination: '/' },
  { source: '/faq', destination: '/preguntas-frecuentes' },
  { source: '/faqs', destination: '/preguntas-frecuentes' },
  { source: '/preguntas', destination: '/preguntas-frecuentes' },
  { source: '/contactanos', destination: '/contacto' },
  { source: '/contact', destination: '/contacto' },
  { source: '/cotizar', destination: '/contacto' },
  { source: '/cotizacion', destination: '/contacto' },
];

const nextConfig: NextConfig = {
  async redirects() {
    return REDIRECCIONES_SITIO_ANTERIOR.map((r) => ({ ...r, permanent: true }));
  },
  images: {
    // Los renders/imágenes vivirán en Cloudinary (fase 2); la DB solo guarda URLs
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;

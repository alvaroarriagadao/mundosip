import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import JsonLd from '@/components/seo/JsonLd';
import { schemaEmpresa, schemaSitioWeb } from '@/features/seo/schema';
import { OG_BASE, OG_IMAGEN, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';

import BotonWhatsApp from '@/components/layout/BotonWhatsApp';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import LenisProvider from '@/components/layout/LenisProvider';
import ScrollProgress from '@/components/layout/ScrollProgress';
import { lato, montserrat, spaceMono } from '@/theme/fonts';
import ThemeRegistry from '@/theme/ThemeRegistry';

import '@/styles/globals.css';

/**
 * Metadatos globales. `metadataBase` convierte en absolutas las rutas
 * relativas de canonical y Open Graph de todas las páginas; cada página
 * declara su propio `alternates.canonical`.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'MundoSIP · Casas en paneles SIP y kits de autoconstrucción en Chile',
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'paneles SIP',
    'panel SIP Chile',
    'casas SIP',
    'kit de autoconstrucción',
    'casas prefabricadas',
    'panelizado',
    'venta de paneles SIP',
    'Purranque',
    'Los Lagos',
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'construction',
  alternates: { canonical: '/' },
  openGraph: {
    ...OG_BASE,
    url: '/',
    title: 'MundoSIP · Casas en paneles SIP y kits de autoconstrucción en Chile',
    description: SITE_DESCRIPTION,
  },
  // Solo el tipo de tarjeta: título y descripción se toman de cada página
  twitter: { card: 'summary_large_image', images: [OG_IMAGEN.url] },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  // Verificación de Google Search Console sin tocar código: basta con
  // definir GOOGLE_SITE_VERIFICATION en Vercel
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  formatDetection: { telephone: true, email: true, address: true },
};

export const viewport: Viewport = {
  themeColor: '#132E38',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-CL" className={`${montserrat.variable} ${lato.variable} ${spaceMono.variable}`}>
      <body>
        <JsonLd data={[schemaEmpresa(), schemaSitioWeb()]} />
        <ThemeRegistry>
          <LenisProvider />
          <ScrollProgress />
          <Header />
          <main>{children}</main>
          <Footer />
          <BotonWhatsApp />
        </ThemeRegistry>
      </body>
    </html>
  );
}

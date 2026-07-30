import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import LenisProvider from '@/components/layout/LenisProvider';
import ScrollProgress from '@/components/layout/ScrollProgress';
import { lato, montserrat, spaceMono } from '@/theme/fonts';
import ThemeRegistry from '@/theme/ThemeRegistry';

import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'MundoSIP — Casas en paneles SIP, listas para armar',
    template: '%s · MundoSIP',
  },
  description:
    'Modelos de casas en kit de autoconstrucción, venta de paneles SIP y panelizado a medida. Diseño propio, fabricación precisa y despacho a todo Chile.',
};

export const viewport: Viewport = {
  themeColor: '#132E38',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${montserrat.variable} ${lato.variable} ${spaceMono.variable}`}>
      <body>
        <ThemeRegistry>
          <LenisProvider />
          <ScrollProgress />
          <Header />
          <main>{children}</main>
          <Footer />
        </ThemeRegistry>
      </body>
    </html>
  );
}

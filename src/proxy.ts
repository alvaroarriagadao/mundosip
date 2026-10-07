import { NextResponse, type NextRequest } from 'next/server';

/**
 * Restos del WordPress anterior que no tienen equivalente en este sitio
 * (páginas demo del tema, feeds, panel de WordPress, taxonomías). Un 410
 * "Gone" le dice a Google que la URL se eliminó a propósito y la saca
 * del índice más rápido que un 404.
 *
 * Las URLs del sitio viejo que SÍ tienen reemplazo redirigen desde
 * next.config.ts, que se evalúa antes que este archivo.
 */
const RUTAS_ELIMINADAS = [
  /^\/blog(\/|$)/,
  /^\/fancy-boxes(\/|$)/,
  // Páginas demo del tema de WordPress ("Fancy Boxes", tipografía, etc.)
  /^\/shortcodes(\/|$)/,
  /^\/elements(\/|$)/,
  /^\/typography(\/|$)/,
  /^\/portfolio-item(\/|$)/,
  /^\/(agents?|property-search|compare|my-properties|gallery|team|testimonials|pricing|about-us|services)(\/|$)/,
  /^\/category(\/|$)/,
  /^\/tag(\/|$)/,
  /^\/author(\/|$)/,
  /^\/feed(\/|$)/,
  /^\/comments(\/|$)/,
  /^\/wp-(admin|content|includes|json|login\.php|cron\.php)(\/|$)/,
  /^\/xmlrpc\.php$/,
  /^\/elementor(\/|$)/,
  /^\/sample-page(\/|$)/,
];

const CUERPO_410 = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Página eliminada · MundoSIP</title><meta name="robots" content="noindex"></head><body style="font-family:system-ui;padding:3rem;max-width:40rem;margin:auto"><h1>Esta página ya no existe</h1><p>Era parte del sitio anterior de MundoSIP. Encuentra lo que buscas en <a href="https://www.mundosip.cl/">www.mundosip.cl</a>: <a href="https://www.mundosip.cl/modelos">modelos de casas</a>, <a href="https://www.mundosip.cl/paneles">paneles SIP</a> y <a href="https://www.mundosip.cl/proyectos">proyectos</a>.</p></body></html>`;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (RUTAS_ELIMINADAS.some((re) => re.test(pathname))) {
    return new NextResponse(CUERPO_410, {
      status: 410,
      headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex' },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/blog/:path*',
    '/fancy-boxes/:path*',
    '/shortcodes/:path*',
    '/elements/:path*',
    '/typography/:path*',
    '/portfolio-item/:path*',
    '/agents/:path*',
    '/agent/:path*',
    '/property-search/:path*',
    '/compare/:path*',
    '/my-properties/:path*',
    '/gallery/:path*',
    '/team/:path*',
    '/testimonials/:path*',
    '/pricing/:path*',
    '/about-us/:path*',
    '/services/:path*',
    '/category/:path*',
    '/tag/:path*',
    '/author/:path*',
    '/feed/:path*',
    '/comments/:path*',
    '/wp-admin/:path*',
    '/wp-content/:path*',
    '/wp-includes/:path*',
    '/wp-json/:path*',
    '/wp-login.php',
    '/wp-cron.php',
    '/xmlrpc.php',
    '/elementor/:path*',
    '/sample-page/:path*',
  ],
};

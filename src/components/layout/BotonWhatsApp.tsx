'use client';

import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Box from '@mui/material/Box';
import { usePathname } from 'next/navigation';

import { enlaceWhatsApp } from '@/lib/contacto';
import { colors, motionTokens } from '@/theme/tokens';

/** Verde oficial de WhatsApp: es lo que la gente reconoce al instante */
const VERDE_WHATSAPP = '#25D366';
const VERDE_HOVER = '#1EBE5A';

/**
 * Mensaje ya escrito según la página desde donde se escribe, para que
 * el equipo sepa de qué viene la consulta sin tener que preguntar.
 * El nombre del modelo o proyecto sale del título de la pestaña
 * ("Tulipán · 80 m² · MundoSIP"); si no se puede leer, cae en un
 * mensaje genérico de esa sección.
 */
function mensajeSegunPagina(ruta: string, titulo: string): string {
  const saludo = 'Hola MundoSIP,';

  if (/^\/modelos\/[^/]+\/cotizar/.test(ruta)) {
    const nombre = titulo.match(/^Cotizar (.+?) llave en mano/)?.[1];
    return `${saludo} estoy cotizando ${nombre ? `el modelo ${nombre}` : 'un modelo'} y tengo una consulta.`;
  }
  if (/^\/modelos\/[^/]+/.test(ruta)) {
    const nombre = titulo.split(' · ')[0]?.trim();
    return `${saludo} me interesa ${nombre ? `el modelo ${nombre}` : 'uno de sus modelos'}.`;
  }
  if (/^\/proyecto\/[^/]+/.test(ruta)) {
    const nombre = titulo.split(' · ')[0]?.trim();
    return `${saludo} vi ${nombre ? `el proyecto ${nombre}` : 'uno de sus proyectos'} y me gustaría saber más.`;
  }
  if (ruta.startsWith('/paneles')) return `${saludo} quiero cotizar paneles SIP.`;
  if (ruta.startsWith('/modelos')) return `${saludo} quiero información sobre sus modelos de casas.`;
  return `${saludo} me gustaría más información.`;
}

/**
 * Botón flotante de WhatsApp, abajo a la derecha en todo el sitio
 * público (en /admin no aparece: ahí trabaja el equipo).
 *
 * - En escritorio, al pasar el mouse se despliega "¿Hablamos?".
 * - Respeta la zona segura del iPhone (barra de inicio).
 * - Queda por debajo de menús, galerías y modales (z-index 1250).
 * - Entra con un pequeño retardo para no competir con el hero.
 */
export default function BotonWhatsApp() {
  const ruta = usePathname();
  if (ruta.startsWith('/admin')) return null;

  return (
    <Box
      component="a"
      href={enlaceWhatsApp(mensajeSegunPagina(ruta, ''))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      // El título de la pestaña ya está actualizado recién al hacer clic:
      // se arma ahí el mensaje con el nombre del modelo o proyecto.
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
        e.currentTarget.href = enlaceWhatsApp(mensajeSegunPagina(ruta, document.title));
      }}
      sx={{
        position: 'fixed',
        right: { xs: 16, md: 28 },
        bottom: { xs: 'calc(16px + env(safe-area-inset-bottom))', md: 'calc(28px + env(safe-area-inset-bottom))' },
        zIndex: 1250,
        display: 'flex',
        alignItems: 'center',
        height: 58,
        pl: '14px',
        pr: '14px',
        borderRadius: 999,
        bgcolor: VERDE_WHATSAPP,
        color: '#FFFFFF',
        textDecoration: 'none',
        boxShadow: '0 10px 28px -8px rgba(13, 33, 41, 0.45), 0 2px 6px rgba(13, 33, 41, 0.18)',
        transition: `background-color 0.25s ${motionTokens.easeCss}, transform 0.25s ${motionTokens.easeCss}, box-shadow 0.25s ${motionTokens.easeCss}`,
        animation: `entrada-wa 0.5s ${motionTokens.easeCss} 1.2s both`,
        '@keyframes entrada-wa': {
          from: { opacity: 0, transform: 'translateY(16px) scale(0.85)' },
          to: { opacity: 1, transform: 'none' },
        },
        '&:hover': {
          bgcolor: VERDE_HOVER,
          transform: 'translateY(-2px)',
          boxShadow: '0 14px 32px -8px rgba(13, 33, 41, 0.5), 0 3px 8px rgba(13, 33, 41, 0.2)',
        },
        '&:focus-visible': { outline: `3px solid ${colors.tanLight}`, outlineOffset: 3 },
        // La etiqueta se despliega solo en dispositivos con mouse
        '@media (hover: hover)': {
          '&:hover .wa-etiqueta, &:focus-visible .wa-etiqueta': { maxWidth: 130, opacity: 1, ml: 1 },
        },
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      }}
    >
      <WhatsAppIcon sx={{ fontSize: 30 }} />
      <Box
        component="span"
        className="wa-etiqueta"
        sx={{
          maxWidth: 0,
          opacity: 0,
          ml: 0,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          fontWeight: 700,
          fontSize: '0.95rem',
          transition: `max-width 0.35s ${motionTokens.easeCss}, opacity 0.25s ${motionTokens.easeCss}, margin 0.35s ${motionTokens.easeCss}`,
        }}
      >
        ¿Hablamos?
      </Box>
    </Box>
  );
}

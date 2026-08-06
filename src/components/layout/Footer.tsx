'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { MapPin, MessageCircle, Phone } from 'lucide-react';
import NextLink from 'next/link';

import Container from '@/components/ui/Container';
import { colors } from '@/theme/tokens';
import { displayFamily, monoFamily } from '@/theme/typography';

import Logo from './Logo';
import { navItems } from './nav';

const CONTACTO = {
  email: 'contacto@mundosip.cl',
  telefonoDisplay: '+56 9 4036 7867',
  telefonoHref: 'tel:+56940367867',
  whatsapp: 'https://wa.me/56940367867',
  direccion: 'Arturo Prat 742, Purranque, Los Lagos',
  direccionMaps: 'https://maps.google.com/?q=Arturo+Prat+742,+Purranque,+Chile',
  facebook: 'https://www.facebook.com/profile.php?id=61559937455566',
  instagram: 'https://www.instagram.com/mundo.sip/',
};

/* lucide-react ya no incluye íconos de marcas; SVGs propios trazo 2px para calzar con lucide */
function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const footerLinkSx = {
  color: 'rgba(246, 241, 234, 0.75)',
  textDecoration: 'none',
  fontSize: '1rem',
  lineHeight: 1.55,
  width: 'fit-content',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 1,
  transition: 'color 0.25s ease',
  '&:hover': { color: colors.cream },
} as const;

const columnTitleSx = {
  fontFamily: monoFamily,
  fontWeight: 700,
  fontSize: '0.78rem',
  letterSpacing: '0.28em',
  color: colors.tan,
  mb: 0.5,
} as const;

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: colors.tealNight, color: colors.cream, overflow: 'hidden' }}>
      <Container sx={{ pt: { xs: 6, md: 8 }, pb: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1.5fr 1fr 1.1fr 1.2fr' },
            gap: { xs: 4, md: 6 },
            pb: { xs: 4, md: 6 },
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 340 }}>
            <Logo variant="light" height={46} />
            <Typography sx={{ color: 'rgba(246, 241, 234, 0.75)', fontSize: '1rem', lineHeight: 1.65 }}>
              Casas en paneles SIP diseñadas en Chile: kits de autoconstrucción, venta de paneles y
              panelizado a medida.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, ml: -1 }}>
              <IconButton
                component="a"
                href={CONTACTO.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="MundoSIP en Instagram"
                sx={{ color: 'rgba(246, 241, 234, 0.75)', '&:hover': { color: colors.tan } }}
              >
                <InstagramIcon size={20} />
              </IconButton>
              <IconButton
                component="a"
                href={CONTACTO.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="MundoSIP en Facebook"
                sx={{ color: 'rgba(246, 241, 234, 0.75)', '&:hover': { color: colors.tan } }}
              >
                <FacebookIcon size={20} />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography sx={columnTitleSx}>NAVEGACIÓN</Typography>
            {navItems.map((item) => (
              <Box key={item.href} component={NextLink} href={item.href} sx={footerLinkSx}>
                {item.label}
              </Box>
            ))}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography sx={columnTitleSx}>CONTACTO</Typography>
            <Box component="a" href={`mailto:${CONTACTO.email}`} sx={footerLinkSx}>
              {CONTACTO.email}
            </Box>
            {/* Enlace tel: solo en pantallas táctiles: en escritorio abre
                Skype/FaceTime, que casi nadie usa. Ahí va como texto. */}
            <Box
              component="a"
              href={CONTACTO.telefonoHref}
              sx={{ ...footerLinkSx, display: 'none', '@media (hover: none) and (pointer: coarse)': { display: 'inline-flex' } }}
            >
              <Phone size={15} aria-hidden />
              {CONTACTO.telefonoDisplay}
            </Box>
            <Box
              sx={{
                ...footerLinkSx,
                cursor: 'text',
                '&:hover': { color: 'rgba(246, 241, 234, 0.75)' },
                '@media (hover: none) and (pointer: coarse)': { display: 'none' },
              }}
            >
              <Phone size={15} aria-hidden />
              {CONTACTO.telefonoDisplay}
            </Box>
            <Box component="a" href={CONTACTO.whatsapp} target="_blank" rel="noopener noreferrer" sx={footerLinkSx}>
              <MessageCircle size={15} aria-hidden />
              WhatsApp
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography sx={columnTitleSx}>VISÍTANOS</Typography>
            <Box
              component="a"
              href={CONTACTO.direccionMaps}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ ...footerLinkSx, alignItems: 'flex-start', maxWidth: 240 }}
            >
              <Box component="span" sx={{ pt: 0.35, flexShrink: 0 }}>
                <MapPin size={15} aria-hidden />
              </Box>
              {CONTACTO.direccion}
            </Box>
            <Typography sx={{ color: 'rgba(246, 241, 234, 0.6)', fontSize: '1rem' }}>
              Despacho a todo Chile
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            borderTop: `1px solid ${colors.lineDark}`,
            pt: 2.5,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ fontFamily: monoFamily, fontSize: '0.85rem', color: 'rgba(246, 241, 234, 0.65)' }}>
            © {new Date().getFullYear()} MundoSIP — Construcción en paneles SIP · Purranque, Chile
          </Typography>
          <Typography sx={{ fontFamily: monoFamily, fontSize: '0.85rem', color: 'rgba(246, 241, 234, 0.65)' }}>
            Desarrollado por Álvaro Arriagada
          </Typography>
        </Box>
      </Container>

      {/* Wordmark decorativo, más contenido que antes para acotar la altura total */}
      <Box aria-hidden sx={{ display: 'flex', justifyContent: 'center', px: 2 }}>
        <Typography
          component="span"
          sx={{
            fontFamily: displayFamily,
            fontWeight: 900,
            fontSize: 'clamp(2.6rem, 9vw, 7.5rem)',
            lineHeight: 0.78,
            letterSpacing: '-0.02em',
            color: 'transparent',
            WebkitTextStroke: '1px rgba(246, 241, 234, 0.13)',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            transform: 'translateY(24%)',
          }}
        >
          MUNDOSIP
        </Typography>
      </Box>
    </Box>
  );
}

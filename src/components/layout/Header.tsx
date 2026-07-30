'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { useMotionValueEvent, useScroll } from 'framer-motion';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import { useState } from 'react';

import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import { colors, layout, motionTokens } from '@/theme/tokens';
import { displayFamily } from '@/theme/typography';

import Logo from './Logo';
import MobileMenu from './MobileMenu';
import { navItems } from './nav';

/**
 * Header fijo: transparente (texto crema) sobre el hero oscuro de la home,
 * sólido con blur al hacer scroll o en páginas interiores.
 */
export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 40));

  // Solo la home tiene hero oscuro a pantalla completa detrás del header
  const overHero = pathname === '/' && !scrolled;

  return (
    <>
      <Box
        component="header"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1300,
          color: overHero ? colors.cream : 'text.primary',
          bgcolor: overHero ? 'transparent' : 'rgba(246, 241, 234, 0.86)',
          backdropFilter: overHero ? 'none' : 'blur(14px)',
          borderBottom: '1px solid',
          borderColor: overHero ? 'transparent' : 'divider',
          transition: `background-color 0.4s ${motionTokens.easeCss}, color 0.4s ${motionTokens.easeCss}, border-color 0.4s ${motionTokens.easeCss}, backdrop-filter 0.4s ${motionTokens.easeCss}`,
        }}
      >
        <Container
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: {
              xs: `${layout.headerHeight.mobile}px`,
              md: scrolled ? '68px' : `${layout.headerHeight.desktop}px`,
            },
            transition: `height 0.4s ${motionTokens.easeCss}`,
          }}
        >
          <Logo variant={overHero ? 'light' : 'dark'} height={40} />

          {/* Menú agrupado a la derecha, junto al CTA (referencia losrios) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { lg: 4, xl: 5 }, ml: 'auto' }}>
          <Box component="nav" aria-label="Principal" sx={{ display: { xs: 'none', lg: 'flex' }, gap: 3 }}>
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Box
                  key={item.href}
                  component={NextLink}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  sx={{
                    position: 'relative',
                    textDecoration: 'none',
                    color: 'inherit',
                    fontFamily: displayFamily,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    letterSpacing: '0.11em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    py: 0.5,
                    opacity: active ? 1 : 0.82,
                    transition: `opacity ${motionTokens.dur.hover}s ${motionTokens.easeCss}`,
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: '1.5px',
                      bgcolor: 'secondary.main',
                      transform: active ? 'scaleX(1)' : 'scaleX(0)',
                      transformOrigin: 'left center',
                      transition: `transform 0.35s ${motionTokens.easeCss}`,
                    },
                    '&:hover': { opacity: 1 },
                    '&:hover::after': { transform: 'scaleX(1)' },
                  }}
                >
                  {item.label}
                </Box>
              );
            })}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              href="/contacto"
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Cotiza tu proyecto
            </Button>
            <IconButton
              aria-label="Abrir menú"
              onClick={() => setMenuOpen(true)}
              sx={{ display: { lg: 'none' }, color: 'inherit' }}
            >
              <Menu size={24} />
            </IconButton>
          </Box>
          </Box>
        </Container>
      </Box>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

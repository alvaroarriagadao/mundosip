'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import NextLink from 'next/link';
import { useEffect } from 'react';

import Button from '@/components/ui/Button';
import { EASE } from '@/lib/motion';
import { colors } from '@/theme/tokens';
import { displayFamily, monoFamily } from '@/theme/typography';

import { navItems } from './nav';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

/** Menú móvil a pantalla completa sobre teal profundo, links escalonados */
export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1400,
            background: colors.tealNight,
            color: colors.cream,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              px: 2.5,
              height: 72,
              alignItems: 'center',
            }}
          >
            <IconButton onClick={onClose} aria-label="Cerrar menú" sx={{ color: colors.cream }}>
              <X size={26} />
            </IconButton>
          </Box>

          <Box
            component="nav"
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              px: 4,
              gap: 0.5,
            }}
          >
            {navItems.map((item, i) => (
              <Box key={item.href} sx={{ overflow: 'hidden' }}>
                <motion.div
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  exit={{ y: '110%', transition: { duration: 0.25 } }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.08 + i * 0.06 }}
                >
                  <Box
                    component={NextLink}
                    href={item.href}
                    onClick={onClose}
                    sx={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 2,
                      py: 1.25,
                      textDecoration: 'none',
                      color: colors.cream,
                      fontFamily: displayFamily,
                      fontWeight: 900,
                      fontSize: 'clamp(1.9rem, 8vw, 2.6rem)',
                      letterSpacing: '-0.02em',
                      '&:active': { color: colors.tan },
                    }}
                  >
                    <Box
                      component="span"
                      sx={{ fontFamily: monoFamily, fontSize: '0.7rem', color: colors.tan, letterSpacing: '0.2em' }}
                    >
                      0{i + 1}
                    </Box>
                    {item.label}
                  </Box>
                </motion.div>
              </Box>
            ))}
          </Box>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.35 }}
          >
            <Box sx={{ px: 4, pb: 6 }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                arrow
                href="/contacto"
                onClick={onClose}
              >
                Cotiza tu proyecto
              </Button>
            </Box>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

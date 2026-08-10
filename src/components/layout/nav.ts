export interface NavItem {
  label: string;
  href: string;
}

export const navItems: NavItem[] = [
  { label: 'Inicio', href: '/' },
  // Los dos productos juntos: la casa completa y el material suelto
  { label: 'Modelos', href: '/modelos' },
  { label: 'Paneles', href: '/paneles' },
  { label: 'Proyectos', href: '/proyectos' },
  { label: 'Preguntas frecuentes', href: '/preguntas-frecuentes' },
  { label: 'Contacto', href: '/contacto' },
];

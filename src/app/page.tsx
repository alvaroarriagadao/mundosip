import FeaturedProjects from '@/components/sections/FeaturedProjects';
import Hero from '@/components/sections/Hero';
import Process from '@/components/sections/Process';
import Stats from '@/components/sections/Stats';

// Los proyectos destacados vienen de la base de datos: un cambio en
// /admin/proyectos debe verse en la portada sin esperar otro build
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <>
      <Hero videoSrc="/videos/hero.mp4" posterSrc="/videos/hero-poster.jpg" />
      <Stats />
      <FeaturedProjects />
      <Process />
    </>
  );
}

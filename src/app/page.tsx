import FeaturedProjects from '@/components/sections/FeaturedProjects';
import Hero from '@/components/sections/Hero';
import Process from '@/components/sections/Process';
import Stats from '@/components/sections/Stats';

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

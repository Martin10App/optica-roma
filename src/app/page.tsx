import HeroSection from '@/components/home/HeroSection';
import CategoriasSection from '@/components/home/CategoriasSection';
import RecienLlegadosSection from '@/components/home/RecienLlegadosSection';
import PromosSection from '@/components/home/PromosSection';
import OreiroSection from '@/components/home/OreiroSection';
import MarcasSection from '@/components/home/MarcasSection';
import ServicesSection from '@/components/home/ServicesSection';
import CoverageSection from '@/components/home/CoverageSection';
import CrystalsSection from '@/components/home/CrystalsSection';
import AboutSection from '@/components/home/AboutSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import ContactSection from '@/components/home/ContactSection';
import NewsletterSection from '@/components/home/NewsletterSection';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeroSection />
      <CategoriasSection />
      <RecienLlegadosSection />
      <PromosSection />
      <OreiroSection />
      <MarcasSection />
      <ServicesSection />
      <CoverageSection />
      <CrystalsSection />
      <AboutSection />
      <TestimonialsSection />
      <ContactSection />
      <NewsletterSection />
    </div>
  );
}

import HeroSection from '@/components/home/HeroSection';
import MarcasSection from '@/components/home/MarcasSection';
import PromosSection from '@/components/home/PromosSection';
import ServicesSection from '@/components/home/ServicesSection';
import CatalogSection from '@/components/home/CatalogSection';
import AboutSection from '@/components/home/AboutSection';
import CoverageSection from '@/components/home/CoverageSection';
import CheckupSection from '@/components/home/CheckupSection';
import ContactSection from '@/components/home/ContactSection';
import BranchesSection from '@/components/home/BranchesSection';
import NewsletterSection from '@/components/home/NewsletterSection';
import CrystalsSection from '@/components/home/CrystalsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <MarcasSection />
      <PromosSection />
      <ServicesSection />
      <CatalogSection />
      <CrystalsSection />
      <AboutSection />
      <CoverageSection />
      <CheckupSection />
      <TestimonialsSection />
      <ContactSection />
      <BranchesSection />
      <NewsletterSection />
    </div>
  );
}


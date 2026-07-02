'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Phone, ArrowRight, MapPin, Clock, Star } from 'lucide-react';

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [stockCount, setStockCount] = useState(0);

  useEffect(() => {
    // Scroll reveal + Counter animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Trigger del contador
            if (entry.target.classList.contains('hero-counter-trigger')) {
              let current = 0;
              const max = 700;
              const duration = 1500; // 1.5 segundos
              const stepTime = 30; // ms por frame aproximado
              const steps = duration / stepTime;
              const increment = max / steps;

              const counterInterval = setInterval(() => {
                current += increment;
                if (current >= max) {
                  setStockCount(max);
                  clearInterval(counterInterval);
                } else {
                  setStockCount(Math.floor(current));
                }
              }, stepTime);
            }
            
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );
    
    const elements = sectionRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="relative min-h-[90vh] flex items-center overflow-hidden bg-white pt-20"
    >
      {/* Fondo Aurora Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="aurora-blob bg-blue-900 w-[500px] h-[500px] -top-32 -left-32" />
        <div className="aurora-blob bg-blue-500 w-[400px] h-[400px] top-1/4 right-0" style={{ animationDelay: '-5s' }} />
        <div className="aurora-blob bg-teal-500 w-[450px] h-[450px] -bottom-32 left-1/3" style={{ animationDelay: '-10s' }} />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[60px]" />
      </div>

      {/* Imagen de fondo (local óptica o modelo) encima del aurora */}
      <div className="absolute inset-0 z-1">
        <Image
          src="/media/expositor-de-armazones.png"
          alt="Óptica Roma - Interior del local"
          fill
          className="object-cover object-center opacity-15"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wide mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Revisión visual gratuita
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6">
              <span className="block overflow-hidden">
                <span className="block reveal-text-line delay-text-1">Tu visión en las</span>
              </span>
              <span className="block overflow-hidden">
                <span className="block text-blue-700 reveal-text-line delay-text-2">mejores manos</span>
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-8 max-w-xl">
              Más de 15 años cuidando la salud visual de Las Piedras y Canelones.
              Atención personalizada, taller propio y las mejores marcas de
              cristales Varilux.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <a
                href="https://wa.me/598098871673?text=Hola!%20Quiero%20agendarme%20para%20una%20revisión%20visual%20gratuita."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cta btn-shine text-center group"
              >
                <Phone size={18} />
                Agendá tu cita gratis
              </a>
              <a href="#catalogo" className="btn-outline text-center group">
                Ver catálogo
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
            </div>

            {/* Info pills */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MapPin size={16} className="text-blue-600" />
                <span>Las Piedras & Canelones</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock size={16} className="text-blue-600" />
                <span>Lun–Vie 9:00–18:30 | Sáb 9:00–13:00</span>
              </div>
            </div>

            {/* Trust Bar */}
            <div className="flex items-center gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <Star size={16} className="fill-amber-500 text-amber-500" />
                <span className="font-bold text-slate-700">4.9</span>
                <span className="text-xs sm:text-sm text-slate-500 ml-0.5">+42 reseñas en Google</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-300" />
              <div className="text-xs sm:text-sm font-medium text-slate-600">
                15+ años de experiencia
              </div>
            </div>
          </div>

          {/* Right: Video destacado */}
          <div className="reveal delay-200 hero-counter-trigger hidden lg:block relative animate-float">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-50 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] group">
              <video preload="metadata" poster="/media/video-horizontal-optica-poster.jpg" autoPlay loop muted playsInline className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                <source src="/media/video-horizontal-optica.mp4" type="video/mp4" />
              </video>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 z-10 bg-white rounded-xl p-4 shadow-xl border border-slate-100 transition-transform hover:-translate-y-1">
              <p className="text-2xl font-extrabold text-blue-700">+{stockCount}</p>
              <p className="text-xs text-slate-500">armazones en stock</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


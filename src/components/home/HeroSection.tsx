'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Phone, ArrowRight, MapPin, Clock } from 'lucide-react';

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll reveal simple
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
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
      {/* Imagen de fondo (local óptica o modelo) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/media/expositor-de-armazones.png"
          alt="Óptica Roma - Interior del local"
          fill
          className="object-cover object-center opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/70" />
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
              Tu visión en las{' '}
              <span className="text-blue-700">mejores manos</span>
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
                className="btn-cta text-center"
              >
                <Phone size={18} />
                Agendá tu cita gratis
              </a>
              <a href="#catalogo" className="btn-outline text-center">
                Ver catálogo
                <ArrowRight size={16} />
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
          </div>

          {/* Right: Video destacado */}
          <div className="reveal delay-200 hidden lg:block relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-50">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                poster="/media/video-poster.jpg"
              >
                <source src="/media/video-horizontal-optica.mp4" type="video/mp4" />
              </video>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 z-10 bg-white rounded-xl p-4 shadow-xl border border-slate-100">
              <p className="text-2xl font-extrabold text-blue-700">+700</p>
              <p className="text-xs text-slate-500">armazones en stock</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

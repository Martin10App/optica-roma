'use client';

import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function OreiroSection() {
  useScrollReveal();

  return (
    <section className="relative w-full py-24 bg-white overflow-hidden border-t border-slate-200">
      {/* Background Image Setup */}
      <div className="absolute inset-0 z-0">
        <img
          src="/media/logos/natalia-oreiro-hero-fw26.jpg"
          alt="Natalia Oreiro Gafas"
          className="object-cover object-top opacity-30 w-full h-full"
        />
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
        <div className="max-w-xl reveal">
          <div className="mb-6 inline-block bg-brand-50 border border-brand-200 px-4 py-1.5 rounded-full shadow-sm">
            <span className="text-brand-800 text-xs font-bold uppercase tracking-widest">Nueva Colección 2026</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 drop-shadow-sm tracking-tight">
            Natalia Oreiro
          </h2>
          <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed font-light">
            Descubrí la nueva línea exclusiva de armazones y gafas de sol diseñados por Natalia Oreiro. 
            Elegancia, diseño y vanguardia en cada detalle.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link
              href="/projects/natalia-oreiro"
              className="inline-flex items-center gap-3 px-8 py-4 bg-brand-800 text-white text-sm font-bold uppercase tracking-wider rounded-full hover:bg-brand-900 hover:scale-105 transition-all shadow-xl"
            >
              Ver Colección
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

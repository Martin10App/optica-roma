'use client';

import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import CatalogSection from '@/components/home/CatalogSection';

export default function NataliaOreiroPage() {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-white pt-24 text-slate-600">
      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://nataliaoreirogafas.com/img/cms/Natalia%20Oreiro/FW26/Natalia%20Oreiro%20oton%CC%83o26_3988_1a.jpg"
            alt="Natalia Oreiro Gafas"
            className="object-cover object-top opacity-60 w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent" />
        </div>
        
        <div className="relative z-10 text-left px-4 max-w-7xl mx-auto w-full reveal">
          <div className="max-w-2xl">
            <div className="section-label mb-5 inline-flex border-slate-900/40 text-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-800 animate-ping-slow" />
              Exclusividad & Diseño
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
              Natalia Oreiro <span className="text-slate-500 font-light block mt-2 text-3xl">Gafas y Armazones</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 font-light max-w-2xl mb-8">
              Una colección que refleja la personalidad, elegancia y vanguardia de Natalia Oreiro. Modelos diseñados para deslumbrar en cada mirada.
            </p>
            <button 
              onClick={() => {
                const el = document.getElementById('catalogo');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white text-sm font-bold uppercase tracking-wider rounded-full hover:bg-slate-800 hover:scale-105 transition-all shadow-xl"
            >
              Ver Colección Completa
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Intro section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center reveal">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6">
              Inspiración y Vanguardia
            </h2>
            <p className="text-slate-500 leading-relaxed mb-6">
              La colección de gafas de Natalia Oreiro combina materiales premium con diseños atrevidos y elegantes. Pensada para la mujer moderna que busca destacar y sentirse empoderada todos los días.
            </p>
            <p className="text-slate-500 leading-relaxed mb-8">
              Descubrí una variedad de armazones de receta y gafas de sol que marcan tendencia. Detalles únicos, colores exclusivos y la calidad óptica que garantiza Optica Roma en cada uno de sus cristales.
            </p>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-white aspect-[4/3]">
            <img
              src="/media/armazones-natalia-oreiro.jpeg"
              alt="Natalia Oreiro Colección"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Catalog Section Integration */}
      <div className="border-t border-slate-100">
        <CatalogSection />
      </div>

      {/* Back button */}
      <div className="text-center py-20 bg-slate-50 border-t border-slate-100">
        <Link href="/#marcas" className="text-slate-500 hover:text-blue-600 font-medium inline-flex items-center gap-2 transition-colors">
          ← Volver a Marcas
        </Link>
      </div>
    </div>
  );
}

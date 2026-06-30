'use client';

import Image from 'next/image';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const brands = [
  { name: 'Ray-Ban', logo: '/media/logos/Ray-Ban_logo.svg.png', fallback: 'Ray-Ban', url: '/?categoria=armazones-de-receta&marca=Ray-Ban#catalogo' },
  { name: 'Armani Exchange', logo: '/media/logos/armani-logo.webp', fallback: 'Armani Exchange', url: '/?categoria=armazones-de-receta&marca=Armani%20Exchange#catalogo' },
  { name: 'Vizzini', logo: '', fallback: 'VIZZINI', url: '/?categoria=armazones-de-receta&marca=Vizzini#catalogo' },
  { name: 'Alma Santa', logo: '', fallback: 'ALMA SANTA', url: '/?categoria=armazones-de-receta&marca=Alma%20Santa#catalogo' },
  { name: 'Viky', logo: '', fallback: 'VIKY', url: '/?categoria=armazones-de-receta&marca=Viky#catalogo' },
  { name: 'Varilux', logo: '/media/logos/varilux-logo.png', fallback: 'Varilux', url: '/projects/varilux-x-series' },
];

export default function MarcasSection() {
  useScrollReveal();

  return (
    <section className="py-16 bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 reveal">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Confianza internacional</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Trabajamos con las mejores marcas</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 reveal">
          {brands.map((brand) => (
            <a
              key={brand.name}
              href={brand.url}
              className="flex items-center justify-center h-24 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 px-6 group"
            >
              {brand.logo ? (
                <img src={brand.logo} alt={brand.name} className="max-h-12 max-w-full object-contain filter grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100 transition-all mix-blend-multiply" />
              ) : (
                <span className="text-lg font-bold text-slate-700 group-hover:text-blue-700 transition-colors tracking-widest uppercase">
                  {brand.fallback}
                </span>
              )}
            </a>
          ))}
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          ¿Buscás una marca en particular?{' '}
          <a href="/#catalogo" className="text-blue-700 font-semibold hover:underline">
            Consultá en nuestro catálogo
          </a>
        </p>
      </div>
    </section>
  );
}

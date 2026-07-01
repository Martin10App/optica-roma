'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const brands = [
  { name: 'Ray-Ban', logo: '/media/logos/Ray-Ban_logo.svg.png', fallback: 'Ray-Ban', url: '/?categoria=armazones-de-receta&marcas=Ray-Ban#catalogo' },
  { name: 'Armani Exchange', logo: '/media/logos/armani-logo.webp', fallback: 'Armani Exchange', url: '/?categoria=armazones-de-receta&marcas=Armani%20Exchange#catalogo' },
  { name: 'Vizzini', logo: '', fallback: 'VIZZINI', url: '/?categoria=armazones-de-receta&marcas=Vizzini#catalogo' },
  { name: 'Alma Santa', logo: '', fallback: 'ALMA SANTA', url: '/?categoria=armazones-de-receta&marcas=Alma%20Santa#catalogo' },
  { name: 'Viky', logo: '', fallback: 'VIKY', url: '/?categoria=armazones-de-receta&marcas=Viky#catalogo' },
  { name: 'Reef', logo: '', fallback: 'REEF', url: '/?categoria=armazones-de-receta&marcas=Reef#catalogo' },
  { name: 'Santorino', logo: '', fallback: 'SANTORINO', url: '/?categoria=armazones-de-receta&marcas=Santorino#catalogo' },
  { name: 'Amadeus', logo: '', fallback: 'Amadeus', url: '/?categoria=armazones-de-receta&marcas=Amadeus#catalogo' },
  { name: 'Natalia Oreiro', logo: 'https://nataliaoreirogafas.com/img/logo-175830415623.svg', fallback: 'NATALIA OREIRO', url: '/?categoria=armazones-de-receta&marcas=Natalia%20Oreiro#catalogo' },
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
            <Link
              key={brand.name}
              href={brand.url}
              scroll={!brand.url.startsWith('/?')}
              onClick={(e) => {
                if (brand.url.startsWith('/?')) {
                  const el = document.getElementById('catalogo');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }}
              className="flex items-center justify-center h-24 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 px-6 group"
            >
              {brand.logo ? (
                <img src={brand.logo} alt={brand.name} className="max-h-12 max-w-full object-contain filter grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100 transition-all mix-blend-multiply" />
              ) : brand.name === 'Amadeus' ? (
                <span className="text-2xl font-serif italic text-slate-700 group-hover:text-blue-700 transition-colors tracking-wide">
                  Amadeus
                </span>
              ) : (
                <span className="text-lg font-bold text-slate-700 group-hover:text-blue-700 transition-colors tracking-widest uppercase">
                  {brand.fallback}
                </span>
              )}
            </Link>
          ))}
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          ¿Buscás una marca en particular?{' '}
          <Link href="/#catalogo" className="text-blue-700 font-semibold hover:underline">
            Consultá en nuestro catálogo
          </Link>
        </p>
      </div>
    </section>
  );
}

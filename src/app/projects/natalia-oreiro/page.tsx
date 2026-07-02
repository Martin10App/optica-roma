'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import CatalogSection from '@/components/home/CatalogSection';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['600','700','800'] });

export default function NataliaOreiroPage() {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-[#2d0f13] pt-20">
      
      {/* 2. HERO */}
      <div className="relative h-screen min-h-[600px] flex items-center overflow-hidden">
        <Image 
          src="/media/logos/natalia-oreiro-hero-fw26.jpg"
          alt="Natalia Oreiro Hero"
          fill
          className="object-cover object-[center_30%]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2d0f13] via-[#2d0f13]/70 to-[#2d0f13]/20" />
        <div className="absolute inset-x-0 bottom-0 h-24 sm:h-32 md:h-40 bg-gradient-to-b from-transparent to-white pointer-events-none z-[1]" />

        <div className="relative z-10 text-left px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full reveal">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex border border-[#c9a227] text-[#f5ece1] bg-transparent backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
              EXCLUSIVIDAD & DISEÑO
            </div>
            <h1 className={`${playfair.className} text-5xl sm:text-7xl font-bold text-[#f5ece1] mb-6 tracking-tight leading-tight drop-shadow-md`}>
              Natalia Oreiro <span className="font-sans font-light block mt-2 text-xl text-[#b8724a]">Gafas y Armazones</span>
            </h1>
            <p className="text-lg md:text-xl text-[#f5ece1] opacity-90 max-w-xl mb-8 drop-shadow-md">
              Una colección que refleja la personalidad, elegancia y vanguardia de Natalia Oreiro. Modelos diseñados para deslumbrar en cada mirada.
            </p>
            <Link 
              href="#catalogo"
              scroll={false}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('catalogo');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#c0203a] text-white text-sm font-bold uppercase tracking-wide rounded-full hover:bg-[#a01a30] hover:scale-105 hover:shadow-xl shadow-[#c0203a]/20 transition-all"
            >
              Ver Colección Completa
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. SECCIÓN "Inspiración y Vanguardia" */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="reveal-left">
              <h2 className={`${playfair.className} text-3xl md:text-4xl font-bold text-[#7a2e2e] mb-6`}>
                Inspiración y Vanguardia
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                La colección de gafas de Natalia Oreiro combina materiales premium con diseños atrevidos y elegantes. Pensada para la mujer moderna que busca destacar y sentirse empoderada todos los días.
              </p>
              <p className="text-slate-600 leading-relaxed mb-8">
                Descubrí una variedad de armazones de receta y gafas de sol que marcan tendencia. Detalles únicos, colores exclusivos y la calidad óptica que garantiza Optica Roma en cada uno de sus cristales.
              </p>
            </div>

            <div className="relative rounded-2xl overflow-hidden border-[1.5px] border-[#c9a227] shadow-2xl aspect-[3/4] reveal-right">
              <img
                src="/media/armazones-natalia-oreiro.jpeg"
                alt="Natalia Oreiro Colección"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. SECCIÓN VIDEO EDITORIAL */}
      <div className="bg-white relative overflow-hidden">
        {/* Blobs decorativos sutiles con la paleta de la marca */}
        <div className="absolute -top-24 -right-24 w-72 h-72 md:w-96 md:h-96 rounded-full bg-[#c9a227]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-0 w-64 h-64 md:w-80 md:h-80 rounded-full bg-[#7a2e2e]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 reveal-left">
              <h2 className={`${playfair.className} text-3xl md:text-4xl font-bold text-[#7a2e2e] mb-6`}>
                Mirá la colección en movimiento
              </h2>
              <p className="text-slate-600 leading-relaxed mb-8">
                Te invitamos a explorar el catálogo completo y descubrir cada detalle de los nuevos modelos. Una experiencia visual diseñada para deslumbrar.
              </p>
              <ul className="space-y-3">
                {[
                  'Diseño exclusivo firmado por Natalia Oreiro',
                  'Materiales premium y acabados de lujo',
                  'Stock limitado disponible en Óptica Roma',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-600">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center bg-[#fdf2f2] border border-[#c0203a]/30 flex-shrink-0">
                      <svg className="w-3 h-3 text-[#c0203a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:w-1/2 w-full flex justify-center lg:justify-end reveal-scale">
              <div className="relative">
                <div className="absolute inset-0 m-auto w-[260px] h-[260px] rounded-full bg-gradient-to-br from-[#c9a227]/25 to-[#7a2e2e]/25 blur-3xl -z-10" />
                <div className="relative mx-auto lg:mx-0 w-full max-w-[340px] aspect-[9/16] rounded-[2rem] overflow-hidden border-2 border-[#c9a227] shadow-2xl">
                  <video
                    src="/media/natalia-oreiro-gafas-compressed.mp4"
                    poster="/media/natalia-oreiro-gafas-compressed-poster.jpg"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. CONTENEDOR DEL CATÁLOGO */}
      <div className="bg-white pt-16">
        <CatalogSection lockedBrand="Natalia Oreiro" title="Colección Natalia Oreiro" />
      </div>

      {/* 6. BOTÓN FINAL "Volver a Marcas" */}
      <div className="text-center py-20 bg-slate-50">
        <Link href="/#marcas" className="text-slate-500 hover:text-[#c0203a] font-medium inline-flex items-center gap-2 transition-colors">
          ← Volver a Marcas
        </Link>
      </div>
    </div>
  );
}

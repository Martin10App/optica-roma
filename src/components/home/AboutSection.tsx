'use client';

import Image from 'next/image';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { CheckCircle2 } from 'lucide-react';

export default function AboutSection() {
  useScrollReveal();

  return (
    <section id="nosotros" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Image */}
          <div className="relative reveal-left">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/5] md:aspect-square border border-slate-200 shadow-xl">
              <Image
                src="/media/expositor-armazoens2.png"
                alt="Óptica Roma Local"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-50/80 via-transparent to-transparent" />
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-8 -right-8 md:bottom-8 md:-right-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl animate-float-delayed z-10 max-w-[200px]">
              <p className="text-4xl font-extrabold text-brand-800 mb-1">
                +15
              </p>
              <p className="text-slate-600 text-sm font-medium leading-snug">
                Años cuidando la visión de tu familia.
              </p>
            </div>
          </div>

          {/* Right: Content */}
          <div className="reveal-right mt-12 lg:mt-0">
            <div className="section-label mb-5 inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-ping-slow" />
              Nuestra Historia
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
              Tu óptica de confianza <br />
              <span className="gradient-text">con tecnología de vanguardia.</span>
            </h2>
            <p className="text-slate-500 text-lg mb-6 leading-relaxed">
              En Óptica Roma combinamos la atención personalizada con los últimos avances en salud visual. Empezamos hace más de 10 años con una misión clara: ofrecer excelencia y el mejor asesoramiento a las familias de Las Piedras y Canelones.
            </p>
            <p className="text-slate-500 text-lg mb-10 leading-relaxed">
              Conocemos a cada cliente por su nombre. Sabemos qué tipo de cristal necesitas para trabajar cómodo frente a la computadora y qué armazón resiste el día a día de tus hijos.
            </p>

            <ul className="space-y-4 mb-10">
              {[
                'Atención cálida, humana y sincera',
                'Taller propio para armados urgentes',
                'Garantía real sin letra chica'
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-600 font-medium">
                  <CheckCircle2 className="text-brand-800" size={20} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}

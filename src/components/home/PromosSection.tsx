'use client';

import Image from 'next/image';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Check, Phone } from 'lucide-react';

export default function PromosSection() {
  useScrollReveal();

  return (
    <section id="promociones" className="py-20 md:py-28 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 reveal">
          <div className="section-label mb-4 inline-flex">Promociones Exclusivas</div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Aprovechá nuestros <span className="text-blue-700">beneficios</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Ofertas reales con todo incluido, sin letras chicas.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {/* Promo 1: $4.900 Armazón + Cristales */}
          <div className="card overflow-hidden reveal">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left: Info */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    Promo Completa — Todo incluido
                  </span>
                </div>

                <p className="text-sm text-slate-500 font-medium mb-1 uppercase tracking-wider">
                  Precio final
                </p>
                <p className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-none mb-6">
                  $<span className="text-blue-700">4.900</span>
                </p>

                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
                  Armazón Ninety + Cristales Monofocales con Antirreflejo
                </h3>
                <p className="text-slate-500 mb-6 leading-relaxed">
                  Llevate un armazón de la colección <strong className="text-slate-700">Ninety</strong> con cristales{' '}
                  <strong className="text-slate-700">monofocales</strong> de material índice 1.56 y tratamiento antirreflejo.
                  <strong className="text-slate-900"> Traé tu receta del médico</strong> y lo hacemos en el momento en nuestro taller propio.
                </p>

                <ul className="space-y-2.5 mb-8">
                  {[
                    'Armazón de la colección Ninety (modelos seleccionados)',
                    'Cristales monofocales material índice 1.56',
                    'Tratamiento antirreflejo completo',
                    'Armado en nuestro taller propio',
                    'Garantía de adaptación 30 días',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={11} className="text-blue-700" />
                      </div>
                      <span className="text-slate-600 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 mb-8">
                  <span className="text-lg">📋</span>
                  <div>
                    <p className="text-amber-700 font-semibold text-sm">Requiere receta médica</p>
                    <p className="text-amber-600/80 text-xs mt-0.5">
                      Traé la receta de tu oftalmólogo o médico de cabecera para poder hacer los cristales con tu graduación exacta.
                    </p>
                  </div>
                </div>

                <a
                  href={`https://wa.me/598098871673?text=Hola!%20Quiero%20consultar%20por%20la%20Promo%20$4900%20Armazón%20Ninety%20+%20Cristales%20Monofocales`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary self-start"
                >
                  <Phone size={16} />
                  Consultar esta promo
                </a>
              </div>

              {/* Right: Visual */}
              <div className="relative min-h-[300px] lg:min-h-0 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-100">
                <Image
                  src="/media/armazones-natalia-oreiro.jpeg"
                  alt="Colección Ninety"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent lg:bg-gradient-to-r" />
                <div className="absolute bottom-6 left-6">
                  <a
                    href="/?categoria=armazones-de-receta&marca=Ninety#catalogo"
                    className="px-4 py-2 bg-blue-700 text-white text-sm font-semibold rounded-lg hover:bg-blue-800 transition-colors shadow-lg"
                  >
                    Ver Colección Ninety →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Promo 2: Varilux + 2do par gratis */}
          <div className="card overflow-hidden reveal" style={{ transitionDelay: '150ms' }}>
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left: Visual */}
              <div className="relative min-h-[300px] bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-100 order-2 lg:order-1">
                <Image
                  src="/media/promo-varilux.png"
                  alt="Promo Varilux"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-6 left-6 bg-orange-500 text-white px-4 py-2 rounded-lg font-extrabold text-sm shadow-lg">
                  ¡2do par GRATIS!
                </div>
              </div>

              {/* Right: Info */}
              <div className="p-8 md:p-12 flex flex-col justify-center order-1 lg:order-2">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                    Promo Varilux — Por tiempo limitado
                  </span>
                </div>

                <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3 leading-tight">
                  Cristales Varilux +{' '}
                  <span className="text-orange-600">2do par de multifocales de regalo</span>
                </h3>

                <p className="text-slate-500 mb-6 leading-relaxed">
                  Con la compra de tus cristales progresivos <strong className="text-slate-700">Varilux</strong>, te llevás un segundo par de multifocales completamente gratis. Ideal para tener uno en el trabajo y otro para el día a día.
                </p>

                <ul className="space-y-2.5 mb-8">
                  {[
                    'Cristales multifocales Varilux (tecnología digital)',
                    '2do par de multifocales de regalo',
                    'Armazón a elección del catálogo',
                    'Antirreflejo incluido en ambos pares',
                    'Armado en nuestro taller propio',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={11} className="text-orange-600" />
                      </div>
                      <span className="text-slate-600 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200 mb-8">
                  <span className="text-lg">✅</span>
                  <div>
                    <p className="text-green-700 font-semibold text-sm">¡Sin receta previa necesaria!</p>
                    <p className="text-green-600/80 text-xs mt-0.5">
                      No importa si no tenés receta. Te agendamos con nuestro profesional para el chequeo visual sin costo.
                    </p>
                  </div>
                </div>

                <a
                  href={`https://wa.me/598098871673?text=Hola!%20Quiero%20consultar%20por%20la%20Promo%20Varilux%20segundo%20par%20de%20regalo`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary bg-orange-500 hover:bg-orange-600 self-start"
                  style={{ background: 'linear-gradient(to right, #f97316, #ea580c)' }}
                >
                  <Phone size={16} />
                  Consultar esta promo
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

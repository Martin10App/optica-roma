'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';



export default function MultifocalesPage() {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-white pt-24 text-slate-600">
      {/* Hero Section */}
      <div className="relative h-[55vh] flex items-center justify-center overflow-hidden">
        <video
          poster="/media/portada-cadenas.jpeg"
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        >
          <source src="/media/ess_varilux_seenolimits_30s_arg_1080x1080px.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-transparent to-white/80" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto reveal">
          <div className="section-label mb-5 inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping-slow" />
            Línea Progresiva
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
            Cristales <span className="gradient-text">Multifocales</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-light max-w-2xl mx-auto">
            Visión natural a todas las distancias, sin saltos de imagen ni líneas visibles. Redescubrí el placer de ver bien sin cambiar de lentes.
          </p>
        </div>
      </div>

      {/* Main intro */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center reveal">
          <div className="relative rounded-3xl overflow-hidden border border-blue-500/20 shadow-[0_0_50px_rgba(79,142,247,0.1)]">
            <video
              poster="/media/portada-cadenas.jpeg"
              autoPlay loop muted playsInline
              className="w-full aspect-video object-cover opacity-80"
            >
              <source src="/media/ess_varilux_seenolimits_product_benefice_15s_arg-1080x1080.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent" />
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6">
              ¿Qué son y cómo funcionan las lentes progresivas?
            </h2>
            <p className="text-slate-500 leading-relaxed mb-6">
              Las lentes multifocales (o progresivas) están diseñadas para corregir la presbicia junto con otros problemas de refracción (miopía, hipermetropía y astigmatismo). Tienen una graduación que varía de forma gradual a lo largo del cristal.
            </p>
            <p className="text-slate-500 leading-relaxed mb-8">
              La parte superior está calibrada para ver de lejos, la zona media para la computadora o el tablero del auto, y la parte inferior para leer de cerca o usar el celular. Todo de manera fluida y estética.
            </p>
            <a
              href="https://wa.me/598098871673?text=Hola!%20Me%20interesan%20los%20cristales%20multifocales."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 btn-glow btn-ripple"
            >
              Consultar sobre Multifocales
            </a>
          </div>
        </div>
      </div>

      {/* Benefits grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-blue-900/20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="reveal-left">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-6">Ventajas de nuestros cristales multifocales</h3>
            <ul className="space-y-4">
              {[
                { title: 'Lentes todo en uno', desc: 'No más andar cargando con dos o tres pares de lentes. Un solo lente hace todo.' },
                { title: 'Transición suave y estética', desc: 'A diferencia de los bifocales clásicos, no tienen esa línea marcada horizontal tan molesta y antiestética.' },
                { title: 'Taller digital Freeform', desc: 'Calibrados digitalmente punto por punto para darte campos de visión extremadamente amplios y sin distorsión.' },
                { title: 'Garantía total de adaptación', desc: 'Si no te adaptás al multifocal en 30 días, te cambiamos el producto o lo resolvemos sin ningún costo para vos.' }
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center flex-shrink-0 mt-1">
                    <Check size={12} className="text-violet-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{item.title}</h4>
                    <p className="text-slate-500 text-sm mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Adaptation box */}
          <div className="reveal-right">
            <div className="gradient-border-card p-8 bg-white/60 border border-slate-200">
              <span className="text-4xl mb-4 block">🛡️</span>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Garantía de Adaptación Roma</h4>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Mucha gente tiene miedo a dar el salto a los multifocales por miedo a no acostumbrarse. Queremos que compres con total tranquilidad:
              </p>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-800 text-sm mb-6">
                <strong>¿No te resultaron cómodos?</strong> En los primeros 30 días de uso los ajustamos o reemplazamos por dos pares monofocales (uno de lejos y uno de cerca) sin costo adicional.
              </div>
              <p className="text-xs text-slate-500">
                *Sujeto a mantener la misma receta de graduación provista.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Back button */}
      <div className="text-center py-20">
        <Link href="/#cristales" className="text-slate-500 hover:text-blue-400 font-medium inline-flex items-center gap-2 transition-colors">
          ← Volver a Cristales
        </Link>
      </div>
    </div>
  );
}

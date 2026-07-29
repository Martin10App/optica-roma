'use client';

import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';



export default function VariluxXSeriesPage() {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-white pt-24 text-slate-600">
      {/* Hero Section */}
      <div className="relative h-[65vh] flex items-center justify-center overflow-hidden">
        <video preload="metadata" poster="/media/ess_varilux_seenolimits_45s_arg-1080x1080-poster.jpg" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-30">
          <source src="/media/ess_varilux_seenolimits_45s_arg-1080x1080.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-transparent to-white/80" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto reveal">
          <div className="section-label mb-5 inline-flex border-amber-500/40 text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping-slow" />
            Línea Premium — Varilux
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
            Varilux <span className="gradient-text">X Series</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-light max-w-2xl mx-auto">
            La revolución definitiva en lentes multifocales. Capturá cada detalle al alcance de tus brazos con absoluta naturalidad y precisión.
          </p>
        </div>
      </div>

      {/* Intro section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center reveal">
          <div className="relative rounded-3xl overflow-hidden border border-brand-500/20 shadow-[0_0_50px_rgba(79,142,247,0.15)] bg-white">
            <video preload="metadata" poster="/media/ess_varilux_seenolimits_techno_15s_arg-1080x1080-poster.jpg" autoPlay loop muted playsInline className="w-full aspect-square object-cover opacity-80">
              <source src="/media/ess_varilux_seenolimits_techno_15s_arg-1080x1080.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent" />
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6">
              Visión multitarea en la distancia de tus brazos
            </h2>
            <p className="text-slate-500 leading-relaxed mb-6">
              Hoy pasamos el día hiperconectados. Miramos la computadora, el celular, tomamos notas y conversamos, todo al mismo tiempo y a distancias cortas. Los progresivos convencionales obligan a mover la cabeza constantemente para enfocar correctamente.
            </p>
            <p className="text-slate-500 leading-relaxed mb-8">
              <strong>Varilux X Series</strong> fue diseñado para resolver esto. Permite enfocar de forma simultánea múltiples objetivos cercanos sin esfuerzo y con total estabilidad en movimiento.
            </p>
            <a
              href="https://wa.me/598098871673?text=Hola!%20Me%20interesa%20la%20l%C3%ADnea%20premium%20Varilux%20X%20Series."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-slate-900 bg-gradient-to-r from-amber-500 to-yellow-500 btn-glow btn-ripple shadow-[0_0_25px_rgba(245,158,11,0.3)]"
            >
              Consultar por Varilux X Series
            </a>
          </div>
        </div>
      </div>

      {/* Technologies grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-brand-950/20">
        <div className="mb-12 text-center reveal">
          <h3 className="text-2xl font-extrabold text-slate-900">Tres Tecnologías Exclusivas</h3>
          <p className="text-slate-500 text-sm mt-1">La ciencia aplicada a tus cristales progresivos más premium</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              num: '1',
              title: 'Xtend Technology',
              desc: 'Extiende tu visión de cerca. Podés enfocar varios objetos al mismo tiempo a la distancia de tus brazos sin mover la cabeza.',
            },
            {
              num: '2',
              title: 'Nanoptix',
              desc: 'Modifica la estructura de la lente para eliminar la molesta sensación de balanceo o mareo al caminar o moverte rápidamente.',
            },
            {
              num: '3',
              title: 'Synchroneyes',
              desc: 'Calcula el diseño de tus cristales teniendo en cuenta la diferencia fisiológica de tus ojo para campos visuales más anchos y nítidos.',
            },
          ].map((tech, i) => (
            <div key={tech.title} className="gradient-border-card p-6 flex flex-col justify-between reveal" style={{ transitionDelay: `${i * 100}ms` }}>
              <div>
                <span className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700 font-extrabold mb-4">
                  {tech.num}
                </span>
                <h4 className="text-xl font-bold text-slate-900 mb-2">{tech.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{tech.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Extra Video Display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-brand-950/20">
        <div className="gradient-border-card overflow-hidden p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center reveal">
          <div className="md:w-1/2">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-4">Una experiencia visual inigualable</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Varilux X Series representa el tope de gama en óptica oftálmica internacional. Sentí el confort de enfocar de cerca de forma instantánea. Ideal para profesionales, usuarios exigentes de pantallas y personas con vida muy activa.
            </p>
          </div>
          <div className="md:w-1/2 w-full rounded-2xl overflow-hidden border border-amber-500/20 shadow-lg">
            <video preload="none" poster="/media/varilux_-doble-disfrute-1-poster.jpg" autoPlay loop muted playsInline className="w-full object-cover">
              <source src="/media/varilux_-doble-disfrute-1.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>

      {/* Back button */}
      <div className="text-center py-20">
        <Link href="/#cristales" className="text-slate-500 hover:text-brand-600 font-medium inline-flex items-center gap-2 transition-colors">
          ← Volver a Cristales
        </Link>
      </div>
    </div>
  );
}

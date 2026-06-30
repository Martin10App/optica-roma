'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';



const materials = [
  {
    name: 'Orgánico CR-39',
    index: 'Índice 1.50',
    desc: 'El material clásico y más utilizado. Ofrece una excelente calidad óptica, es muy liviano y es ideal para graduaciones bajas.',
    icon: '👓',
  },
  {
    name: 'Policarbonato',
    index: 'Índice 1.59',
    desc: 'Hasta 10 veces más resistente a los impactos que el vidrio o plástico común. Es ultra liviano, ofrece protección UV 100% y es ideal para niños, deportistas y seguridad.',
    icon: '🛡️',
  },
  {
    name: 'Medio Índice',
    index: 'Índice 1.56',
    desc: 'Un cristal intermedio con excelente relación precio-calidad. Es un 15% más fino que el orgánico clásico, recomendado para graduaciones leves a moderadas.',
    icon: '✨',
  },
  {
    name: 'Alto Índice',
    index: 'Índice 1.67',
    desc: 'Diseñado especialmente para graduaciones medianamente altas. Permite reducir el espesor del cristal hasta un 30%, mejorando notablemente la estética y comodidad.',
    icon: '💎',
  },
  {
    name: 'Ultra Alto Índice',
    index: 'Índice 1.74',
    desc: 'La tecnología más avanzada para graduaciones muy altas (miopía o hipermetropía severa). Consigue lentes hasta un 50% más finos y planos, eliminando el efecto lupa.',
    icon: '🔬',
  },
];

export default function MaterialesPage() {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-white pt-24 text-slate-600">
      {/* Hero Section */}
      <div className="relative h-[55vh] flex items-center justify-center overflow-hidden">
        <video

          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        >
          <source src="/media/limpiando-cristales.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-transparent to-white/80" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto reveal">
          <div className="section-label mb-5 inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping-slow" />
            Nuestros Cristales
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
            Materiales <span className="gradient-text">de Cristales</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-light max-w-2xl mx-auto">
            La base de una visión perfecta. Descubrí todas las opciones que tenemos para hacer tus lentes lo más estéticos y livianos posibles.
          </p>
        </div>
      </div>

      {/* Intro section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center reveal">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6">
              Variedad tecnológica para cada necesidad visual
            </h2>
            <p className="text-slate-500 leading-relaxed mb-6">
              En Óptica Roma contamos con todos los tipos de cristales existentes a nivel mundial. Nos enfocamos en asesorarte para que, según tu receta y tu marco preferido, el cristal final quede con el menor espesor y peso posibles.
            </p>
            <p className="text-slate-500 leading-relaxed mb-8">
              No importa qué graduación tengas; desde astigmatismos leves hasta miopías severas, tenemos un material diseñado a la medida exacta de tus ojos.
            </p>
            <a
              href="https://wa.me/598098871673?text=Hola!%20Me%20gustar%C3%ADa%20asesoramiento%20sobre%20materiales%20de%20cristales."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-lg hover:shadow-xl transition-all"
            >
              Consultar con un Asesor
            </a>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-blue-500/20 shadow-[0_0_50px_rgba(79,142,247,0.1)]">
            <video

              autoPlay loop muted playsInline
              className="w-full aspect-video object-cover opacity-80"
            >
              <source src="/media/cristal sin ar.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-[#050a14]/60 to-transparent" />
          </div>
        </div>
      </div>

      {/* Materials grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-blue-900/20">
        <div className="mb-12 text-center reveal">
          <h3 className="text-2xl font-extrabold text-slate-900">Gama de Materiales</h3>
          <p className="text-slate-500 text-sm mt-1">Comparativa de los índices de refracción y usos recomendados</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((m, i) => (
            <div key={m.name} className="gradient-border-card p-6 flex flex-col justify-between reveal" style={{ transitionDelay: `${i * 100}ms` }}>
              <div>
                <div className="text-3xl mb-4">{m.icon}</div>
                <h4 className="text-xl font-bold text-slate-900 mb-1">{m.name}</h4>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block mb-4">{m.index}</span>
                <p className="text-sm text-slate-500 leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
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

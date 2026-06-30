'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';
import Image from 'next/image';

const services = [
  {
    number: '01',
    title: 'Atención Personalizada',
    description: 'Te asesoramos para que encuentres el armazón perfecto para tu rostro y los cristales ideales para tus necesidades visuales diarias.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    color: 'from-blue-500 to-cyan-400',
    glow: 'rgba(79,142,247,0.4)',
  },
  {
    number: '02',
    title: 'Taller Óptico Propio',
    description: 'Calibrado y armado de tus lentes con la mayor precisión y en tiempo récord gracias a nuestro equipamiento de última generación.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: 'from-violet-500 to-purple-400',
    glow: 'rgba(139,92,246,0.4)',
  },
  {
    number: '03',
    title: 'Garantía de Adaptación',
    description: 'Si tus nuevos multifocales no te resultan cómodos en los primeros 30 días, los ajustamos o cambiamos sin costo adicional.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    color: 'from-emerald-500 to-teal-400',
    glow: 'rgba(16,185,129,0.4)',
  },
];

export default function ServicesSection() {
  useScrollReveal();

  return (
    <section className="relative py-28 overflow-hidden bg-white">
      {/* Background Image subtle */}
      <div className="absolute inset-0">
        <Image
          src="/media/expositor-armazoens2.png"
          alt="Óptica Roma"
          fill
          className="object-cover opacity-[0.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />
      </div>

      {/* Decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-900/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20 reveal">
          <div className="section-label mb-5 inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping-slow" />
            Nuestros Servicios
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Tecnología y <span className="gradient-text">calidez humana</span>
          </h2>
          <p className="mt-4 text-slate-500 text-lg max-w-2xl mx-auto">
            Cuidamos tu salud visual con equipamiento de última generación y la atención que merecés.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className={`card p-8 group cursor-default reveal`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Big number in bg */}
              <span className="absolute top-4 right-6 text-8xl font-black text-slate-900/[0.03] select-none leading-none">
                {service.number}
              </span>

              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}
                style={{ boxShadow: `0 0 20px ${service.glow}` }}
              >
                {service.icon}
              </div>

              {/* Number label */}
              <div className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-3">{service.number}</div>

              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors duration-300">
                {service.title}
              </h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                {service.description}
              </p>

              {/* Bottom glow line on hover */}
              <div className={`mt-6 h-[2px] w-0 group-hover:w-full bg-gradient-to-r ${service.color} rounded-full transition-all duration-500`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

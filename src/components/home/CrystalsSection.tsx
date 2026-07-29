'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const crystals = [
  {
    id: 1,
    title: 'Materiales',
    tag: 'Fundamentos',
    slug: '/projects/materiales',
    description: 'Desde orgánicos hasta alto índice: te asesoramos para encontrar el material perfecto para tu graduación y estilo de vida.',
    mediaUrl: '/media/limpiando-cristales.mp4',
    mediaType: 'video',
    accent: 'from-brand-500 to-cyan-400',
  },
  {
    id: 2,
    title: 'Multifocales',
    tag: 'Progresivos',
    slug: '/projects/multifocales',
    description: 'Gama completa de multifocales digitales, desde calidades intermedias hasta las más avanzadas del mercado.',
    mediaUrl: '/media/ess_varilux_seenolimits_30s_arg_1080x1080px.mp4',
    mediaType: 'video',
    accent: 'from-violet-500 to-purple-400',
  },
  {
    id: 3,
    title: 'Blue Block',
    tag: 'Protección Digital',
    slug: '/projects/blue-block',
    description: 'Lentes Blue Block de última generación para proteger tus ojos de la luz azul de pantallas. Todo lo que necesitás saber.',
    mediaUrl: '/media/mujer-usando-lentes-mirando-cel.mp4',
    mediaType: 'video',
    accent: 'from-indigo-500 to-brand-400',
  },
  {
    id: 4,
    title: 'Varilux X Series',
    tag: 'Premium',
    slug: '/projects/varilux-x-series',
    description: 'Las lentes progresivas más avanzadas del mundo. Tecnología exclusiva para una visión perfecta a cualquier distancia.',
    mediaUrl: '/media/ess_varilux_seenolimits_45s_arg-1080x1080.mp4',
    mediaType: 'video',
    accent: 'from-amber-500 to-yellow-400',
  },
];

export default function CrystalsSection() {
  useScrollReveal();

  return (
    <section id="cristales" className="py-28 bg-white relative overflow-hidden">
      {/* Subtle top separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20 reveal">
          <div className="section-label mb-5 inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping-slow" />
            Tecnología Óptica
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Nuestros <span className="gradient-text">Cristales</span>
          </h2>
          <p className="mt-4 text-slate-500 text-lg max-w-2xl mx-auto">
            La mejor tecnología en lentes, adaptada a tu visión y tu vida.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {crystals.map((crystal, index) => (
            <Link
              key={crystal.id}
              href={crystal.slug}
              className={`group relative rounded-xl overflow-hidden h-[380px] flex flex-col justify-end reveal`}
              style={{ transitionDelay: `${index * 120}ms` }}
            >
              {/* Background Media */}
              <div className="absolute inset-0">
                {crystal.mediaType === 'video' ? (
                  <video preload="none" poster={crystal.mediaUrl.replace('.mp4', '-poster.jpg')} autoPlay loop muted playsInline className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700">
                    <source src={crystal.mediaUrl} type="video/mp4" />
                  </video>
                ) : (
                  <Image
                    src={crystal.mediaUrl}
                    alt={crystal.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                )}
                {/* Light overlay for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-white/40" />
              </div>

              {/* Border gradient on hover */}
              <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                style={{ boxShadow: `inset 0 0 0 1px rgba(79,142,247,0.5)` }} />

              {/* Content */}
              <div className="relative z-10 p-6">
                {/* Tag */}
                <span className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-gradient-to-r ${crystal.accent} text-slate-900 mb-3`}>
                  {crystal.tag}
                </span>

                <h3 className="text-2xl font-extrabold text-slate-900 mb-2">{crystal.title}</h3>
                
                {/* Description — slides up on hover */}
                <p className="text-slate-500 text-sm leading-relaxed max-h-0 overflow-hidden group-hover:max-h-24 transition-all duration-500 ease-out">
                  {crystal.description}
                </p>

                {/* Arrow */}
                <div className={`mt-4 inline-flex items-center gap-2 text-sm font-bold bg-gradient-to-r ${crystal.accent} bg-clip-text text-transparent`}>
                  Conocer más
                  <span className="translate-x-0 group-hover:translate-x-1 transition-transform duration-300 inline-block">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

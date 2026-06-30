'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function CheckupSection() {
  useScrollReveal();

  return (
    <section className="relative py-28 overflow-hidden bg-slate-50">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50 to-slate-100" />
      </div>

      {/* Glow */}
      <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-700/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-700/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left text */}
          <div className="reveal-left">
            <div className="section-label mb-6 inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping-slow" />
              Salud Visual
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
              Chequeo visual
              <span className="gradient-text block">completamente gratis</span>
            </h2>
            <p className="text-slate-500 text-lg mb-10 leading-relaxed max-w-md">
              Un diagnóstico a tiempo puede prevenir complicaciones. Agendá tu turno sin costo con nuestros especialistas y asegurate el bienestar de tus ojos.
            </p>

            {/* Features list */}
            <ul className="space-y-3 mb-10">
              {['Sin costo ni compromiso', 'Atención por especialistas', 'Resultado inmediato', 'Disponible en ambas sucursales'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-600">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-teal-50 border border-teal-200 flex-shrink-0">
                    <svg className="w-3 h-3 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <a
              href="https://wa.me/598098871673?text=Hola!%20Quiero%20agendarme%20para%20un%20chequeo%20visual%20gratis."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-slate-900 bg-gradient-to-r from-teal-600 to-cyan-600 shadow-lg hover:shadow-xl transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Agendar Chequeo Gratis
            </a>
          </div>

          {/* Right: Video card */}
          <div className="reveal-right">
            <div className="relative">
              {/* Floating badge */}
              <div className="absolute -top-5 -right-5 z-20 bg-gradient-to-br from-teal-500 to-cyan-500 text-slate-900 font-extrabold text-sm px-5 py-3 rounded-2xl shadow-lg animate-float">
                100% Gratis
              </div>
              {/* Floating eye icon */}
              <div className="absolute -bottom-5 -left-5 z-20 bg-white border border-blue-500/30 rounded-2xl p-4 shadow-xl animate-float-delayed">
                <span className="text-3xl">👁️</span>
              </div>

              {/* Main video box */}
              <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
                <video
                  
                  autoPlay loop muted playsInline
                  className="w-full aspect-square object-cover"
                >
                  <source src="/media/nina-fondo-de-ojo.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

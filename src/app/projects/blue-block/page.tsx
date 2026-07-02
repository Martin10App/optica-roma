'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';



export default function BlueBlockPage() {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-white pt-24 text-slate-600">
      {/* Hero Section */}
      <div className="relative h-[55vh] flex items-center justify-center overflow-hidden">
        <video preload="metadata" poster="/media/mujer-usando-lentes-mirando-cel-poster.jpg" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-20">
          <source src="/media/mujer-usando-lentes-mirando-cel.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-transparent to-white/80" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto reveal">
          <div className="section-label mb-5 inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping-slow" />
            Protección Digital — Blue Cut
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
            Cristales <span className="gradient-text">Blue Block</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-light max-w-2xl mx-auto">
            Protección total contra la luz azul-violeta nociva emitida por las pantallas. Cuidá tus ojos en la era digital.
          </p>
        </div>
      </div>

      {/* Main intro */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center reveal">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6">
              Descanso y salud para tus ojos frente a las pantallas
            </h2>
            <p className="text-slate-500 leading-relaxed mb-6">
              Las pantallas de celulares, tablets, computadoras y televisores emiten una gran cantidad de luz azul-violeta nociva. La exposición prolongada a esta radiación genera fatiga visual, ojos rojos, dolores de cabeza y alteraciones graves en el ciclo del sueño.
            </p>
            <p className="text-slate-500 leading-relaxed mb-8">
              Nuestra tecnología de cristales Blue Block filtra selectivamente este espectro de luz perjudicial, dejando pasar únicamente la luz azul-turquesa beneficiosa para el organismo.
            </p>
            <a
              href="https://wa.me/598098871673?text=Hola!%20Quiero%20saber%20el%20precio%20de%20los%20lentes%20con%20Blue%20Block."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 btn-glow btn-ripple"
            >
              Proteger mi Vista
            </a>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-blue-500/20 shadow-[0_0_50px_rgba(79,142,247,0.1)]">
            <video preload="none" poster="/media/lentes-poster.jpg" autoPlay loop muted playsInline className="w-full h-full object-cover">
              <source src="/media/lentes.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-[#050a14]/60 to-transparent" />
          </div>
        </div>
      </div>

      {/* Stats and features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-blue-900/20">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { value: '95%', label: 'De luz azul nociva filtrada', desc: 'Filtro selectivo de alta eficiencia' },
            { value: '8hs+', label: 'De confort diario asegurado', desc: 'Ideal para trabajo o estudio de oficina' },
            { value: '100%', label: 'De compatibilidad', desc: 'Disponible con o sin aumento médico' }
          ].map((stat, i) => (
            <div key={stat.label} className="gradient-border-card p-6 text-center reveal" style={{ transitionDelay: `${i * 100}ms` }}>
              <p className="text-4xl font-extrabold text-blue-400 mb-2">{stat.value}</p>
              <p className="text-slate-900 font-bold text-sm mb-1">{stat.label}</p>
              <p className="text-slate-500 text-xs">{stat.desc}</p>
            </div>
          ))}
        </div>

        <div className="reveal">
          <h3 className="text-2xl font-extrabold text-slate-900 mb-6 text-center">Beneficios Directos</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Menor fatiga visual', desc: 'Elimina el cansancio, ardor, sequedad ocular y enrojecimiento tras horas de uso de dispositivos.' },
              { title: 'Sueño más profundo', desc: 'La luz azul de noche confunde al cerebro bloqueando la melatonina. El filtro ayuda a regular tu reloj biológico natural.' },
              { title: 'Prevención a futuro', desc: 'Protege las células de la retina de daños a largo plazo causados por la luz artificial de alta energía.' },
              { title: 'Combinación con antireflejo', desc: 'Nuestros cristales Blue Block ya traen de fábrica el mejor tratamiento antirreflejo para una visión super transparente.' }
            ].map((item, i) => (
              <div key={item.title} className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  {item.title}
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
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

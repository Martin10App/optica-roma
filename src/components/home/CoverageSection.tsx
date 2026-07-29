'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';
import { ShieldPlus, X } from 'lucide-react';
import { useState } from 'react';

const mutualistas = [
  { name: 'BPS', img: '/media/logos/BPS-logo.png' },
  { name: 'CASMU', img: '/media/logos/casmu-logo.jpg' },
  { name: 'CRAMI', img: '/media/logos/mutualista-crami.png' },
  { name: 'Círculo Católico', img: '/media/logos/mutualista-circulo-catolico.png' },
  { name: 'Asistencia Integral', img: '/media/logos/asistencia-integral-asse.svg' },
  { name: 'Médica Uruguaya', img: '/media/logos/medica-uruguaya.webp' },
  { name: 'Hospital Policial', img: '' },
  { name: 'Y todas las demás...', img: '' }
];

export default function CoverageSection() {
  useScrollReveal();
  const [isBpsModalOpen, setIsBpsModalOpen] = useState(false);
  const [isAsseModalOpen, setIsAsseModalOpen] = useState(false);

  return (
    <section className="py-20 bg-white border-t border-slate-100 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left: Info */}
          <div className="lg:w-1/3 text-center lg:text-left reveal-left">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-800 text-white mb-6 shadow-lg">
              <ShieldPlus size={24} />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
              Trabajamos con <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-800 to-brand-500">todas las mutualistas</span>
            </h2>
            <p className="text-slate-500 mb-8">
              Consultá por tu receta de BPS, Asistencia Integral o cualquier prestador de salud. Gestionamos los trámites y te asesoramos para que aproveches al máximo tus beneficios.
            </p>
            <a
              href="https://wa.me/598098871673?text=Hola!%20Quiero%20consultar%20por%20mi%20cobertura%20por%20mutualista."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-brand-800 bg-white border border-brand-200 hover:bg-brand-50 transition-colors"
            >
              Consultá tu cobertura →
            </a>
          </div>

          {/* Right: Logos/Names */}
          <div className="lg:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-4 reveal-right">
            {mutualistas.map((item, i) => (
              <div 
                key={item.name}
                onClick={() => {
                  if (item.name === 'BPS') setIsBpsModalOpen(true);
                  if (item.name === 'Asistencia Integral') setIsAsseModalOpen(true);
                }}
                className={`flex items-center justify-center h-24 rounded-2xl bg-white border border-slate-200 text-slate-500 font-bold text-center p-4 hover:border-brand-300 hover:text-brand-800 hover:bg-brand-50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${(item.name === 'BPS' || item.name === 'Asistencia Integral') ? 'cursor-pointer' : ''}`}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                {item.img ? (
                  <img src={item.img} alt={item.name} className="max-h-full max-w-full object-contain filter grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100 mix-blend-multiply" />
                ) : (
                  <span>{item.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BPS Modal */}
      {isBpsModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsBpsModalOpen(false)} />
          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in p-8">
            <button 
              onClick={() => setIsBpsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-slate-600 leading-relaxed">
              <h2 className="text-2xl md:text-3xl font-extrabold text-brand-900 flex items-center gap-3 mb-6">
                <img src="/media/logos/BPS-logo.png" alt="BPS" className="h-10 object-contain m-0" />
                Subsidio en Óptica Roma
              </h2>
              
              <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">¿Cómo obtener el subsidio del BPS?</h3>
              <p className="mb-4">En Óptica Roma realizamos la gestión del subsidio BPS para que no tengas que realizar trámites personalmente.</p>
              <p className="mb-4">Presentando tu receta oftalmológica con menos de 60 días de vigencia y tu cédula de identidad, gestionaremos tu solicitud para acceder al beneficio de lentes convencionales otorgado por BPS.</p>
              <p className="mb-4">Este trámite puede realizarse una vez cada dos años y suele completarse en pocos minutos.</p>

              <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">¿Qué necesitamos para tramitarlo?</h3>
              <p className="mb-3">Simplemente acercanos:</p>
              <ul className="list-disc pl-5 mb-6 space-y-2">
                <li>Tu cédula de identidad vigente.</li>
                <li>Tu receta oftalmológica vigente (emitida dentro de los últimos 60 días).</li>
              </ul>
              <p className="mb-4">Con esa documentación ingresaremos la solicitud correspondiente en el sistema de BPS para gestionar el beneficio aplicable a tus lentes. El subsidio otorgado será descontado directamente del importe total de tu compra.</p>

              <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">¿Sabías que tus hijos menores de 14 años también pueden acceder a este beneficio?</h3>
              <p className="mb-4">Si sos trabajador dependiente de la actividad privada, percibís seguro de desempleo o sos jubilado con menores de 14 años a cargo, también podés solicitar el beneficio para los lentes recetados a tus hijos o menores bajo tu tutela.</p>

              <div className="bg-brand-50 border-l-4 border-brand-500 p-5 mt-10 rounded-r-xl">
                <h3 className="text-lg font-bold text-brand-900 mb-2">Consultas</h3>
                <p className="mb-3">Si tenés dudas sobre el beneficio o la documentación necesaria, comunicate con nosotros y con gusto te asesoraremos.</p>
                <p className="font-medium text-brand-950">¡En Óptica Roma nos encargamos del trámite para que vos solo tengas que elegir los lentes ideales para vos!</p>
              </div>

              <div className="mt-10 text-center">
                <a
                  href="https://wa.me/598098871673?text=Hola!%20Quiero%20consultar%20por%20el%20subsidio%20del%20BPS."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 no-underline"
                >
                  Consultar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ASSE Modal */}
      {isAsseModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAsseModalOpen(false)} />
          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in p-8">
            <button 
              onClick={() => setIsAsseModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-slate-600 leading-relaxed">
              <h2 className="text-2xl md:text-3xl font-extrabold text-brand-900 flex items-center gap-3 mb-6">
                <img src="/media/logos/asistencia-integral-asse.svg" alt="Asistencia Integral ASSE" className="h-10 object-contain m-0" />
                Asistencia Integral
              </h2>
              
              <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">¿Sos funcionario de ASSE?</h3>
              <p className="mb-4">En Óptica Roma trabajamos con el beneficio de Asistencia Integral, permitiéndote acceder a descuentos y facilidades para la adquisición de tus lentes.</p>

              <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">¿Cómo acceder al beneficio?</h3>
              <p className="mb-3">Es muy sencillo. Solo necesitás presentar:</p>
              <ul className="list-disc pl-5 mb-6 space-y-2">
                <li>Tu cédula de identidad.</li>
                <li>Tu receta oftalmológica vigente.</li>
                <li>La documentación requerida por Asistencia Integral para acreditar tu condición de beneficiario.</li>
              </ul>
              <p className="mb-4">Nuestro equipo te asesorará y realizará las verificaciones necesarias para que puedas aprovechar el beneficio correspondiente al momento de realizar tu compra.</p>

              <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">¿Qué incluye el beneficio?</h3>
              <p className="mb-4">Los beneficiarios de Asistencia Integral pueden acceder a importantes descuentos y condiciones especiales en lentes y cristales, de acuerdo con la cobertura vigente al momento de la compra.</p>

              <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">Te asesoramos en todo el proceso</h3>
              <p className="mb-4">En Óptica Roma te ayudamos a gestionar la documentación necesaria y a encontrar la mejor opción para tus necesidades visuales, aprovechando al máximo los beneficios disponibles.</p>

              <div className="bg-brand-50 border-l-4 border-brand-500 p-5 mt-10 rounded-r-xl">
                <h3 className="text-lg font-bold text-brand-900 mb-2">Consultas</h3>
                <p className="mb-3">Si tenés dudas sobre tu cobertura o la documentación requerida, comunicate con nosotros. Con gusto te brindaremos toda la información necesaria.</p>
                <p className="font-medium text-brand-950">¡Acercate a Óptica Roma y aprovechá los beneficios de Asistencia Integral para cuidar tu salud visual!</p>
              </div>

              <div className="mt-10 text-center">
                <a
                  href="https://wa.me/598098871673?text=Hola!%20Quiero%20consultar%20por%20el%20beneficio%20de%20Asistencia%20Integral%20ASSE."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 no-underline"
                >
                  Consultar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

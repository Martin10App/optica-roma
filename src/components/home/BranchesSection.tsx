'use client';

import { MapPin, Clock, Phone, ExternalLink } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const branches = [
  {
    id: 'las-piedras',
    name: 'Las Piedras',
    address: 'Rivera 617 (Frente a la plaza)',
    hours: 'Lunes a Viernes 9:00 — 18:30 | Sábados 9:00 — 13:00',
    phones: [
      { text: '+598 098 871 673', url: 'https://wa.me/598098871673', isWhatsapp: true },
      { text: '2364 1800', url: 'tel:23641800', isWhatsapp: false }
    ],
    mapUrl: 'https://maps.google.com/maps?q=Rivera%20617,%20Las%20Piedras,%20Uruguay&t=&z=16&ie=UTF8&iwloc=&output=embed',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=%C3%93ptica%20Roma%20Rivera%20617%20Las%20Piedras%20Uruguay',
    accent: 'from-blue-500 to-cyan-400',
  },
  {
    id: 'canelones',
    name: 'Canelones',
    address: 'Enrique Rodó 319',
    hours: 'Lunes a Viernes 9:00 — 18:30 | Sábados 9:00 — 13:00',
    phones: [
      { text: '4333 9869', url: 'tel:43339869', isWhatsapp: false }
    ],
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3286.262843075677!2d-56.28189672378411!3d-34.54687597297491!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95a1ab0f4a821e25%3A0x6b45037d2f9b8898!2zSm9zw6kgRW5yaXF1ZSBSb2TDsyAzMTksIDkwMDAwIENhbmVsb25lcywgRGVwYXJ0YW1lbnRvIGRlIENhbmVsb25lcw!5e0!3m2!1ses-419!2suy!4v1718000000000!5m2!1ses-419!2suy',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=%C3%93ptica%20Roma%20Enrique%20Rod%C3%B3%20319%20Canelones%20Uruguay',
    accent: 'from-violet-500 to-purple-400',
  },
];

export default function BranchesSection() {
  useScrollReveal();

  return (
    <section id="sucursales" className="py-28 bg-white relative overflow-hidden">
      {/* Separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-blue-900/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20 reveal">
          <div className="section-label mb-5 inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping-slow" />
            Ubicaciones
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Nuestras <span className="gradient-text">Sucursales</span>
          </h2>
          <p className="mt-4 text-slate-500 text-lg max-w-xl mx-auto">
            Dos locales a tu disposición en el interior de Uruguay. Estamos cerca tuyo.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {branches.map((branch, index) => (
            <div
              key={branch.id}
              className={`card overflow-hidden reveal`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Info Panel */}
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-gradient-to-r ${branch.accent} bg-clip-text text-transparent mb-2`}>
                      <MapPin size={12} />
                      Sucursal
                    </div>
                    <h3 className="text-2xl font-extrabold text-slate-900">{branch.name}</h3>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${branch.accent} flex items-center justify-center`}>
                    <MapPin className="text-slate-900" size={22} />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-500">
                    <MapPin size={16} className="flex-shrink-0 text-slate-500" />
                    <span className="text-slate-600 font-medium">{branch.address}</span>
                  </div>
                  <div className="flex items-start gap-3 text-slate-500">
                    <Clock size={16} className="flex-shrink-0 mt-0.5 text-slate-500" />
                    <span className="text-sm">{branch.hours}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={16} className="flex-shrink-0 text-slate-500 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      {branch.phones.map((phone, i) => (
                        <a
                          key={i}
                          href={phone.url}
                          target={phone.isWhatsapp ? '_blank' : undefined}
                          rel={phone.isWhatsapp ? 'noopener noreferrer' : undefined}
                          className="text-sm text-blue-700 hover:text-blue-400 transition-colors font-medium flex items-center gap-1"
                        >
                          {phone.isWhatsapp ? '📱' : '📞'} {phone.text}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <a
                    href={branch.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${branch.accent} bg-clip-text text-transparent hover:opacity-80 transition-opacity`}
                  >
                    Ver en Google Maps
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {/* Map */}
              <div className="h-64 relative border-t border-slate-200">
                <iframe
                  src={branch.mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Mapa ${branch.name}`}
                  className="absolute inset-0 opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

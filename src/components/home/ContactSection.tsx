'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useState } from 'react';
import { Send, Phone, MapPin, Mail, MessageCircle } from 'lucide-react';

export default function ContactSection() {
  useScrollReveal();
  
  const [formData, setFormData] = useState({
    name: '',
    reason: 'Consulta general',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hola! Soy ${formData.name}.%0A%0A*Motivo:* ${formData.reason}%0A*Mensaje:* ${formData.message}`;
    window.open(`https://wa.me/598098871673?text=${text}`, '_blank');
  };

  return (
    <section id="contacto" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 reveal">
          <div className="section-label mb-5 inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping-slow" />
            Atención al cliente
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Envianos un <span className="gradient-text">mensaje</span>
          </h2>
          <p className="mt-4 text-slate-500 text-lg max-w-2xl mx-auto">
            Completá el formulario y te responderemos por WhatsApp al instante.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Form */}
          <div className="lg:col-span-3 reveal-left">
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-500 mb-2">
                    Tu Nombre <span className="text-red-600 ml-1"><span aria-hidden="true">*</span><span className="sr-only">(obligatorio)</span></span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-800 focus:ring-1 focus:ring-brand-800 transition-colors"
                    placeholder="Ej. Juan Pérez"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-slate-500 mb-2">
                    Motivo de consulta <span className="text-red-600 ml-1"><span aria-hidden="true">*</span><span className="sr-only">(obligatorio)</span></span>
                  </label>
                  <select
                    id="reason"
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-800 focus:ring-1 focus:ring-brand-800 transition-colors"
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  >
                    <option>Consulta general</option>
                    <option>Presupuesto con receta</option>
                    <option>Agendar chequeo visual</option>
                    <option>Estado de mi pedido</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-500 mb-2">
                    Mensaje <span className="text-red-600 ml-1"><span aria-hidden="true">*</span><span className="sr-only">(obligatorio)</span></span>
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-brand-800 focus:ring-1 focus:ring-brand-800 transition-colors resize-none"
                    placeholder="Escribí tu consulta acá..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-brand-800 hover:bg-brand-900 text-white font-bold px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Send size={18} />
                  Enviar mensaje por WhatsApp
                </button>
              </div>
            </form>
          </div>

          {/* Quick Info */}
          <div className="lg:col-span-2 flex flex-col justify-center space-y-8 reveal-right">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-6">Información directa</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0 text-brand-400">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-slate-900 font-bold mb-1">Teléfonos</p>
                    <a href="https://wa.me/598098871673" className="block text-slate-500 hover:text-brand-600 transition-colors text-sm mb-1">
                      <MessageCircle size={14} className="inline-block mr-1.5 -mt-0.5" aria-hidden="true" />WhatsApp: +598 098 871 673
                    </a>
                    <a href="tel:23641800" className="block text-slate-500 hover:text-brand-600 transition-colors text-sm mb-1">
                      <Phone size={14} className="inline-block mr-1.5 -mt-0.5" aria-hidden="true" />Fijo Las Piedras: 2364 1800
                    </a>
                    <a href="tel:43339869" className="block text-slate-500 hover:text-brand-600 transition-colors text-sm">
                      <Phone size={14} className="inline-block mr-1.5 -mt-0.5" aria-hidden="true" />Fijo Canelones: 4333 9869
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0 text-brand-400">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-slate-900 font-bold mb-1">Visitanos</p>
                    <p className="text-slate-500 text-sm">Rivera 617 (frente a la plaza), Las Piedras</p>
                    <p className="text-slate-500 text-sm mt-1">Enrique Rodó 319, Canelones</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0 text-brand-400">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-slate-900 font-bold mb-1">Correo (Opcional)</p>
                    <p className="text-slate-500 text-sm break-all">opticaromalaspiedras@hotmail.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

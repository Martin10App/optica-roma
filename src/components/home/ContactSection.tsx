'use client';

import { useState } from 'react';
import { ArrowUpRight, Mail, MessageCircle, Phone } from 'lucide-react';
import EncabezadoSeccion from './EncabezadoSeccion';

const WHATSAPP = 'https://wa.me/598098871673';

const SUCURSALES = [
  {
    nombre: 'Las Piedras',
    direccion: 'Rivera 617, frente a la plaza',
    telefono: { texto: '2364 1800', href: 'tel:23641800' },
    mapa: 'https://maps.google.com/maps?q=Rivera%20617,%20Las%20Piedras,%20Uruguay&t=&z=16&ie=UTF8&iwloc=&output=embed',
    comoLlegar: 'https://www.google.com/maps/search/?api=1&query=%C3%93ptica%20Roma%20Rivera%20617%20Las%20Piedras%20Uruguay',
  },
  {
    nombre: 'Canelones',
    direccion: 'Enrique Rodó 319',
    telefono: { texto: '4333 9869', href: 'tel:43339869' },
    mapa: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3286.262843075677!2d-56.28189672378411!3d-34.54687597297491!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95a1ab0f4a821e25%3A0x6b45037d2f9b8898!2zSm9zw6kgRW5yaXF1ZSBSb2TDsyAzMTksIDkwMDAwIENhbmVsb25lcywgRGVwYXJ0YW1lbnRvIGRlIENhbmVsb25lcw!5e0!3m2!1ses-419!2suy!4v1718000000000!5m2!1ses-419!2suy',
    comoLlegar: 'https://www.google.com/maps/search/?api=1&query=%C3%93ptica%20Roma%20Enrique%20Rod%C3%B3%20319%20Canelones%20Uruguay',
  },
];

const HORARIO = [
  { dias: 'Lunes a viernes', horas: '9:00 a 18:30' },
  { dias: 'Sábados', horas: '9:00 a 13:00' },
];

const MOTIVOS = ['Consulta general', 'Presupuesto con receta', 'No tengo receta', 'Estado de mi pedido'];

// Contacto y sucursales en una sola sección. Conserva id="contacto" (menú) e
// id="sucursales". El formulario no guarda nada: arma el mensaje y abre WhatsApp.
export default function ContactSection() {
  const [nombre, setNombre] = useState('');
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [mensaje, setMensaje] = useState('');

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const texto = `Hola! Soy ${nombre.trim()}.\n\n*Motivo:* ${motivo}\n*Mensaje:* ${mensaje.trim()}`;
    window.open(`${WHATSAPP}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener,noreferrer');
  };

  const campo =
    'mt-2 block w-full rounded-xl border-0 bg-white px-4 py-3 text-[15px] text-tinta ring-1 ring-linea placeholder:text-pizarra/70 focus:outline-none focus:ring-2 focus:ring-cobalto';

  return (
    <section id="contacto" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <EncabezadoSeccion titulo="Contacto" bajada="Escribinos por WhatsApp o pasá por cualquiera de los dos locales." />

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div data-aparecer className="rounded-3xl bg-papel p-6 sm:p-8 lg:col-span-4">
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-4"
            >
              <span>
                <span className="block text-sm text-pizarra">WhatsApp</span>
                <span className="titular block text-3xl tabular-nums text-tinta group-hover:text-cobalto">098 871 673</span>
              </span>
              <MessageCircle size={28} strokeWidth={1.75} className="shrink-0 text-cobalto" aria-hidden />
            </a>

            <ul className="mt-6 space-y-3 border-t border-linea pt-6 text-[15px]">
              <li className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-pizarra" aria-hidden />
                <a href="mailto:opticaromalaspiedras@hotmail.com" className="break-all text-tinta hover:text-cobalto">
                  opticaromalaspiedras@hotmail.com
                </a>
              </li>
            </ul>

            <form onSubmit={enviar} className="mt-8 space-y-4 border-t border-linea pt-6">
              <p className="font-semibold text-tinta">Dejanos tu consulta</p>
              <label className="block text-sm text-pizarra">
                Tu nombre
                <input required value={nombre} onChange={(e) => setNombre(e.target.value)} className={campo} autoComplete="name" />
              </label>
              <label className="block text-sm text-pizarra">
                Motivo
                <select value={motivo} onChange={(e) => setMotivo(e.target.value)} className={campo}>
                  {MOTIVOS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-pizarra">
                Mensaje
                <textarea
                  required
                  rows={3}
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  className={`${campo} resize-none`}
                />
              </label>
              <button type="submit" className="btn-primary w-full">
                Enviar por WhatsApp
              </button>
            </form>
          </div>

          <ul id="sucursales" className="grid scroll-mt-24 gap-6 md:grid-cols-2 lg:col-span-8">
            {SUCURSALES.map((s, i) => (
              <li
                key={s.nombre}
                data-aparecer
                data-aparecer-retraso={100 + i * 100}
                className="flex flex-col overflow-hidden rounded-3xl ring-1 ring-linea"
              >
                <div className="p-6 sm:p-8">
                  <h3 className="titular text-2xl text-tinta md:text-3xl">{s.nombre}</h3>
                  <p className="mt-2 text-[15px] text-pizarra">{s.direccion}</p>

                  <dl className="mt-6 space-y-2 text-[15px]">
                    {HORARIO.map(({ dias, horas }) => (
                      <div key={dias} className="flex justify-between gap-4 border-b border-linea pb-2">
                        <dt className="text-pizarra">{dias}</dt>
                        <dd className="tabular-nums text-tinta">{horas}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[15px]">
                    <a href={s.telefono.href} className="flex items-center gap-2 font-semibold text-tinta hover:text-cobalto">
                      <Phone size={16} aria-hidden />
                      {s.telefono.texto}
                    </a>
                    <a href={s.comoLlegar} target="_blank" rel="noopener noreferrer" className="enlace flex items-center gap-1">
                      Cómo llegar
                      <ArrowUpRight size={16} aria-hidden />
                    </a>
                  </div>
                </div>

                <div className="relative min-h-64 flex-1 border-t border-linea bg-papel">
                  <iframe
                    src={s.mapa}
                    title={`Mapa del local de ${s.nombre}`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 h-full w-full border-0"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

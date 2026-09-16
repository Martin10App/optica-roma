'use client';

import { useState } from 'react';

// Todavía no hay un sistema de newsletter: el email llega por WhatsApp y el
// descuento se da en el local.
export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const mensaje = `Hola! Me quiero suscribir a las novedades de Óptica Roma. Mi email es: ${email.trim()}`;
    window.open(`https://wa.me/598098871673?text=${encodeURIComponent(mensaje)}`, '_blank', 'noopener,noreferrer');
    setEnviado(true);
    setEmail('');
  };

  return (
    <section aria-labelledby="novedades" className="bg-papel">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-16 lg:px-8">
        <div data-aparecer className="grid items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 id="novedades" className="titular text-2xl text-tinta md:text-3xl">
              10% de descuento en tu primera compra
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-pizarra">
              Dejanos tu email y te avisamos cuando lleguen modelos nuevos y promociones. No lo compartimos con nadie.
            </p>
          </div>

          <form onSubmit={enviar} className="lg:col-span-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="email-novedades" className="sr-only">
                Tu email
              </label>
              <input
                id="email-novedades"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEnviado(false);
                }}
                placeholder="tu@email.com"
                className="min-h-12 flex-1 rounded-full border-0 bg-white px-5 text-[15px] text-tinta ring-1 ring-linea placeholder:text-pizarra/70 focus:outline-none focus:ring-2 focus:ring-cobalto"
              />
              <button type="submit" className="btn-primary">
                Suscribirme
              </button>
            </div>
            <p className="mt-3 min-h-5 text-sm text-pizarra" aria-live="polite">
              {enviado ? 'Listo: te abrimos WhatsApp para terminar y te respondemos con tu descuento.' : ''}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

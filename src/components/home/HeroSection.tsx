import Link from 'next/link';
import { BadgeCheck, ShieldCheck, Wrench } from 'lucide-react';
import { WHATSAPP_CONSULTA } from '@/lib/constants';
import VideoLocal from './VideoLocal';

const DIFERENCIALES = [
  { icono: Wrench, titulo: 'Taller propio', texto: 'Armamos tus lentes en el momento' },
  { icono: ShieldCheck, titulo: 'Mutualistas y BPS', texto: 'Hacemos el trámite en el local' },
  { icono: BadgeCheck, titulo: 'Especialistas Varilux', texto: 'Certificados por Essilor' },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-papel pt-[72px]">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-12 sm:px-6 md:pt-16 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:pb-24">
        <div className="lg:col-span-6">
          {/* "Tus lentes en el acto" es lo que dice la vidriera del local. */}
          <h1 className="entrada titular max-w-[12ch] text-[2.75rem] text-tinta sm:text-6xl xl:text-7xl">Tus lentes, en el acto.</h1>
          <p style={{ '--retraso': '0.12s' } as React.CSSProperties} className="entrada mt-6 max-w-[42ch] text-lg leading-relaxed text-pizarra md:text-xl">
            Más de mil armazones con precio a la vista y cristales de las mejores marcas, armados en nuestro taller. Frente a
            la plaza de Las Piedras y en Canelones.
          </p>
          <div style={{ '--retraso': '0.22s' } as React.CSSProperties} className="entrada mt-9 flex flex-wrap items-center gap-3">
            <a href={WHATSAPP_CONSULTA} target="_blank" rel="noopener noreferrer" className="btn-cta">
              Consultanos por WhatsApp
            </a>
            <Link href="/catalogo" className="btn-outline bg-white">
              Ver catálogo
            </Link>
          </div>

          <ul style={{ '--retraso': '0.34s' } as React.CSSProperties} className="entrada mt-12 grid gap-6 border-t border-linea pt-8 sm:grid-cols-3">
            {DIFERENCIALES.map(({ icono: Icono, titulo, texto }) => (
              <li key={titulo} className="flex gap-3 sm:block">
                <Icono size={24} strokeWidth={1.75} className="shrink-0 text-cobalto" aria-hidden />
                <div className="sm:mt-3">
                  <p className="text-[15px] font-semibold text-tinta">{titulo}</p>
                  <p className="mt-0.5 text-sm text-pizarra">{texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative lg:col-span-6">
          <div className="abrir-foto relative mx-auto aspect-[4/5] w-full max-w-[520px] overflow-hidden rounded-[28px] bg-linea lg:ml-auto lg:mr-0">
            <VideoLocal />
          </div>
        </div>
      </div>
    </section>
  );
}

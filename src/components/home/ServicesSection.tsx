import Image from 'next/image';
import { Check, Eye, ShieldCheck, Wrench } from 'lucide-react';
import { WHATSAPP_AGENDAR } from '@/lib/constants';
import EncabezadoSeccion from './EncabezadoSeccion';

// Servicios del local. La revisión visual conserva id="chequeo" (el menú
// "Salud visual" y el pie apuntan ahí) y la sección id="servicios".
export default function ServicesSection() {
  return (
    <section id="servicios" className="bg-papel py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <EncabezadoSeccion
          titulo="Servicios"
          bajada="La revisión, el armado y los ajustes se hacen en el local."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-12">
          <article
            id="chequeo"
            data-aparecer
            className="flex scroll-mt-24 flex-col rounded-3xl bg-cobalto p-8 text-white md:p-10 lg:col-span-5 lg:row-span-2"
          >
            <Eye size={32} strokeWidth={1.75} aria-hidden />
            <h3 className="titular mt-10 text-3xl md:text-4xl">Revisión visual sin costo</h3>
            <p className="mt-4 text-lg leading-relaxed text-white/80">
              Te revisamos la vista antes de elegir los lentes, en Las Piedras y en Canelones. Agendá por WhatsApp.
            </p>
            <ul className="mt-8 space-y-3">
              {['Sin costo y sin compromiso', 'En los dos locales', 'Resultado en el momento'].map((item) => (
                <li key={item} className="flex gap-3 text-[15px]">
                  <Check size={18} strokeWidth={2.25} className="mt-px shrink-0" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-10">
              <a
                href={WHATSAPP_AGENDAR}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cta bg-white text-cobalto hover:bg-vidrio"
              >
                Agendá tu revisión
              </a>
            </div>
          </article>

          <article
            data-aparecer
            data-aparecer-retraso={100}
            className="grid overflow-hidden rounded-3xl bg-white ring-1 ring-linea sm:grid-cols-2 lg:col-span-7"
          >
            <div className="relative aspect-[16/10] bg-linea sm:aspect-auto">
              <Image
                src="/media/local/taller-biseladora.jpg"
                alt="Biseladora digital del taller de Óptica Roma"
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, 30vw"
                className="object-cover"
              />
            </div>
            <div className="p-8">
              <Wrench size={26} strokeWidth={1.75} className="text-cobalto" aria-hidden />
              <h3 className="titular mt-6 text-2xl text-tinta">Taller propio</h3>
              <p className="mt-3 leading-relaxed text-pizarra">
                Armamos y ajustamos tus lentes en nuestro taller, con biseladora digital. Por eso muchos trabajos salen en
                el momento.
              </p>
            </div>
          </article>

          <article
            data-aparecer
            data-aparecer-retraso={200}
            className="flex flex-col gap-6 rounded-3xl bg-white p-8 ring-1 ring-linea sm:flex-row sm:items-start lg:col-span-7"
          >
            <ShieldCheck size={26} strokeWidth={1.75} className="shrink-0 text-cobalto" aria-hidden />
            <div>
              <h3 className="titular text-2xl text-tinta">Garantía de adaptación</h3>
              <p className="mt-3 leading-relaxed text-pizarra">
                Si tus multifocales no te resultan cómodos en los primeros 30 días, los ajustamos o los cambiamos sin costo.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

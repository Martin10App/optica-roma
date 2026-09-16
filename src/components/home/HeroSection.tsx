import Image from 'next/image';
import Link from 'next/link';
import { WHATSAPP_AGENDAR } from '@/lib/constants';

// Server component: la portada no necesita JavaScript para verse. Antes el
// texto arrancaba invisible hasta que corría una animación, y en celulares
// lentos la primera pantalla aparecía en blanco.
export default function HeroSection() {
  return (
    <section className="bg-white pb-16 pt-28 md:pb-24 md:pt-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
        <div className="lg:col-span-6 xl:col-span-6">
          {/* "Tus lentes en el acto" es lo que dice la vidriera del local. */}
          <h1 className="titular max-w-[12ch] text-[2.75rem] text-tinta sm:text-6xl lg:text-7xl">
            Tus lentes, en el acto.
          </h1>
          <p className="mt-6 max-w-[38ch] text-lg leading-relaxed text-pizarra md:text-xl">
            Revisión visual gratuita, taller propio y más de mil armazones. Frente a la plaza de Las Piedras y en
            Canelones.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <a href={WHATSAPP_AGENDAR} target="_blank" rel="noopener noreferrer" className="btn-cta">
              Agendá tu revisión
            </a>
            <Link href="/#catalogo" className="enlace">
              Ver armazones
            </Link>
          </div>
        </div>

        <figure className="lg:col-span-6 lg:justify-self-end xl:col-span-5 xl:col-start-8">
          <div className="abrir-foto relative aspect-[4/5] w-full overflow-hidden rounded-[28px] bg-papel sm:max-w-[460px]">
            <Image
              src="/media/local/vidriera-las-piedras.jpg"
              alt="Vidriera de Óptica Roma en Las Piedras, con exhibidores redondos llenos de armazones"
              fill
              priority
              sizes="(max-width: 640px) 92vw, 460px"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-3 text-sm text-pizarra">Nuestra vidriera en Rivera 617, Las Piedras.</figcaption>
        </figure>
      </div>
    </section>
  );
}

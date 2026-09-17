'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import EncabezadoSeccion from './EncabezadoSeccion';

const CRISTALES = [
  {
    titulo: 'Materiales',
    texto: 'Orgánicos, policarbonato o alto índice: el material depende de tu graduación y del armazón que elijas.',
    href: '/projects/materiales',
    video: '/media/limpiando-cristales.mp4',
  },
  {
    titulo: 'Multifocales',
    texto: 'Progresivos digitales para ver de lejos, a media distancia y de cerca con el mismo lente.',
    href: '/projects/multifocales',
    // Distinto del de Varilux X Series: los comerciales de 30 y 45 s comparten escenas
    video: '/media/ess_varilux_seenolimits_product_benefice_15s_arg-1080x1080.mp4',
  },
  {
    titulo: 'Blue Block',
    texto: 'Filtro de luz azul para quienes pasan muchas horas frente a la computadora o el celular.',
    href: '/projects/blue-block',
    video: '/media/mujer-usando-lentes-mirando-cel.mp4',
  },
  {
    titulo: 'Varilux X Series',
    texto: 'Los progresivos más avanzados de Varilux. Óptica Roma está certificada como especialista Varilux.',
    href: '/projects/varilux-x-series',
    video: '/media/ess_varilux_seenolimits_techno_15s_arg-1080x1080.mp4',
  },
];

export default function CrystalsSection() {
  return (
    <section id="cristales" className="bg-papel py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <EncabezadoSeccion
          titulo="Cristales"
          bajada="Te ayudamos a elegir el cristal según tu graduación y lo que hacés en el día."
        />

        <ul className="mt-12 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {CRISTALES.map((cristal, i) => (
            <li key={cristal.titulo} data-aparecer data-aparecer-retraso={i * 90}>
              <TarjetaCristal {...cristal} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// Cada video arranca solo cuando la tarjeta se ve en pantalla (en el celular
// también) y se pausa al salir, así no se descargan los cuatro de golpe ni
// siguen corriendo fuera de la vista. Con "reducir movimiento" queda la imagen fija.
function TarjetaCristal({ titulo, texto, href, video }: (typeof CRISTALES)[number]) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // React no escribe "muted" en el HTML: sin esto el celular no deja reproducir
    v.muted = true;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.4 }
    );
    observador.observe(v);
    return () => observador.disconnect();
  }, []);

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-linea">
        <video
          ref={ref}
          src={video}
          poster={video.replace('.mp4', '-poster.jpg')}
          preload="none"
          muted
          loop
          playsInline
          aria-hidden
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <h3 className="mt-5 flex items-center justify-between gap-3 text-xl font-semibold text-tinta">
        {titulo}
        <ArrowRight
          size={20}
          className="shrink-0 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-cobalto"
          aria-hidden
        />
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-pizarra">{texto}</p>
    </Link>
  );
}

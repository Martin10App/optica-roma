'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { useCatalogo } from '@/lib/useCatalogo';

export default function AboutSection() {
  const { productos, estado } = useCatalogo();

  const armazones = useMemo(
    () => productos.filter((p) => p.stock_visible && (p.categoria === 'Armazones de Receta' || p.categoria === 'Lentes de Sol')).length,
    [productos]
  );

  const datos = [
    { valor: '+10', texto: 'años haciendo lentes' },
    { valor: '2', texto: 'locales: Las Piedras y Canelones' },
    { valor: estado === 'listo' ? armazones.toLocaleString('es-UY') : '+1.000', texto: 'armazones en stock' },
    { valor: '4,9', texto: 'de puntaje en Google' },
  ];

  return (
    <section id="nosotros" className="bg-white py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div data-aparecer className="lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-linea">
            <Image
              src="/media/local/interior-las-piedras.jpg"
              alt="Pared de armazones del local de Óptica Roma en Las Piedras"
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="lg:col-span-7">
          <div data-aparecer>
            <h2 className="titular text-3xl text-tinta md:text-5xl">Nosotros</h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-pizarra">
              <p>
                Óptica Roma está frente a la plaza de Las Piedras, en Rivera 617, y tiene un segundo local en Canelones.
                Hace más de 10 años que hacemos lentes para las familias de la zona.
              </p>
              <p>
                Te atendemos de principio a fin: la revisión visual, la elección del armazón, los cristales y el armado en
                nuestro taller. Además estamos certificados como especialistas en lentes progresivos Varilux.
              </p>
            </div>
          </div>

          <dl
            data-aparecer
            data-aparecer-retraso={120}
            className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-linea pt-10 sm:grid-cols-4"
          >
            {datos.map(({ valor, texto }) => (
              <div key={texto}>
                <dt className="sr-only">{texto}</dt>
                <dd className="titular text-4xl tabular-nums text-tinta xl:text-5xl">{valor}</dd>
                <dd className="mt-2 text-sm leading-snug text-pizarra">{texto}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { useCatalogo } from '@/lib/useCatalogo';
import { formatearPrecio, nombreMarca } from '@/lib/catalogoTipos';

const CANTIDAD = 12;

// Los últimos armazones que entraron al catálogo, en círculos como las
// vitrinas redondas del local. Usa la misma descarga que el catálogo, así que
// no suma ninguna consulta. La foto llena el círculo entero: muchas tienen el
// fondo gris claro o negro, y achicada dentro del círculo se veía el rectángulo.
export default function RecienLlegadosSection() {
  const { productos, estado } = useCatalogo();

  const nuevos = useMemo(
    () =>
      productos
        .filter((p) => p.stock_visible && p.imagen_url?.startsWith('/armazones/'))
        .sort((a, b) => b.id - a.id)
        .slice(0, CANTIDAD),
    [productos]
  );

  if (estado === 'error' || (estado === 'listo' && nuevos.length === 0)) return null;

  return (
    <section aria-labelledby="recien-llegados" className="bg-papel py-16 md:py-20">
      <div className="mx-auto flex max-w-7xl items-end justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <h2 id="recien-llegados" className="titular text-3xl text-tinta md:text-4xl">
          Recién llegados
        </h2>
        <Link href="/#catalogo" className="enlace shrink-0 text-[15px]">
          Ver todo el catálogo
        </Link>
      </div>

      {/* El padding lateral alinea el primer círculo con el título en pantallas anchas */}
      <ul className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4 sm:px-6 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))] scroll-px-4 sm:scroll-px-6 lg:scroll-px-[max(2rem,calc((100vw-80rem)/2+2rem))]">
        {estado === 'cargando'
          ? Array.from({ length: 6 }, (_, i) => (
              <li key={i} aria-hidden className="w-40 shrink-0 sm:w-48">
                <div className="aspect-square animate-pulse rounded-full bg-white" />
                <div className="mx-auto mt-4 h-3 w-1/2 animate-pulse rounded-full bg-linea" />
                <div className="mx-auto mt-2 h-4 w-3/4 animate-pulse rounded-full bg-linea" />
              </li>
            ))
          : nuevos.map((p) => (
              <li key={p.id} className="w-40 shrink-0 snap-start sm:w-48">
                <Link href={`/?q=${encodeURIComponent(p.modelo)}#catalogo`} className="group block text-center">
                  <div className="relative aspect-square overflow-hidden rounded-full bg-white ring-1 ring-inset ring-linea transition-shadow group-hover:ring-tinta/25">
                    <Image
                      src={p.imagen_url!}
                      alt={`${nombreMarca(p.marca)} ${p.modelo}`}
                      fill
                      unoptimized
                      sizes="192px"
                      className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.05]"
                    />
                  </div>
                  <p className="mt-4 truncate text-[13px] text-pizarra">{nombreMarca(p.marca)}</p>
                  <p className="truncate text-[15px] font-medium text-tinta">{p.modelo}</p>
                  <p className="mt-0.5 text-[15px] font-semibold tabular-nums text-tinta">{formatearPrecio(p.precio)}</p>
                </Link>
              </li>
            ))}
      </ul>
    </section>
  );
}

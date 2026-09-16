'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { useCatalogo } from '@/lib/useCatalogo';
import { formatearPrecio, nombreMarca } from '@/lib/catalogoTipos';

const CANTIDAD = 16;

// Los últimos armazones que entraron al catálogo, desfilando despacio hacia el
// costado en círculos como las vitrinas redondas del local. Se frena al pasar
// el mouse o al navegar con el teclado. Usa la misma descarga que el catálogo,
// así que no suma ninguna consulta.
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

  // La lista va dos veces seguidas: cuando la primera termina de pasar, la
  // segunda está exactamente en su lugar y el desfile no tiene salto.
  const desfile = [...nuevos, ...nuevos];

  return (
    <section aria-labelledby="recien-llegados" className="overflow-hidden bg-papel py-16 md:py-20">
      <div data-aparecer className="mx-auto flex max-w-7xl items-end justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <h2 id="recien-llegados" className="titular text-3xl text-tinta md:text-4xl">
          Recién llegados
        </h2>
        <Link href="/catalogo" className="enlace shrink-0 text-[15px]">
          Ver todo el catálogo
        </Link>
      </div>

      <div className="desfile-marco relative mt-10 py-3">
        {estado === 'cargando' ? (
          <ul className="flex gap-6 px-4 sm:px-6 lg:px-8" aria-hidden>
            {Array.from({ length: 8 }, (_, i) => (
              <li key={i} className="w-40 shrink-0 sm:w-48">
                <div className="aspect-square animate-pulse rounded-full bg-white" />
                <div className="mx-auto mt-4 h-3 w-1/2 animate-pulse rounded-full bg-linea" />
                <div className="mx-auto mt-2 h-4 w-3/4 animate-pulse rounded-full bg-linea" />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="desfile flex w-max" style={{ '--duracion': `${nuevos.length * 4.5}s` } as React.CSSProperties}>
            {desfile.map((p, i) => {
              const copia = i >= nuevos.length;
              return (
                // Margen a la izquierda de cada uno (y no `gap`): así las dos
                // mitades miden lo mismo y el -50% del desfile cae justo.
                <li key={`${p.id}-${i}`} aria-hidden={copia || undefined} className="ml-6 w-40 shrink-0 sm:w-48">
                  <Link
                    href={`/catalogo/buscar/${encodeURIComponent(p.modelo)}`}
                    tabIndex={copia ? -1 : undefined}
                    className="group block text-center"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-full bg-white shadow-[0_10px_30px_-18px_rgba(16,21,43,0.35)] ring-1 ring-inset ring-linea transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_22px_40px_-20px_rgba(11,43,214,0.45)]">
                      <Image
                        src={p.imagen_url!}
                        alt={copia ? '' : `${nombreMarca(p.marca)} ${p.modelo}`}
                        fill
                        unoptimized
                        sizes="192px"
                        className="object-contain p-[9%] transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                      />
                    </div>
                    <p className="mt-4 truncate text-[13px] text-pizarra">{nombreMarca(p.marca)}</p>
                    <p className="truncate text-[15px] font-medium text-tinta">{p.modelo}</p>
                    <p className="mt-0.5 text-[15px] font-semibold tabular-nums text-tinta">{formatearPrecio(p.precio)}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

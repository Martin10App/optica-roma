'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { useCatalogo } from '@/lib/useCatalogo';
import { formatearPrecio } from '@/lib/catalogoTipos';

const MARCA = 'NATALIA OREIRO';

// La colección de Natalia Oreiro con la foto de la campaña y los modelos que hay
// en el catálogo (la misma descarga del catálogo: no suma consultas).
export default function OreiroSection() {
  const { productos } = useCatalogo();

  const { modelos, cantidad } = useMemo(() => {
    const deLaMarca = productos.filter((p) => p.marca.toUpperCase() === MARCA);
    const conFoto = deLaMarca.filter((p) => p.stock_visible && p.imagen_url).sort((a, b) => b.id - a.id);
    return { modelos: conFoto.slice(0, 3), cantidad: deLaMarca.filter((p) => p.stock_visible).length };
  }, [productos]);

  return (
    <section aria-labelledby="natalia-oreiro" className="overflow-hidden bg-tinta text-white">
      {/* En pantallas grandes el texto queda alineado con el resto de la página y
          la foto llega hasta el borde derecho de la pantalla. */}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,33rem)_minmax(0,47rem)_minmax(0,1fr)]">
        <div className="relative order-2 px-4 py-16 sm:px-6 md:py-20 lg:order-1 lg:col-start-2 lg:py-24 lg:pl-8 lg:pr-12">
          <div data-aparecer>
            <p className="text-sm font-medium text-white/60">Colección 2026</p>
            <h2 id="natalia-oreiro" className="titular mt-3 text-4xl md:text-6xl">
              Natalia Oreiro
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/75">
              Los armazones que diseñó Natalia Oreiro, para probártelos en el local.
              {cantidad > 0 && ` Hoy tenemos ${cantidad} ${cantidad === 1 ? 'modelo' : 'modelos'} en stock.`}
            </p>
          </div>

          {modelos.length > 0 && (
            <ul data-aparecer data-aparecer-retraso={120} className="mt-10 grid grid-cols-3 gap-3">
              {modelos.map((p) => (
                <li key={p.id}>
                  <Link href={`/catalogo/buscar/${encodeURIComponent(p.modelo)}`} className="group block">
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
                      <Image
                        src={p.imagen_url!}
                        alt={`Natalia Oreiro ${p.modelo}`}
                        fill
                        unoptimized
                        sizes="160px"
                        className="object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                      />
                    </div>
                    <p className="mt-2 truncate text-[13px] text-white/60">{p.modelo}</p>
                    <p className="text-[15px] font-semibold tabular-nums">{formatearPrecio(p.precio)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div data-aparecer data-aparecer-retraso={200} className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link href="/catalogo/natalia-oreiro" className="btn-cta bg-white text-tinta hover:bg-vidrio">
              Ver la colección
            </Link>
            <Link
              href="/projects/natalia-oreiro"
              className="text-[15px] font-semibold text-white underline decoration-white/40 underline-offset-[0.3em] transition hover:decoration-white"
            >
              Sobre la colección
            </Link>
          </div>
        </div>

        <div className="relative order-1 aspect-[16/11] lg:order-2 lg:col-start-3 lg:col-end-5 lg:aspect-auto lg:min-h-[600px]">
          <Image
            src="/media/logos/natalia-oreiro-hero-fw26.jpg"
            alt="Natalia Oreiro con un armazón de su colección"
            fill
            unoptimized
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover object-[72%_center]"
          />
        </div>
      </div>
    </section>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { useCatalogo } from '@/lib/useCatalogo';
import { normalizarTexto } from '@/lib/catalogoTipos';
import { RUTAS_CATEGORIAS } from '@/lib/catalogoRutas';

const TITULOS: Record<string, string> = {
  'Armazones de Receta': 'Armazones de receta',
  'Lentes de Sol': 'Lentes de sol',
  'Lentes de Contacto': 'Lentes de contacto',
  Accesorios: 'Accesorios',
};

// Entrada al catálogo desde la portada. Conserva id="catalogo" para que los
// links viejos a /#catalogo sigan cayendo acá. La foto de cada categoría es el
// último artículo con stock que entró, así cambia sola con la mercadería.
export default function CategoriasSection() {
  const { productos, estado } = useCatalogo();

  const resumen = useMemo(
    () =>
      RUTAS_CATEGORIAS.map(({ categoria, ruta }) => {
        const clave = normalizarTexto(categoria);
        const deLaCategoria = productos.filter((p) => normalizarTexto(p.categoria) === clave);
        const muestra = deLaCategoria
          .filter((p) => p.stock_visible && p.imagen_url)
          .sort((a, b) => b.id - a.id)[0];
        return { categoria, ruta, cantidad: deLaCategoria.length, foto: muestra?.imagen_url ?? null };
      }),
    [productos]
  );

  return (
    <section id="catalogo" className="bg-white py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div data-aparecer className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="titular text-3xl text-tinta md:text-5xl">Catálogo</h2>
          <Link href="/catalogo" className="enlace text-[15px]">
            Ver todo el catálogo
          </Link>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {resumen.map(({ categoria, ruta, cantidad, foto }, i) => (
            <li key={categoria} data-aparecer data-aparecer-retraso={i * 90}>
              <Link href={ruta} className="group block">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-papel">
                  {foto ? (
                    <Image
                      src={foto}
                      alt={TITULOS[categoria]}
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                  ) : (
                    estado === 'cargando' && <div className="absolute inset-0 animate-pulse bg-papel" />
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-tinta">{TITULOS[categoria]}</p>
                    <p className="text-sm tabular-nums text-pizarra">
                      {estado === 'listo' ? `${cantidad.toLocaleString('es-UY')} ${cantidad === 1 ? 'artículo' : 'artículos'}` : ' '}
                    </p>
                  </div>
                  <ArrowRight
                    size={20}
                    className="shrink-0 text-tinta transition-transform duration-200 group-hover:translate-x-1 group-hover:text-cobalto"
                    aria-hidden
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

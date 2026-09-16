'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useCatalogo } from '@/lib/useCatalogo';
import { nombreMarca } from '@/lib/catalogoTipos';
import { slugsDeMarca } from '@/lib/catalogoRutas';
import EncabezadoSeccion from './EncabezadoSeccion';

type Marca = {
  /** Como está escrita en el inventario */
  clave: string;
  logo?: string;
  /** Clases de la letra para las marcas que no tienen logo en /media/logos */
  letra?: string;
  href?: string;
};

// Dos filas que avanzan hacia lados opuestos. Queda afuera lo que en el programa
// se carga como marca pero no lo es (ARMAZON CON CLIP, KIDS, CHILD, CASINO...).
const FILAS: Marca[][] = [
  [
    { clave: 'RAYBAN', logo: '/media/logos/Ray-Ban_logo.svg.png' },
    { clave: 'VOGUE', letra: 'font-serif text-[1.7rem] uppercase tracking-[0.22em]' },
    { clave: 'ARMANI EXCHANGE', logo: '/media/logos/armani-logo.webp' },
    { clave: 'LACOSTE', letra: 'text-xl font-semibold uppercase tracking-[0.18em]' },
    { clave: 'NATALIA OREIRO', logo: '/media/logos/natalia-oreiro-logo.svg' },
    { clave: 'CALVIN KLEIN', letra: 'text-base font-light uppercase tracking-[0.32em]' },
    { clave: 'VARILUX', logo: '/media/logos/varilux-logo.png', href: '/projects/varilux-x-series' },
    { clave: 'NINETY', letra: 'text-xl font-bold uppercase tracking-[0.35em]' },
    { clave: 'VIKY', letra: 'font-serif text-3xl italic' },
    { clave: 'ALMA SANTA', letra: 'font-serif text-xl uppercase tracking-[0.2em]' },
    { clave: 'SANTORINO', letra: 'text-lg font-medium uppercase tracking-[0.25em]' },
    { clave: 'SHADOW', letra: 'font-serif text-3xl italic lowercase' },
    { clave: 'AMADEUS', letra: 'font-serif text-[1.7rem] italic' },
  ],
  [
    { clave: 'FLIP', letra: 'text-3xl font-black uppercase tracking-tight' },
    { clave: 'JBX', letra: 'text-3xl font-black' },
    { clave: 'MONTANA', letra: 'text-lg font-semibold uppercase tracking-[0.3em]' },
    { clave: 'DAGGER', letra: 'text-xl font-extrabold uppercase tracking-[0.2em]' },
    { clave: 'GASOIL', letra: 'text-2xl font-black uppercase tracking-tight' },
    { clave: 'LANCO', letra: 'text-lg font-medium uppercase tracking-[0.3em]' },
    { clave: 'BELLAGIO', letra: 'font-serif text-[1.7rem] italic' },
    { clave: 'MYTHO', letra: 'text-lg font-light uppercase tracking-[0.4em]' },
    { clave: 'OCEANBLUE', letra: 'text-xl font-semibold tracking-wide' },
    { clave: 'REEF', letra: 'text-3xl font-black uppercase italic' },
    { clave: 'SUNRISE', letra: 'text-lg font-medium uppercase tracking-[0.3em]' },
    { clave: 'RAFAELLA', letra: 'font-serif text-[1.7rem] italic' },
    { clave: 'VIZZINI', letra: 'font-serif text-lg uppercase tracking-[0.3em]' },
    { clave: 'DIVERONA', letra: 'font-serif text-2xl' },
    { clave: 'LOME', letra: 'text-lg font-semibold uppercase tracking-[0.4em]' },
  ],
];

export default function MarcasSection() {
  const { productos, estado } = useCatalogo();

  const filas = useMemo(() => {
    const conStock = new Set(productos.map((p) => p.marca.toUpperCase()));
    // Hasta que baja el catálogo se muestran todas; después, solo las que tienen modelos
    return FILAS.map((fila) => fila.filter((m) => m.href || estado !== 'listo' || conStock.has(m.clave)));
  }, [productos, estado]);

  return (
    <section aria-labelledby="marcas" className="overflow-hidden bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <EncabezadoSeccion
          idTitulo="marcas"
          titulo="Marcas"
          bajada="Trabajamos con las mejores marcas. Tocá una para ver sus modelos."
          accion={
            <Link href="/catalogo" className="enlace text-[15px]">
              Ver todo el catálogo
            </Link>
          }
        />
      </div>

      <div data-aparecer className="mt-12 space-y-4">
        {filas.map((fila, f) => (
          <div key={f} className="desfile-marco py-1">
            <ul
              className={`desfile flex w-max ${f === 1 ? 'desfile-inverso' : ''}`}
              style={{ '--duracion': `${fila.length * 4}s` } as React.CSSProperties}
            >
              {[...fila, ...fila].map((marca, i) => {
                const copia = i >= fila.length;
                const nombre = marca.clave === 'VARILUX' ? 'Varilux' : nombreMarca(marca.clave);
                return (
                  <li key={`${marca.clave}-${i}`} aria-hidden={copia || undefined} className="ml-4 shrink-0">
                    <Link
                      href={marca.href ?? `/catalogo/${slugsDeMarca(marca.clave)[0]}`}
                      tabIndex={copia ? -1 : undefined}
                      aria-label={marca.logo ? nombre : undefined}
                      className="group flex h-24 w-44 items-center justify-center rounded-2xl bg-white px-5 ring-1 ring-linea transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(16,21,43,0.35)] hover:ring-cobalto/30 md:h-28 md:w-52"
                    >
                      {marca.logo ? (
                        <img
                          src={marca.logo}
                          alt={copia ? '' : nombre}
                          loading="lazy"
                          className="max-h-12 max-w-full object-contain opacity-90 transition group-hover:opacity-100 md:max-h-14"
                        />
                      ) : (
                        <span
                          className={`whitespace-nowrap text-tinta/75 transition-colors group-hover:text-tinta ${marca.letra ?? ''}`}
                        >
                          {nombre}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

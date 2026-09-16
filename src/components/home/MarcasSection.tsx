'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useCatalogo } from '@/lib/useCatalogo';
import { nombreMarca } from '@/lib/catalogoTipos';
import { slugsDeMarca } from '@/lib/catalogoRutas';
import EncabezadoSeccion from './EncabezadoSeccion';

// Marcas tal como están escritas en el inventario. Primero las internacionales,
// después el resto por cantidad de modelos. Queda afuera lo que en el programa
// se carga como marca pero no lo es (ARMAZON CON CLIP, KIDS, CHILD, CASINO...).
const INTERNACIONALES = ['RAYBAN', 'VOGUE', 'LACOSTE', 'CALVIN KLEIN', 'ARMANI EXCHANGE', 'NATALIA OREIRO'];
const PROPIAS = [
  'VIKY', 'NINETY', 'SANTORINO', 'ALMA SANTA', 'SHADOW', 'AMADEUS', 'FLIP', 'JBX', 'MONTANA', 'DAGGER', 'GASOIL',
  'LANCO', 'BELLAGIO', 'MYTHO', 'OCEANBLUE', 'REEF', 'SUNRISE', 'RAFAELLA', 'VIZZINI', 'DIVERONA', 'LOME',
];

export default function MarcasSection() {
  const { productos, estado } = useCatalogo();

  const marcas = useMemo(() => {
    const cantidades = new Map<string, number>();
    for (const p of productos) {
      const clave = p.marca.toUpperCase();
      cantidades.set(clave, (cantidades.get(clave) ?? 0) + 1);
    }
    const propias = [...PROPIAS].sort((a, b) => (cantidades.get(b) ?? 0) - (cantidades.get(a) ?? 0));
    return [...INTERNACIONALES, ...propias]
      .map((marca) => ({ marca, cantidad: cantidades.get(marca) ?? 0 }))
      .filter(({ cantidad }) => estado !== 'listo' || cantidad > 0);
  }, [productos, estado]);

  return (
    <section aria-labelledby="marcas" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <EncabezadoSeccion
          idTitulo="marcas"
          titulo="Marcas"
          bajada="Todas las que tenemos hoy, con la cantidad de modelos de cada una."
          accion={
            <Link href="/catalogo" className="enlace text-[15px]">
              Ver todo el catálogo
            </Link>
          }
        />

        <ul data-aparecer className="mt-12 flex flex-wrap gap-x-7 gap-y-2 border-t border-linea pt-10 md:gap-x-10 md:gap-y-3">
          {marcas.map(({ marca, cantidad }) => (
            <li key={marca}>
              <Link
                href={`/catalogo/${slugsDeMarca(marca)[0]}`}
                className="group inline-flex items-start gap-1.5 text-[1.65rem] leading-tight text-tinta transition-colors hover:text-cobalto md:text-[2.5rem]"
              >
                <span className="titular underline decoration-transparent decoration-2 underline-offset-[0.18em] transition-[text-decoration-color] group-hover:decoration-current">
                  {nombreMarca(marca)}
                </span>
                {cantidad > 0 && (
                  <span className="mt-1 text-xs font-medium tabular-nums text-pizarra md:mt-2 md:text-sm">{cantidad}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

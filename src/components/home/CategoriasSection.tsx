'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { useCatalogo } from '@/lib/useCatalogo';
import { normalizarTexto, type Producto } from '@/lib/catalogoTipos';
import { RUTAS_CATEGORIAS } from '@/lib/catalogoRutas';
import FotosCategoria from './FotosCategoria';

const TITULOS: Record<string, string> = {
  'Armazones de Receta': 'Armazones de receta',
  'Lentes de Sol': 'Lentes de sol',
  'Lentes de Contacto': 'Lentes de contacto',
  Accesorios: 'Accesorios',
};

// En armazones de receta y lentes de sol las fotos van pasando. Salen los más
// vendidos (el programa los calcula con las ventas confirmadas); si todavía no
// hay suficientes, se completan con lo último que entró. Se intercalan marcas
// para que no pasen cinco del mismo proveedor seguidas.
const CATEGORIAS_CON_FOTOS_QUE_PASAN = new Set(['Armazones de Receta', 'Lentes de Sol']);
const MAXIMO_FOTOS = 12;
const MINIMO_MAS_VENDIDOS = 4;

function intercalarMarcas(lista: Producto[]) {
  const grupos = new Map<string, Producto[]>();
  for (const p of lista) {
    const grupo = grupos.get(p.marca) ?? [];
    grupo.push(p);
    grupos.set(p.marca, grupo);
  }
  const resultado: Producto[] = [];
  for (let ronda = 0; resultado.length < lista.length; ronda++) {
    grupos.forEach((grupo) => {
      if (grupo[ronda]) resultado.push(grupo[ronda]);
    });
  }
  return resultado;
}

function fotosDeCategoria(deLaCategoria: Producto[], rotan: boolean) {
  const conFoto = deLaCategoria.filter((p) => p.stock_visible && p.imagen_url).sort((a, b) => b.id - a.id);
  if (!rotan) return { fotos: conFoto.slice(0, 1), masVendidos: false };

  const vendidos = conFoto.filter((p) => p.mas_vendido);
  const masVendidos = vendidos.length >= MINIMO_MAS_VENDIDOS;
  const base = masVendidos ? vendidos : [...vendidos, ...conFoto.filter((p) => !p.mas_vendido)];
  return { fotos: intercalarMarcas(base).slice(0, MAXIMO_FOTOS), masVendidos };
}

// Entrada al catálogo desde la portada. Conserva id="catalogo" para que los
// links viejos a /#catalogo sigan cayendo acá. Las fotos salen del mismo
// catálogo que ya descargó la página: no suman ninguna consulta a la base.
export default function CategoriasSection() {
  const { productos, estado } = useCatalogo();

  const resumen = useMemo(
    () =>
      RUTAS_CATEGORIAS.map(({ categoria, ruta }) => {
        const clave = normalizarTexto(categoria);
        const deLaCategoria = productos.filter((p) => normalizarTexto(p.categoria) === clave);
        const { fotos, masVendidos } = fotosDeCategoria(deLaCategoria, CATEGORIAS_CON_FOTOS_QUE_PASAN.has(categoria));
        return { categoria, ruta, cantidad: deLaCategoria.length, fotos, masVendidos };
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
          {resumen.map(({ categoria, ruta, cantidad, fotos, masVendidos }, i) => (
            <li key={categoria} data-aparecer data-aparecer-retraso={i * 90}>
              <Link href={ruta} className="group block">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-papel">
                  {fotos.length > 0 ? (
                    <FotosCategoria productos={fotos} desfaseMs={i * 2100} />
                  ) : (
                    estado === 'cargando' && <div className="absolute inset-0 animate-pulse bg-papel" />
                  )}
                  {fotos.length > 1 && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[12px] font-medium text-tinta shadow-[0_1px_2px_rgba(16,21,43,0.08)]">
                      {masVendidos ? 'Los más vendidos' : 'Recién llegados'}
                    </span>
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

'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Check, Link2, Search, X } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { useCatalogo } from '@/lib/useCatalogo';
import {
  CATEGORIAS,
  aSlug,
  categoriaDesdeParam,
  nombreMarca,
  normalizarTexto,
  type Producto,
} from '@/lib/catalogoTipos';

const POR_TANDA = 24;
// Cuántos de los últimos armazones cargados (con foto y stock) llevan "Nuevo".
const CANTIDAD_NUEVOS = 24;

const ORDENES = {
  recientes: 'Recién llegados',
  vendidos: 'Más vendidos',
  precio_asc: 'Precio: menor a mayor',
  precio_desc: 'Precio: mayor a menor',
} as const;
type Orden = keyof typeof ORDENES;

function ordenar(lista: Producto[], orden: Orden) {
  const agotadoAlFinal = (p: Producto) => (p.stock_visible ? 0 : 1);
  const criterio: Record<Orden, (a: Producto, b: Producto) => number> = {
    recientes: () => 0,
    vendidos: (a, b) => Number(b.mas_vendido) - Number(a.mas_vendido),
    precio_asc: (a, b) => a.precio - b.precio,
    precio_desc: (a, b) => b.precio - a.precio,
  };
  // El id lo pone la sincronización al insertar: id más alto = cargado más tarde.
  return [...lista].sort(
    (a, b) => agotadoAlFinal(a) - agotadoAlFinal(b) || criterio[orden](a, b) || b.id - a.id
  );
}

function enOracion(texto: string) {
  return texto.charAt(0) + texto.slice(1).toLowerCase();
}

function Esqueleto() {
  return (
    <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4" aria-hidden>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i}>
          <div className="aspect-square animate-pulse rounded-[20px] bg-white" />
          <div className="mt-3 h-3 w-1/3 animate-pulse rounded-full bg-linea" />
          <div className="mt-2 h-4 w-2/3 animate-pulse rounded-full bg-linea" />
        </div>
      ))}
    </div>
  );
}

function Chip({
  activo,
  children,
  onClick,
}: {
  activo: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={`h-10 shrink-0 rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--acento)] ${
        activo
          ? 'bg-[var(--acento)] text-white'
          : 'bg-white text-tinta ring-1 ring-inset ring-linea hover:ring-tinta/30'
      }`}
    >
      {children}
    </button>
  );
}

function CatalogoInteractivo({ lockedBrand }: { lockedBrand?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { productos, estado, reintentar } = useCatalogo();

  // La URL es la fuente de verdad de los filtros: así un link compartido
  // (por ejemplo ?marcas=ARMAZON+CON+CLIP#catalogo) abre exactamente lo mismo.
  const categoria = categoriaDesdeParam(searchParams.get('categoria'));
  const marcasParam = lockedBrand ? '' : searchParams.get('marcas') ?? '';
  const marcas = useMemo(
    () => marcasParam.split(',').map((m) => m.trim()).filter(Boolean),
    [marcasParam]
  );
  const qParam = searchParams.get('q') ?? '';

  const [texto, setTexto] = useState(qParam);
  const [orden, setOrden] = useState<Orden>('recientes');
  const [cantidad, setCantidad] = useState(POR_TANDA);
  const [marcasAbiertas, setMarcasAbiertas] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const actualizarUrl = useCallback(
    (cambios: Record<string, string | null>) => {
      const params = new URLSearchParams(window.location.search);
      for (const [clave, valor] of Object.entries(cambios)) {
        if (valor) params.set(clave, valor);
        else params.delete(clave);
      }
      const consulta = params.toString();
      // replaceState y no router.push: cambiar un filtro no necesita pedirle
      // nada al servidor, y Next mantiene useSearchParams sincronizado igual.
      window.history.replaceState(null, '', `${pathname}${consulta ? `?${consulta}` : ''}#catalogo`);
    },
    [pathname]
  );

  // Si ?q= cambia desde afuera (un link de "Recién llegados"), el buscador lo
  // muestra. Lo que escribió la persona no se pisa: eso ya está en qEscrito.
  const qEscrito = useRef(qParam);
  useEffect(() => {
    if (qParam !== qEscrito.current) {
      qEscrito.current = qParam;
      setTexto(qParam);
    }
  }, [qParam]);

  useEffect(() => {
    const espera = setTimeout(() => {
      const limpio = texto.trim();
      if (limpio !== qEscrito.current) {
        qEscrito.current = limpio;
        actualizarUrl({ q: limpio || null });
      }
    }, 350);
    return () => clearTimeout(espera);
  }, [texto, actualizarUrl]);

  // Un link con #catalogo tiene que terminar acá aunque la portada termine de
  // acomodarse después de que el navegador hizo el salto.
  const yaUbicado = useRef(false);
  useEffect(() => {
    if (estado !== 'listo' || yaUbicado.current) return;
    yaUbicado.current = true;
    if (window.location.hash === '#catalogo') {
      document.getElementById('catalogo')?.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
    }
  }, [estado]);

  const deLaCategoria = useMemo(() => {
    let lista = productos;
    if (lockedBrand) {
      const marca = normalizarTexto(lockedBrand);
      lista = lista.filter((p) => normalizarTexto(p.marca) === marca);
    }
    if (categoria) {
      const buscada = normalizarTexto(categoria);
      lista = lista.filter((p) => normalizarTexto(p.categoria) === buscada);
    }
    return lista;
  }, [productos, lockedBrand, categoria]);

  const marcasDisponibles = useMemo(() => {
    const conteo = new Map<string, number>();
    for (const p of deLaCategoria) {
      if (p.stock_visible) conteo.set(p.marca, (conteo.get(p.marca) ?? 0) + 1);
    }
    return [...conteo.entries()].sort((a, b) => nombreMarca(a[0]).localeCompare(nombreMarca(b[0]), 'es'));
  }, [deLaCategoria]);

  const filtrados = useMemo(() => {
    let lista = deLaCategoria;
    if (marcas.length) {
      const elegidas = new Set(marcas.map(normalizarTexto));
      lista = lista.filter((p) => elegidas.has(normalizarTexto(p.marca)));
    }
    const palabras = normalizarTexto(texto).split(' ').filter(Boolean);
    if (palabras.length) {
      lista = lista.filter((p) => {
        const donde = normalizarTexto(`${p.marca} ${nombreMarca(p.marca)} ${p.modelo}`);
        return palabras.every((palabra) => donde.includes(palabra));
      });
    }
    return ordenar(lista, orden);
  }, [deLaCategoria, marcas, texto, orden]);

  const idMinimoNuevo = useMemo(() => {
    const ids = productos
      .filter((p) => p.stock_visible && p.imagen_url?.startsWith('/armazones/'))
      .map((p) => p.id)
      .sort((a, b) => b - a);
    return ids.length ? ids[Math.min(CANTIDAD_NUEVOS, ids.length) - 1] : Infinity;
  }, [productos]);

  useEffect(() => {
    setCantidad(POR_TANDA);
  }, [categoria, marcasParam, texto, orden]);

  const elegirCategoria = (elegida: string | null) =>
    actualizarUrl({
      categoria: elegida ? aSlug(elegida) : null,
      ...(lockedBrand ? {} : { marcas: null }),
    });

  const alternarMarca = (marca: string) => {
    const clave = normalizarTexto(marca);
    const yaEsta = marcas.some((m) => normalizarTexto(m) === clave);
    const nuevas = yaEsta ? marcas.filter((m) => normalizarTexto(m) !== clave) : [...marcas, marca];
    actualizarUrl({ marcas: nuevas.length ? nuevas.join(',') : null });
  };

  const quitarFiltros = () => {
    qEscrito.current = '';
    setTexto('');
    actualizarUrl({ categoria: null, marcas: null, q: null });
  };

  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin permiso de portapapeles: el link igual está en la barra de direcciones.
    }
  };

  const hayFiltros = Boolean(categoria || marcas.length || texto.trim());
  const categoriasVisibles = lockedBrand ? CATEGORIAS.slice(0, 2) : CATEGORIAS;
  const faltan = filtrados.length - cantidad;

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Buscar por marca o modelo</span>
          <Search
            size={18}
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-pizarra"
          />
          <input
            type="search"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Buscar marca o modelo"
            className="h-12 w-full rounded-full border border-linea bg-white pl-11 pr-4 text-[15px] text-tinta placeholder:text-pizarra focus:border-[var(--acento)] focus:outline-none focus:ring-2 focus:ring-[var(--acento)]/15"
          />
        </label>
        <label className="flex items-center gap-3 text-sm text-pizarra">
          <span className="shrink-0">Ordenar por</span>
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as Orden)}
            className="h-12 w-full rounded-full border border-linea bg-white px-4 text-[15px] text-tinta focus:border-[var(--acento)] focus:outline-none focus:ring-2 focus:ring-[var(--acento)]/15 sm:w-auto"
          >
            {Object.entries(ORDENES).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip activo={!categoria} onClick={() => elegirCategoria(null)}>
          Todo
        </Chip>
        {categoriasVisibles.map((c) => (
          <Chip key={c} activo={categoria === c} onClick={() => elegirCategoria(c)}>
            {enOracion(c)}
          </Chip>
        ))}
        {!lockedBrand && (
          <button
            type="button"
            aria-expanded={marcasAbiertas}
            onClick={() => setMarcasAbiertas((abierto) => !abierto)}
            className="h-10 shrink-0 rounded-full px-4 text-sm font-medium text-tinta underline decoration-linea decoration-2 underline-offset-4 hover:decoration-tinta"
          >
            {marcasAbiertas ? 'Ocultar marcas' : 'Elegir marcas'}
          </button>
        )}
      </div>

      {marcasAbiertas && !lockedBrand && (
        <div className="mt-3 rounded-[20px] bg-white p-3 ring-1 ring-inset ring-linea sm:p-4">
          {marcasDisponibles.length === 0 ? (
            <p className="px-2 py-1 text-sm text-pizarra">Cargando marcas</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {marcasDisponibles.map(([marca, cantidadMarca]) => {
                const activa = marcas.some((m) => normalizarTexto(m) === normalizarTexto(marca));
                return (
                  <button
                    key={marca}
                    type="button"
                    aria-pressed={activa}
                    onClick={() => alternarMarca(marca)}
                    className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm transition-colors ${
                      activa ? 'bg-vidrio text-cobalto-hondo' : 'text-tinta hover:bg-papel'
                    }`}
                  >
                    {activa && <Check size={14} aria-hidden />}
                    {nombreMarca(marca)}
                    <span className="tabular-nums text-pizarra">{cantidadMarca}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {marcas.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {marcas.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => alternarMarca(m)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-vidrio px-3.5 text-sm font-medium text-cobalto-hondo hover:bg-[#dbe3ff]"
            >
              {nombreMarca(m)}
              <X size={14} aria-hidden />
              <span className="sr-only">Quitar {nombreMarca(m)}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-linea pt-4 text-sm text-pizarra">
        <p aria-live="polite" className="tabular-nums">
          {estado === 'listo'
            ? `${filtrados.length.toLocaleString('es-UY')} ${filtrados.length === 1 ? 'producto' : 'productos'}`
            : 'Cargando catálogo'}
        </p>
        {hayFiltros && (
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={copiarEnlace}
              className="inline-flex items-center gap-1.5 font-medium text-tinta hover:text-[var(--acento)]"
            >
              <Link2 size={16} aria-hidden />
              {copiado ? 'Enlace copiado' : 'Copiar enlace'}
            </button>
            <button type="button" onClick={quitarFiltros} className="font-medium text-tinta hover:text-[var(--acento)]">
              Quitar filtros
            </button>
          </div>
        )}
      </div>

      {estado === 'cargando' && <Esqueleto />}

      {estado === 'error' && (
        <div className="mt-10 rounded-[20px] bg-white px-6 py-12 text-center ring-1 ring-inset ring-linea">
          <p className="font-medium text-tinta">No se pudo cargar el catálogo.</p>
          <p className="mt-1 text-sm text-pizarra">Revisá la conexión y probá de nuevo.</p>
          <button type="button" onClick={reintentar} className="btn-primary mt-6">
            Reintentar
          </button>
        </div>
      )}

      {estado === 'listo' && filtrados.length === 0 && (
        <div className="mt-10 rounded-[20px] bg-white px-6 py-12 text-center ring-1 ring-inset ring-linea">
          <p className="font-medium text-tinta">No hay productos con esos filtros.</p>
          <p className="mt-1 text-sm text-pizarra">Probá con otra marca, o buscá por el código del modelo.</p>
          <button type="button" onClick={quitarFiltros} className="btn-primary mt-6">
            Ver todo el catálogo
          </button>
        </div>
      )}

      {estado === 'listo' && filtrados.length > 0 && (
        <>
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
            {filtrados.slice(0, cantidad).map((p) => (
              <li key={p.id}>
                <ProductCard
                  product={p}
                  esNuevo={p.stock_visible && p.id >= idMinimoNuevo && Boolean(p.imagen_url?.startsWith('/armazones/'))}
                />
              </li>
            ))}
          </ul>
          {faltan > 0 && (
            <div className="mt-14 flex flex-col items-center gap-3">
              <button type="button" onClick={() => setCantidad((n) => n + POR_TANDA)} className="btn-outline">
                Ver {Math.min(POR_TANDA, faltan)} más
              </button>
              <p className="text-sm tabular-nums text-pizarra">
                {cantidad.toLocaleString('es-UY')} de {filtrados.length.toLocaleString('es-UY')}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function CatalogSection({ lockedBrand, title }: { lockedBrand?: string; title?: string }) {
  return (
    // La sección y su título se dibujan en el servidor (fuera del Suspense):
    // antes todo el catálogo existía solo después de cargar JavaScript, así
    // que un link con #catalogo no encontraba adónde bajar y quedaba arriba.
    <section
      id="catalogo"
      className="bg-papel py-20 md:py-28"
      style={lockedBrand ? ({ '--acento': '#c0203a' } as React.CSSProperties) : undefined}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="titular max-w-[22ch] text-3xl text-tinta md:text-5xl">{title ?? 'Armazones y lentes'}</h2>
        <p className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-pizarra">
          {lockedBrand
            ? `Los modelos de ${nombreMarca(lockedBrand)} que tenemos hoy en la óptica.`
            : 'Lo que tenemos hoy en Las Piedras y Canelones, con el precio a la vista. Agregá lo que te guste al carrito y lo confirmamos por WhatsApp.'}
        </p>
        <Suspense fallback={<Esqueleto />}>
          <CatalogoInteractivo lockedBrand={lockedBrand} />
        </Suspense>
      </div>
    </section>
  );
}

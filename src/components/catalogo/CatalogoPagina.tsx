'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Link2, Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { useCatalogo } from '@/lib/useCatalogo';
import { CATEGORIAS, formatearPrecio, nombreMarca, normalizarTexto, type Producto } from '@/lib/catalogoTipos';
import {
  ORDENES,
  filtrosDesdeUrl,
  filtrosVacios,
  marcaDesdeSlug,
  slugsDeMarca,
  tituloCatalogo,
  urlDesdeFiltros,
  type FiltrosCatalogo,
  type Orden,
} from '@/lib/catalogoRutas';

const POR_TANDA = 24;
const CANTIDAD_NUEVOS = 24;

const INTRO: Record<string, string> = {
  todo: 'Armazones de receta, lentes de sol, lentes de contacto y accesorios que tenemos hoy en Las Piedras y Canelones, con el precio final en pesos. Agregá lo que te guste al carrito y lo confirmamos por WhatsApp.',
  'Armazones de Receta': 'Armazones de receta de Ninety, Viky, Santorino, Alma Santa, Ray-Ban y otras marcas. Traé tu receta y armamos los cristales en nuestro taller propio.',
  'Lentes de Sol': 'Lentes de sol de Ray-Ban, Vogue, Shadow, Gasoil y más, con modelos polarizados para adultos y niños.',
  'Lentes de Contacto': 'Lentes de contacto Alcon y CooperVision, y líquidos Clarus y Avizor para cuidarlos. Elegí la graduación y confirmamos stock por WhatsApp.',
  Accesorios: 'Cadenas, líquido limpia cristales, plaquetas y micro soldadura para tus lentes.',
};

function enOracion(texto: string) {
  return texto.charAt(0) + texto.slice(1).toLowerCase();
}

function ordenar(lista: Producto[], orden: Orden) {
  const agotadoAlFinal = (p: Producto) => (p.stock_visible ? 0 : 1);
  const criterio: Record<Orden, (a: Producto, b: Producto) => number> = {
    recientes: () => 0,
    vendidos: (a, b) => Number(b.mas_vendido) - Number(a.mas_vendido),
    precio_asc: (a, b) => a.precio - b.precio,
    precio_desc: (a, b) => b.precio - a.precio,
  };
  // id más alto = cargado más tarde en el programa
  return [...lista].sort((a, b) => agotadoAlFinal(a) - agotadoAlFinal(b) || criterio[orden](a, b) || b.id - a.id);
}

function segmentosDeLaUbicacion() {
  return window.location.pathname
    .replace(/^\/catalogo\/?/, '')
    .split('/')
    .filter(Boolean);
}

function Casilla({ marcada }: { marcada: boolean }) {
  return (
    <span
      aria-hidden
      className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] transition-colors ${
        marcada ? 'bg-cobalto text-white' : 'bg-white ring-1 ring-inset ring-[#c5cad6]'
      }`}
    >
      {marcada && <Check size={13} strokeWidth={3} />}
    </span>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-linea py-6 first:pt-0 last:border-b-0">
      <h2 className="text-[15px] font-semibold text-tinta">{titulo}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function CatalogoPagina({ segmentos }: { segmentos: string[] }) {
  const { productos, estado, reintentar } = useCatalogo();

  // Lo que viene en la ruta se conoce desde el servidor; los ?parámetros se
  // leen apenas carga la página.
  const [f, setF] = useState<FiltrosCatalogo>(() => filtrosDesdeUrl(segmentos));
  const [urlLeida, setUrlLeida] = useState(false);
  const [cantidad, setCantidad] = useState(POR_TANDA);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [buscaMarca, setBuscaMarca] = useState('');
  const [precioDesde, setPrecioDesde] = useState('');
  const [precioHasta, setPrecioHasta] = useState('');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const desdeUrl = () => {
      const leidos = filtrosDesdeUrl(segmentosDeLaUbicacion(), new URLSearchParams(window.location.search));
      setF(leidos);
      setPrecioDesde(leidos.desde ? String(leidos.desde) : '');
      setPrecioHasta(leidos.hasta ? String(leidos.hasta) : '');
    };
    desdeUrl();
    setUrlLeida(true);
    window.addEventListener('popstate', desdeUrl);
    return () => window.removeEventListener('popstate', desdeUrl);
  }, []);

  // La dirección acompaña a los filtros, para que "Copiar enlace" (o copiar la
  // barra del navegador) siempre abra exactamente lo mismo. Al cargar no se toca.
  const yaSincronizo = useRef(false);
  useEffect(() => {
    if (!urlLeida) return;
    if (!yaSincronizo.current) {
      yaSincronizo.current = true;
      return;
    }
    const destino = urlDesdeFiltros(f);
    if (destino !== window.location.pathname + window.location.search) {
      window.history.replaceState(null, '', destino);
    }
  }, [f, urlLeida]);

  useEffect(() => {
    setCantidad(POR_TANDA);
  }, [f]);

  useEffect(() => {
    document.body.style.overflow = panelAbierto ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [panelAbierto]);

  const cambiar = (cambios: Partial<FiltrosCatalogo>) => setF((previo) => ({ ...previo, ...cambios }));

  // --- Coincidencias (cada contador ignora su propio filtro, como en cualquier tienda) ---
  const palabras = useMemo(() => normalizarTexto(f.texto).split(' ').filter(Boolean), [f.texto]);
  const pasa = useMemo(() => {
    const marcas = new Set(f.marcas);
    const categoria = f.categoria ? normalizarTexto(f.categoria) : null;
    return {
      categoria: (p: Producto) => !categoria || normalizarTexto(p.categoria) === categoria,
      marca: (p: Producto) => marcas.size === 0 || slugsDeMarca(p.marca).some((s) => marcas.has(s)),
      texto: (p: Producto) =>
        palabras.length === 0 ||
        palabras.every((w) => normalizarTexto(`${p.marca} ${nombreMarca(p.marca)} ${p.modelo}`).includes(w)),
      precio: (p: Producto) => (f.desde == null || p.precio >= f.desde) && (f.hasta == null || p.precio <= f.hasta),
      stock: (p: Producto) => !f.ocultarAgotados || p.stock_visible,
    };
  }, [f, palabras]);

  const filtrados = useMemo(
    () =>
      ordenar(
        productos.filter((p) => pasa.categoria(p) && pasa.marca(p) && pasa.texto(p) && pasa.precio(p) && pasa.stock(p)),
        f.orden
      ),
    [productos, pasa, f.orden]
  );

  const conteoCategorias = useMemo(() => {
    const conteo = new Map<string, number>();
    let total = 0;
    for (const p of productos) {
      if (!(pasa.marca(p) && pasa.texto(p) && pasa.precio(p) && pasa.stock(p))) continue;
      total++;
      const c = CATEGORIAS.find((cat) => normalizarTexto(cat) === normalizarTexto(p.categoria));
      if (c) conteo.set(c, (conteo.get(c) ?? 0) + 1);
    }
    return { conteo, total };
  }, [productos, pasa]);

  const marcasDisponibles = useMemo(() => {
    const porSlug = new Map<string, { nombre: string; cantidad: number }>();
    for (const p of productos) {
      if (!(pasa.categoria(p) && pasa.texto(p) && pasa.precio(p) && pasa.stock(p))) continue;
      const slug = slugsDeMarca(p.marca)[0];
      const actual = porSlug.get(slug);
      if (actual) actual.cantidad++;
      else porSlug.set(slug, { nombre: nombreMarca(p.marca), cantidad: 1 });
    }
    for (const slug of f.marcas) {
      if (!porSlug.has(slug)) {
        const p = productos.find((x) => slugsDeMarca(x.marca).includes(slug));
        porSlug.set(slug, { nombre: p ? nombreMarca(p.marca) : slug, cantidad: 0 });
      }
    }
    return [...porSlug.entries()].sort((a, b) => a[1].nombre.localeCompare(b[1].nombre, 'es'));
  }, [productos, pasa, f.marcas]);

  const nombreDeMarca = (slug: string) => {
    const p = productos.find((x) => slugsDeMarca(x.marca).includes(slug));
    return p ? nombreMarca(p.marca) : undefined;
  };

  const idMinimoNuevo = useMemo(() => {
    const ids = productos
      .filter((p) => p.stock_visible && p.imagen_url?.startsWith('/armazones/'))
      .map((p) => p.id)
      .sort((a, b) => b - a);
    return ids.length ? ids[Math.min(CANTIDAD_NUEVOS, ids.length) - 1] : Infinity;
  }, [productos]);

  const rangoPrecios = useMemo(() => {
    if (!productos.length) return null;
    const precios = productos.map((p) => p.precio);
    return { min: Math.min(...precios), max: Math.max(...precios) };
  }, [productos]);

  const { titulo, subtitulo } = tituloCatalogo(f, nombreDeMarca);
  const intro = INTRO[f.categoria ?? 'todo'] ?? INTRO.todo;

  const alternarMarca = (slug: string) =>
    cambiar({ marcas: f.marcas.includes(slug) ? f.marcas.filter((m) => m !== slug) : [...f.marcas, slug] });

  const aplicarPrecio = (e?: React.FormEvent) => {
    e?.preventDefault();
    const desde = Number(precioDesde.replace(/\D/g, '')) || null;
    const hasta = Number(precioHasta.replace(/\D/g, '')) || null;
    cambiar({ desde, hasta });
  };

  const quitarTodo = () => {
    setPrecioDesde('');
    setPrecioHasta('');
    setBuscaMarca('');
    setF({ ...filtrosVacios(), orden: f.orden });
  };

  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + urlDesdeFiltros(f));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // sin permiso de portapapeles: el link igual está en la barra de direcciones
    }
  };

  const activos =
    (f.categoria ? 1 : 0) + f.marcas.length + (f.texto.trim() ? 1 : 0) + (f.desde != null || f.hasta != null ? 1 : 0) + (f.ocultarAgotados ? 1 : 0);
  const faltan = filtrados.length - cantidad;
  const marcasVisibles = buscaMarca.trim()
    ? marcasDisponibles.filter(([, m]) => normalizarTexto(m.nombre).includes(normalizarTexto(buscaMarca)))
    : marcasDisponibles;

  const panel = (
    <>
      <Grupo titulo="Buscar">
        <label className="relative block">
          <span className="sr-only">Buscar por marca o modelo</span>
          <Search size={17} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-pizarra" />
          <input
            type="search"
            value={f.texto}
            onChange={(e) => cambiar({ texto: e.target.value })}
            placeholder="Marca o código del modelo"
            className="h-11 w-full rounded-xl border border-linea bg-white pl-10 pr-3 text-[15px] text-tinta placeholder:text-pizarra focus:border-cobalto focus:outline-none focus:ring-2 focus:ring-cobalto/15"
          />
        </label>
      </Grupo>

      <Grupo titulo="Categoría">
        <ul className="space-y-0.5">
          <li>
            <button
              type="button"
              onClick={() => cambiar({ categoria: null })}
              className={`flex w-full items-center justify-between rounded-lg py-1.5 text-left text-[15px] ${
                !f.categoria ? 'font-semibold text-cobalto' : 'text-tinta/80 hover:text-tinta'
              }`}
            >
              Todo
              <span className="text-sm font-normal tabular-nums text-pizarra">{conteoCategorias.total || ''}</span>
            </button>
          </li>
          {CATEGORIAS.map((c) => (
            <li key={c}>
              <button
                type="button"
                onClick={() => cambiar({ categoria: c })}
                className={`flex w-full items-center justify-between rounded-lg py-1.5 text-left text-[15px] ${
                  f.categoria === c ? 'font-semibold text-cobalto' : 'text-tinta/80 hover:text-tinta'
                }`}
              >
                {enOracion(c)}
                <span className="text-sm font-normal tabular-nums text-pizarra">{conteoCategorias.conteo.get(c) ?? 0}</span>
              </button>
            </li>
          ))}
        </ul>
      </Grupo>

      <Grupo titulo="Precio en pesos">
        <form onSubmit={aplicarPrecio} className="flex items-center gap-2">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Precio desde</span>
            <input
              inputMode="numeric"
              value={precioDesde}
              onChange={(e) => setPrecioDesde(e.target.value)}
              placeholder={rangoPrecios ? `Desde ${rangoPrecios.min}` : 'Desde'}
              className="h-11 w-full rounded-xl border border-linea bg-white px-3 text-[15px] tabular-nums text-tinta placeholder:text-pizarra focus:border-cobalto focus:outline-none focus:ring-2 focus:ring-cobalto/15"
            />
          </label>
          <span aria-hidden className="text-pizarra">-</span>
          <label className="min-w-0 flex-1">
            <span className="sr-only">Precio hasta</span>
            <input
              inputMode="numeric"
              value={precioHasta}
              onChange={(e) => setPrecioHasta(e.target.value)}
              placeholder={rangoPrecios ? `Hasta ${rangoPrecios.max}` : 'Hasta'}
              className="h-11 w-full rounded-xl border border-linea bg-white px-3 text-[15px] tabular-nums text-tinta placeholder:text-pizarra focus:border-cobalto focus:outline-none focus:ring-2 focus:ring-cobalto/15"
            />
          </label>
          <button type="submit" className="h-11 shrink-0 rounded-xl bg-tinta px-3.5 text-sm font-semibold text-white hover:bg-cobalto">
            Aplicar
          </button>
        </form>
      </Grupo>

      <Grupo titulo="Marcas">
        {marcasDisponibles.length > 12 && (
          <label className="mb-3 block">
            <span className="sr-only">Buscar una marca</span>
            <input
              value={buscaMarca}
              onChange={(e) => setBuscaMarca(e.target.value)}
              placeholder="Buscar marca"
              className="h-10 w-full rounded-lg border border-linea bg-white px-3 text-sm text-tinta placeholder:text-pizarra focus:border-cobalto focus:outline-none"
            />
          </label>
        )}
        {estado === 'cargando' ? (
          <p className="text-sm text-pizarra">Cargando marcas</p>
        ) : (
          <ul className="space-y-0.5">
            {marcasVisibles.map(([slug, marca]) => {
              const marcada = f.marcas.includes(slug);
              return (
                <li key={slug}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={marcada}
                    onClick={() => alternarMarca(slug)}
                    className="flex w-full items-center gap-3 rounded-lg py-1.5 text-left text-[15px] text-tinta/85 hover:text-tinta"
                  >
                    <Casilla marcada={marcada} />
                    <span className="min-w-0 flex-1 truncate">{marca.nombre}</span>
                    <span className="text-sm tabular-nums text-pizarra">{marca.cantidad}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Grupo>

      <Grupo titulo="Disponibilidad">
        <button
          type="button"
          role="checkbox"
          aria-checked={f.ocultarAgotados}
          onClick={() => cambiar({ ocultarAgotados: !f.ocultarAgotados })}
          className="flex w-full items-center gap-3 py-1.5 text-left text-[15px] text-tinta/85 hover:text-tinta"
        >
          <Casilla marcada={f.ocultarAgotados} />
          Solo con stock
        </button>
      </Grupo>
    </>
  );

  return (
    <div className="bg-white">
      {/* Encabezado con la pared de armazones del local */}
      <section className="relative isolate overflow-hidden bg-tinta pt-[72px]">
        <Image
          src="/media/local/pared-armazones.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-center opacity-50"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-tinta/85 via-tinta/55 to-tinta/15" />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <nav aria-label="Ubicación" className="flex flex-wrap items-center gap-2 text-sm text-white/70">
            <Link href="/" className="hover:text-white">
              Inicio
            </Link>
            <span aria-hidden>/</span>
            <Link href="/catalogo" className="hover:text-white">
              Catálogo
            </Link>
            {f.categoria && (
              <>
                <span aria-hidden>/</span>
                <span className="text-white/90">{enOracion(f.categoria)}</span>
              </>
            )}
          </nav>
          <h1 className="titular mt-3 text-4xl text-white md:text-6xl">{titulo}</h1>
          {subtitulo && <p className="mt-2 text-lg text-white/80">{subtitulo}</p>}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <p className="max-w-3xl text-[17px] leading-relaxed text-pizarra">{intro}</p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[250px_1fr] xl:gap-14">
          <aside className="hidden lg:block" aria-label="Filtros">
            <div className="custom-scrollbar sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-3">{panel}</div>
          </aside>

          <div id="productos" className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-linea pb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPanelAbierto(true)}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-linea px-4 text-[15px] font-medium text-tinta lg:hidden"
                >
                  <SlidersHorizontal size={17} aria-hidden />
                  Filtrar{activos ? ` (${activos})` : ''}
                </button>
                <p aria-live="polite" className="text-sm tabular-nums text-pizarra">
                  {estado === 'listo'
                    ? `${filtrados.length.toLocaleString('es-UY')} ${filtrados.length === 1 ? 'artículo' : 'artículos'}`
                    : 'Cargando'}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm text-pizarra">
                <span className="hidden sm:inline">Ordenar por</span>
                <select
                  value={f.orden}
                  onChange={(e) => cambiar({ orden: e.target.value as Orden })}
                  className="h-11 rounded-xl border border-linea bg-white px-3 text-[15px] text-tinta focus:border-cobalto focus:outline-none"
                >
                  {Object.entries(ORDENES).map(([valor, etiqueta]) => (
                    <option key={valor} value={valor}>
                      {etiqueta}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {activos > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {f.categoria && (
                  <FiltroActivo onQuitar={() => cambiar({ categoria: null })}>{enOracion(f.categoria)}</FiltroActivo>
                )}
                {f.marcas.map((slug) => (
                  <FiltroActivo key={slug} onQuitar={() => alternarMarca(slug)}>
                    {nombreDeMarca(slug) ?? marcaDesdeSlug(slug)}
                  </FiltroActivo>
                ))}
                {f.texto.trim() && <FiltroActivo onQuitar={() => cambiar({ texto: '' })}>&ldquo;{f.texto.trim()}&rdquo;</FiltroActivo>}
                {(f.desde != null || f.hasta != null) && (
                  <FiltroActivo
                    onQuitar={() => {
                      setPrecioDesde('');
                      setPrecioHasta('');
                      cambiar({ desde: null, hasta: null });
                    }}
                  >
                    {f.desde != null ? formatearPrecio(f.desde) : 'Hasta'}
                    {f.desde != null && f.hasta != null ? ' a ' : ' '}
                    {f.hasta != null ? formatearPrecio(f.hasta) : 'o más'}
                  </FiltroActivo>
                )}
                {f.ocultarAgotados && <FiltroActivo onQuitar={() => cambiar({ ocultarAgotados: false })}>Solo con stock</FiltroActivo>}
                <button type="button" onClick={quitarTodo} className="ml-1 text-sm font-medium text-tinta underline underline-offset-4 hover:text-cobalto">
                  Quitar todo
                </button>
                <button
                  type="button"
                  onClick={copiarEnlace}
                  className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-tinta hover:text-cobalto"
                >
                  <Link2 size={16} aria-hidden />
                  {copiado ? 'Enlace copiado' : 'Copiar enlace'}
                </button>
              </div>
            )}

            {estado === 'cargando' && (
              <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3" aria-hidden>
                {Array.from({ length: 9 }, (_, i) => (
                  <div key={i}>
                    <div className="aspect-square animate-pulse rounded-2xl bg-papel" />
                    <div className="mt-4 h-3 w-1/3 animate-pulse rounded-full bg-papel" />
                    <div className="mt-2 h-4 w-2/3 animate-pulse rounded-full bg-papel" />
                  </div>
                ))}
              </div>
            )}

            {estado === 'error' && (
              <div className="mt-10 rounded-2xl bg-papel px-6 py-12 text-center">
                <p className="font-medium text-tinta">No se pudo cargar el catálogo.</p>
                <p className="mt-1 text-sm text-pizarra">Revisá la conexión y probá de nuevo.</p>
                <button type="button" onClick={reintentar} className="btn-primary mt-6">
                  Reintentar
                </button>
              </div>
            )}

            {estado === 'listo' && filtrados.length === 0 && (
              <div className="mt-10 rounded-2xl bg-papel px-6 py-12 text-center">
                <p className="font-medium text-tinta">No hay artículos con esos filtros.</p>
                <p className="mt-1 text-sm text-pizarra">Probá con otra marca o buscá por el código del modelo.</p>
                <button type="button" onClick={quitarTodo} className="btn-primary mt-6">
                  Ver todo el catálogo
                </button>
              </div>
            )}

            {estado === 'listo' && filtrados.length > 0 && (
              <>
                <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3">
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
                  <div className="mt-16 flex flex-col items-center gap-3">
                    <button type="button" onClick={() => setCantidad((n) => n + POR_TANDA)} className="btn-outline">
                      Ver más artículos
                    </button>
                    <p className="text-sm tabular-nums text-pizarra">
                      {cantidad.toLocaleString('es-UY')} de {filtrados.length.toLocaleString('es-UY')}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filtros en el celular */}
      {panelAbierto && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="animate-fade-in absolute inset-0 bg-tinta/40" onClick={() => setPanelAbierto(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filtros"
            className="mobile-menu-enter absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white"
          >
            <div className="flex h-16 items-center justify-between border-b border-linea px-5">
              <p className="text-lg font-semibold text-tinta">Filtrar</p>
              <button
                type="button"
                onClick={() => setPanelAbierto(false)}
                aria-label="Cerrar filtros"
                className="grid h-10 w-10 place-items-center rounded-full text-tinta hover:bg-papel"
              >
                <X size={22} aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">{panel}</div>
            <div className="flex gap-3 border-t border-linea p-4">
              <button type="button" onClick={quitarTodo} className="btn-outline flex-1">
                Quitar todo
              </button>
              <button type="button" onClick={() => setPanelAbierto(false)} className="btn-cta flex-1">
                Ver {filtrados.length.toLocaleString('es-UY')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FiltroActivo({ children, onQuitar }: { children: React.ReactNode; onQuitar: () => void }) {
  return (
    <button
      type="button"
      onClick={onQuitar}
      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-vidrio px-3.5 text-sm font-medium text-cobalto-hondo hover:bg-[#dbe3ff]"
    >
      {children}
      <X size={14} aria-hidden />
      <span className="sr-only">Quitar filtro</span>
    </button>
  );
}

'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Check, Glasses, ShoppingBag, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatearPrecio, nombreMarca, type Producto } from '@/lib/catalogoTipos';

// Se muestra si la foto no carga (por ejemplo, un armazón recién cargado en
// el programa cuya foto todavía no se publicó en la web), en lugar del ícono
// de imagen rota del navegador.
function FotoPendiente({ grande = false }: { grande?: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-linea">
      <Glasses size={grande ? 72 : 44} strokeWidth={1.25} aria-hidden />
      <span className={`text-pizarra ${grande ? 'text-sm' : 'text-xs'}`}>Foto próximamente</span>
    </div>
  );
}

function pasos(desde: number, hasta: number, paso: number) {
  const valores: string[] = [];
  for (let v = desde; v <= hasta + 1e-9; v += paso) {
    valores.push(v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2));
  }
  return valores;
}

const ESFERICOS_ASTIGMATISMO = [...pasos(-6, -0.25, 0.25), ...pasos(0.25, 6, 0.25)];
const CILINDRICOS = ['-0.75', '-1.25', '-1.75', '-2.25'];
const EJES = Array.from({ length: 18 }, (_, i) => String((i + 1) * 10));
const GRADUACIONES = [...pasos(-12, -0.25, 0.25), ...pasos(0.25, 8, 0.25)];

function Selector({
  id,
  etiqueta,
  valor,
  opciones,
  onChange,
}: {
  id: string;
  etiqueta: string;
  valor: string;
  opciones: string[];
  onChange: (valor: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-tinta">
        {etiqueta}
      </label>
      <select
        id={id}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-xl border border-linea bg-white px-4 text-tinta focus:border-cobalto focus:outline-none focus:ring-2 focus:ring-cobalto/15"
      >
        <option value="">Elegir</option>
        {opciones.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function ProductCard({ product, esNuevo = false }: { product: Producto; esNuevo?: boolean }) {
  const { addToCart } = useCart();
  const [agregado, setAgregado] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [fotoFallo, setFotoFallo] = useState(false);
  const [zoom, setZoom] = useState(false);

  const [esferico, setEsferico] = useState('');
  const [cilindrico, setCilindrico] = useState('');
  const [eje, setEje] = useState('');
  const [graduacion, setGraduacion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [errorOpciones, setErrorOpciones] = useState('');

  const modeloMinusculas = product.modelo.toLowerCase();
  const esLiquido = ['alvera', 'clarus', 'liquido'].some((p) => modeloMinusculas.includes(p));
  const esLenteContacto = product.categoria.toLowerCase() === 'lentes de contacto' && !esLiquido;
  const esAstigmatismo = esLenteContacto && modeloMinusculas.includes('astigmatismo');
  const agotado = !product.stock_visible;

  const marca = nombreMarca(product.marca);
  const nombre = `${marca} ${product.modelo}`;
  const precio = formatearPrecio(product.precio);
  const precioAnterior = product.precio_original ? formatearPrecio(product.precio_original) : null;
  const foto = product.imagen_url || '/promoxplus.png';

  const etiqueta = precioAnterior
    ? { texto: 'Oferta', clase: 'bg-cobalto text-white' }
    : agotado
      ? { texto: 'Agotado', clase: 'bg-papel text-pizarra' }
      : esNuevo
        ? { texto: 'Nuevo', clase: 'bg-cobalto text-white' }
        : product.mas_vendido
          ? { texto: 'Más vendido', clase: 'bg-tinta text-white' }
          : null;

  const agregar = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (agotado) return;

    let opciones = '';
    if (esLenteContacto) {
      if (esAstigmatismo) {
        if (!esferico || !cilindrico || !eje) {
          setErrorOpciones('Elegí el valor esférico, el cilíndrico y el eje.');
          return;
        }
        opciones = `Esf: ${esferico}, Cil: ${cilindrico}, Eje: ${eje}`;
        if (mensaje) opciones += ` | Nota: ${mensaje}`;
      } else {
        if (!graduacion) {
          setErrorOpciones('Elegí la graduación.');
          return;
        }
        opciones = `Graduación: ${graduacion}`;
      }
    }

    addToCart({
      id: product.id,
      modelo: product.modelo,
      marca: product.marca,
      precio: product.precio,
      imagen_url: product.imagen_url ?? '',
      ...(opciones ? { opciones } : {}),
    });
    setAgregado(true);
    setAbierto(false);
    setTimeout(() => setAgregado(false), 1500);
  };

  const abrir = () => {
    setEsferico('');
    setCilindrico('');
    setEje('');
    setGraduacion('');
    setMensaje('');
    setErrorOpciones('');
    setZoom(false);
    setAbierto(true);
  };

  useEffect(() => {
    if (!abierto) return;
    document.body.style.overflow = 'hidden';
    const alTeclear = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false);
    window.addEventListener('keydown', alTeclear);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', alTeclear);
    };
  }, [abierto]);

  // El punto del zoom va en variables CSS del propio elemento: seguir el mouse
  // con useState redibujaría la tarjeta en cada movimiento.
  const moverZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    const caja = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--zx', `${((e.clientX - caja.left) / caja.width) * 100}%`);
    e.currentTarget.style.setProperty('--zy', `${((e.clientY - caja.top) / caja.height) * 100}%`);
  };

  return (
    <article className="group">
      <button
        type="button"
        onClick={abrir}
        className="relative block aspect-square w-full overflow-hidden rounded-2xl bg-white ring-1 ring-inset ring-transparent transition-shadow hover:ring-cobalto/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--acento)]"
      >
        {fotoFallo ? (
          <FotoPendiente />
        ) : (
          <Image
            src={foto}
            alt={nombre}
            fill
            // Las fotos de armazones ya vienen optimizadas y con el fondo en
            // blanco desde el disco (publicar_fotos_armazones.py +
            // blanquear_fondo.py), así que no hace falta que Vercel las
            // transforme: son +1100 fotos y cada una consumía cuota.
            unoptimized
            onError={() => setFotoFallo(true)}
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className={`object-contain transition-transform duration-300 ease-out group-hover:scale-[1.03] ${
              agotado ? 'opacity-50 grayscale' : ''
            }`}
          />
        )}
        {etiqueta && (
          <span className={`absolute left-3 top-3 rounded-md px-2 py-1 text-[12px] font-semibold leading-none ${etiqueta.clase}`}>
            {etiqueta.texto}
          </span>
        )}
      </button>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] text-pizarra">{marca}</p>
          <h3 className="truncate text-[15px] font-medium text-tinta">{product.modelo}</h3>
        </div>
        <p className="shrink-0 text-right text-[17px] font-semibold tabular-nums text-tinta">
          {precioAnterior && <s className="mr-1.5 block text-[13px] font-normal text-pizarra sm:inline">{precioAnterior}</s>}
          {precio}
        </p>
      </div>

      {esLenteContacto ? (
        <button type="button" onClick={abrir} className="mt-2 text-sm font-semibold text-cobalto hover:underline">
          Elegir graduación
        </button>
      ) : (
        <button
          type="button"
          onClick={agregar}
          disabled={agotado}
          aria-label={agotado ? `${nombre}: agotado` : `Agregar ${nombre} al carrito`}
          className={`mt-2 inline-flex items-center gap-2 text-sm font-semibold ${
            agotado ? 'cursor-not-allowed text-pizarra' : 'text-cobalto hover:underline'
          }`}
        >
          {agregado ? <Check size={16} aria-hidden /> : <ShoppingBag size={16} aria-hidden />}
          {agotado ? 'Agotado' : agregado ? 'Agregado al carrito' : 'Agregar al carrito'}
        </button>
      )}

      {abierto && (
        <div
          className="animate-fade-in fixed inset-0 z-[100] flex items-end justify-center bg-tinta/60 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={() => setAbierto(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={nombre}
            onClick={(e) => e.stopPropagation()}
            className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white sm:rounded-[28px] ${
              esLenteContacto ? 'sm:max-w-5xl' : 'sm:max-w-3xl'
            }`}
          >
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar"
              className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full bg-papel text-tinta hover:bg-linea"
            >
              <X size={20} aria-hidden />
            </button>

            <div className={`overflow-y-auto ${esLenteContacto ? 'md:grid md:grid-cols-2' : ''}`}>
              <div>
                <div
                  className={`relative mx-auto aspect-square w-full max-w-[min(100%,58vh)] select-none overflow-hidden bg-white ${zoom ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                  onMouseMove={moverZoom}
                  onClick={() => setZoom((z) => !z)}
                >
                  {fotoFallo ? (
                    <FotoPendiente grande />
                  ) : (
                    <Image
                      src={foto}
                      alt={nombre}
                      fill
                      unoptimized
                      onError={() => setFotoFallo(true)}
                      sizes="(max-width: 1024px) 100vw, 768px"
                      className="object-contain transition-transform duration-150 ease-out"
                      style={{
                        transform: zoom ? 'scale(2.5)' : 'scale(1)',
                        transformOrigin: 'var(--zx, 50%) var(--zy, 50%)',
                      }}
                    />
                  )}
                </div>

                <div className="border-t border-linea p-6 sm:p-8">
                  <p className="text-sm text-pizarra">{marca}</p>
                  <h2 className="titular mt-1 text-2xl text-tinta sm:text-3xl">{product.modelo}</h2>
                  {!esLenteContacto && (
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                      <p className="text-2xl font-semibold tabular-nums text-tinta">
                        {precioAnterior && <s className="mr-3 text-lg font-normal text-pizarra">{precioAnterior}</s>}
                        {precio}
                      </p>
                      <button type="button" onClick={agregar} disabled={agotado} className="btn-cta">
                        {agotado ? 'Agotado' : 'Agregar al carrito'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {esLenteContacto && (
                <div className="flex flex-col border-t border-linea p-6 sm:p-8 md:border-l md:border-t-0">
                  <p className="text-2xl font-semibold tabular-nums text-tinta">
                    {precioAnterior && <s className="mr-3 text-lg font-normal text-pizarra">{precioAnterior}</s>}
                    {precio}
                  </p>

                  <div className="mt-6 flex flex-col gap-5">
                    {esAstigmatismo ? (
                      <>
                        <Selector id={`esf-${product.id}`} etiqueta="Valor esférico" valor={esferico} opciones={ESFERICOS_ASTIGMATISMO} onChange={setEsferico} />
                        <Selector id={`cil-${product.id}`} etiqueta="Valor cilíndrico" valor={cilindrico} opciones={CILINDRICOS} onChange={setCilindrico} />
                        <Selector id={`eje-${product.id}`} etiqueta="Eje" valor={eje} opciones={EJES} onChange={setEje} />
                        <div className="flex flex-col gap-2">
                          <label htmlFor={`nota-${product.id}`} className="text-sm font-medium text-tinta">
                            Nota (opcional)
                          </label>
                          <textarea
                            id={`nota-${product.id}`}
                            value={mensaje}
                            onChange={(e) => setMensaje(e.target.value)}
                            maxLength={500}
                            rows={3}
                            className="resize-none rounded-xl border border-linea px-4 py-3 text-tinta focus:border-cobalto focus:outline-none focus:ring-2 focus:ring-cobalto/15"
                          />
                          <p className="text-sm text-pizarra">Si no entendés bien tu receta, contanos acá y te ayudamos.</p>
                        </div>
                      </>
                    ) : (
                      <Selector id={`grad-${product.id}`} etiqueta="Graduación" valor={graduacion} opciones={GRADUACIONES} onChange={setGraduacion} />
                    )}
                  </div>

                  {errorOpciones && (
                    <p role="alert" className="mt-4 text-sm font-medium text-[#b42318]">
                      {errorOpciones}
                    </p>
                  )}

                  <button type="button" onClick={agregar} className="btn-cta mt-8 w-full">
                    Agregar al carrito
                  </button>
                  <p className="mt-3 text-center text-sm text-pizarra">
                    Desde el carrito nos mandás el pedido por WhatsApp y confirmamos stock y graduación.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

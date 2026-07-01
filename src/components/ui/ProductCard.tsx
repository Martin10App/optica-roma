'use client';

import Image from 'next/image';
import { ShoppingCart, Eye, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';

interface Product {
  id: number;
  modelo: string;
  marca: string;
  categoria: string;
  precio: number;
  precio_original?: number | string | null;
  imagen_url: string;
  stock_visible?: boolean;
  mas_vendido?: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formattedPrice = new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    minimumFractionDigits: 0,
  }).format(Number(product.precio));

  const formattedOriginalPrice = product.precio_original
    ? new Intl.NumberFormat('es-UY', {
        style: 'currency',
        currency: 'UYU',
        minimumFractionDigits: 0,
      }).format(Number(product.precio_original))
    : null;

  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const isLiquid = product.modelo.toLowerCase().includes('alvera') || product.modelo.toLowerCase().includes('clarus') || product.modelo.toLowerCase().includes('liquido');
  const isLenteContacto = product.categoria.toLowerCase() === 'lentes de contacto' && !isLiquid;
  const isAstigmatismo = isLenteContacto && product.modelo.toLowerCase().includes('astigmatismo');
  
  const [esferico, setEsferico] = useState('');
  const [cilindrico, setCilindrico] = useState('');
  const [eje, setEje] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [graduacion, setGraduacion] = useState('');

  const generateSteps = (min: number, max: number, step: number) => {
    const steps = [];
    for (let i = min; i <= max; i += step) {
      if (i > 0) steps.push('+' + i.toFixed(2));
      else steps.push(i.toFixed(2));
    }
    return steps;
  };

  const astigEsf = [...generateSteps(-6, -0.25, 0.25), ...generateSteps(0.25, 6, 0.25)];
  const astigCil = ['-0.75', '-1.25', '-1.75', '-2.25'];
  const ejes = Array.from({length: 18}, (_, i) => (i + 1) * 10);
  const normalEsf = [...generateSteps(-12, -0.25, 0.25), ...generateSteps(0.25, 8, 0.25)];

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (product.stock_visible === false) return;

    let opcionesText = '';
    if (isLenteContacto) {
      if (isAstigmatismo) {
        if (!esferico || !cilindrico || !eje) {
          alert('Por favor selecciona todos los valores (Esférico, Cilíndrico y Eje).');
          return;
        }
        opcionesText = `Esf: ${esferico}, Cil: ${cilindrico}, Eje: ${eje}`;
        if (mensaje) opcionesText += ` | Nota: ${mensaje}`;
      } else {
        if (!graduacion) {
          alert('Por favor selecciona la graduación.');
          return;
        }
        opcionesText = `Graduación: ${graduacion}`;
      }
    }

    addToCart({
      id: product.id,
      modelo: product.modelo,
      marca: product.marca,
      precio: product.precio,
      imagen_url: product.imagen_url,
      ...(opcionesText ? { opciones: opcionesText } : {})
    });
    setAdded(true);
    if (isModalOpen) setIsModalOpen(false);
    setTimeout(() => setAdded(false), 1500);
  };

  const toggleModal = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsModalOpen(!isModalOpen);
    setIsZoomed(false); // Reset zoom when closing modal
    if (!isModalOpen) {
      // Reset options when opening
      setEsferico('');
      setCilindrico('');
      setEje('');
      setMensaje('');
      setGraduacion('');
    }
  };

  // Prevenir scroll cuando el modal está abierto
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  return (
    <>
      <div className="group card flex flex-col h-full overflow-hidden bg-white border border-slate-200 cursor-pointer hover:shadow-lg transition-shadow" onClick={toggleModal}>
        {/* Image Container */}
        <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden flex-shrink-0">
          {/* Urgency Badge */}
          {product.precio_original ? (
            <div className="absolute top-3 left-3 z-10 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md border border-indigo-200 shadow-sm animate-pulse-slow">
              🏷️ En Oferta
            </div>
          ) : product.stock_visible === false ? (
            <div className="absolute top-3 left-3 z-10 bg-red-50 text-red-700 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md border border-red-200">
              🔴 Agotado
            </div>
          ) : product.mas_vendido === true ? (
            <div className="absolute top-3 left-3 z-10 bg-amber-50 text-amber-700 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md border border-amber-200">
              🔥 Más vendido
            </div>
          ) : null}

          <Image
            src={product.imagen_url || '/promoxplus.png'}
            alt={`${product.marca} ${product.modelo}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={`object-contain p-6 transition-transform duration-500 group-hover:scale-105 ${product.stock_visible === false ? 'opacity-50 grayscale' : ''}`}
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <button
              onClick={toggleModal}
              className="flex items-center justify-center w-10 h-10 rounded-full text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors shadow-sm"
              title="Ver imagen"
            >
              <Eye size={18} />
            </button>
            {!isLenteContacto && (
              <button
                onClick={handleAddToCart}
                disabled={product.stock_visible === false}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-colors shadow-lg ${product.stock_visible === false ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'}`}
              >
                <ShoppingCart size={16} />
                Agregar
              </button>
            )}
          </div>

          {/* Category badge */}
          <div className="absolute top-3 right-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/90 border border-slate-200 text-slate-700 shadow-sm">
              {product.marca}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <p className="text-xs text-blue-700 font-semibold mb-1 uppercase tracking-wide">{product.categoria}</p>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 truncate group-hover:text-blue-700 transition-colors">
            {product.modelo}
          </h3>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex flex-col items-start leading-tight">
              {formattedOriginalPrice && (
                <span className="text-xs text-slate-400 line-through font-medium mb-0.5">
                  {formattedOriginalPrice}
                </span>
              )}
              <p className="text-lg font-bold text-slate-900">{formattedPrice}</p>
            </div>
            {!isLenteContacto ? (
              <button
                onClick={handleAddToCart}
                disabled={product.stock_visible === false}
                className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${
                  product.stock_visible === false
                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    : added
                    ? 'bg-green-500 text-white scale-95'
                    : 'bg-slate-100 text-slate-700 hover:bg-blue-700 hover:text-white'
                }`}
                aria-label="Añadir al carrito"
              >
                {added ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
              </button>
            ) : (
              <button
                onClick={toggleModal}
                className="text-xs font-bold text-blue-700 hover:underline"
              >
                Elegir graduación
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fade-in"
          onClick={toggleModal}
        >
          <div 
            className={`relative bg-white rounded-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in-up ${isLenteContacto ? 'max-w-5xl' : 'max-w-4xl'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={toggleModal}
              className="absolute top-4 right-4 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            >
              <X size={20} />
            </button>

            <div className={`flex flex-col ${isLenteContacto ? 'md:flex-row' : ''} h-full max-h-[90vh] overflow-y-auto custom-scrollbar`}>
              {/* Left Side: Image */}
              <div className={`flex flex-col ${isLenteContacto ? 'w-full md:w-1/2 border-r border-slate-100' : 'w-full'}`}>
                <div className="p-6 border-b border-slate-100 bg-white">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">{product.marca}</span>
                  <h2 className="text-2xl font-extrabold text-slate-900">{product.modelo}</h2>
                </div>
                <div 
                  className="relative flex-grow bg-slate-50 flex items-center justify-center min-h-[40vh] p-8 overflow-hidden select-none"
                  onMouseMove={handleMouseMove}
                  onClick={() => setIsZoomed(!isZoomed)}
                  style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
                >
                  <Image
                    src={product.imagen_url || '/promoxplus.png'}
                    alt={`${product.marca} ${product.modelo}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    className="object-contain p-4 transition-transform duration-100 ease-out"
                    style={{
                      transform: isZoomed ? 'scale(2.5)' : 'scale(1)',
                      transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                    }}
                  />
                </div>
                {!isLenteContacto && (
                  <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center">
                    <div className="flex flex-col leading-none">
                      {formattedOriginalPrice && (
                        <span className="text-sm text-slate-400 line-through font-medium mb-1">
                          {formattedOriginalPrice}
                        </span>
                      )}
                      <p className="text-2xl font-bold text-slate-900">{formattedPrice}</p>
                    </div>
                    <button
                      onClick={handleAddToCart}
                      disabled={product.stock_visible === false}
                      className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white transition-colors shadow-lg ${product.stock_visible === false ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'}`}
                    >
                      <ShoppingCart size={18} />
                      {product.stock_visible === false ? 'Agotado' : 'Agregar al Carrito'}
                    </button>
                  </div>
                )}
              </div>

              {/* Right Side: Options (Only for contact lenses) */}
              {isLenteContacto && (
                <div className="w-full md:w-1/2 bg-white p-8 flex flex-col">
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{formattedPrice}</h3>
                    {formattedOriginalPrice && (
                      <p className="text-sm text-slate-500 line-through">{formattedOriginalPrice}</p>
                    )}
                  </div>

                  <div className="flex-grow space-y-5">
                    {isAstigmatismo ? (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Selecciona valor esférico *</label>
                          <select 
                            value={esferico} 
                            onChange={(e) => setEsferico(e.target.value)}
                            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Elegir</option>
                            {astigEsf.map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Selecciona valor cilíndrico *</label>
                          <select 
                            value={cilindrico} 
                            onChange={(e) => setCilindrico(e.target.value)}
                            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Elegir</option>
                            {astigCil.map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Selecciona eje *</label>
                          <select 
                            value={eje} 
                            onChange={(e) => setEje(e.target.value)}
                            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Elegir</option>
                            {ejes.map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Si no sabes bien la graduación de tu receta contáctanos! (opcional)
                          </label>
                          <textarea 
                            value={mensaje}
                            onChange={(e) => setMensaje(e.target.value)}
                            maxLength={500}
                            rows={3}
                            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Escribe tu mensaje aquí..."
                          />
                          <p className="text-right text-xs text-slate-400 mt-1">{mensaje.length}/500</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Graduaciones *</label>
                          <select 
                            value={graduacion} 
                            onChange={(e) => setGraduacion(e.target.value)}
                            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Elegir</option>
                            {normalEsf.map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <button
                      onClick={handleAddToCart}
                      className="w-full flex justify-center items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all"
                    >
                      <ShoppingCart size={18} />
                      Agregar al carrito
                    </button>
                    <p className="text-center text-xs text-slate-500 mt-3">
                      Podrás enviar el pedido por WhatsApp desde el carrito para confirmar el stock y graduación.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

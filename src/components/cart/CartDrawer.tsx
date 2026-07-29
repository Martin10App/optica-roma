'use client';

import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const formattedTotal = new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    minimumFractionDigits: 0,
  }).format(cartTotal);

  const handleWhatsAppCheckout = () => {
    const phoneNumber = "598098871673";
    let message = "¡Hola! Quisiera pedir un presupuesto por los siguientes artículos que vi en la web:%0A%0A";
    items.forEach(item => {
      let itemName = `${item.cantidad}x ${item.marca} ${item.modelo}`;
      if (item.opciones) {
        itemName += ` (${item.opciones})`;
      }
      message += `- ${itemName} (${new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', minimumFractionDigits: 0 }).format(item.precio)})%0A`;
    });
    message += `%0A*Total aproximado:* ${formattedTotal}`;
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleQrPaymentWhatsApp = () => {
    const phoneNumber = "598098871673";
    let message = "¡Hola! Pagué mi pedido escaneando el código QR de Mercado Pago. Te adjunto la captura del pago.%0A%0A*Mi pedido:*%0A";
    items.forEach(item => {
      let itemName = `${item.cantidad}x ${item.marca} ${item.modelo}`;
      if (item.opciones) {
        itemName += ` (${item.opciones})`;
      }
      message += `- ${itemName} (${new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', minimumFractionDigits: 0 }).format(item.precio)})%0A`;
    });
    message += `%0A*Total:* ${formattedTotal}`;
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-50 transition-opacity backdrop-blur-sm"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[420px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l border-slate-200 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="text-blue-700" size={22} />
            Tu Carrito
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-slate-400">
              <ShoppingBag size={56} className="text-slate-200" />
              <p className="text-lg font-medium text-slate-500">Tu carrito está vacío</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-blue-700 hover:text-blue-800 font-medium hover:underline"
              >
                Volver al catálogo
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="relative w-20 h-20 bg-white rounded-lg overflow-hidden border border-slate-100 flex-shrink-0">
                    <Image
                      src={item.imagen_url || '/promoxplus.png'}
                      alt={`${item.marca} ${item.modelo}`}
                      fill
                      // Mismas fotos del catalogo: ya vienen optimizadas del
                      // disco, no se transforman en Vercel. Ver ProductCard.
                      unoptimized
                      sizes="80px"
                      className="object-contain p-2"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{item.modelo}</h3>
                    <p className="text-sm text-slate-500">{item.marca}</p>
                    {item.opciones && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.opciones}</p>
                    )}
                    <p className="font-semibold text-blue-700 mt-1">
                      {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', minimumFractionDigits: 0 }).format(item.precio)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <button 
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                      aria-label="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.cantidad - 1)}
                        className="text-slate-500 hover:text-blue-700 transition-colors p-1"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-4 text-center font-medium text-sm text-slate-900">{item.cantidad}</span>
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.cantidad + 1)}
                        className="text-slate-500 hover:text-blue-700 transition-colors p-1"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-slate-100 p-6 bg-white">
            <div className="flex justify-between items-center mb-5">
              <span className="text-slate-500 font-medium">Subtotal</span>
              <span className="text-2xl font-bold text-slate-900">{formattedTotal}</span>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="w-full bg-[#009ee3] hover:bg-[#0089c6] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 text-base flex items-center justify-center gap-2"
              >
                Pagar con QR de Mercado Pago
              </button>
              <button
                onClick={handleWhatsAppCheckout}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-600/20 transition-all hover:-translate-y-0.5 text-base flex items-center justify-center gap-2"
              >
                Consultar por WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>

      {/* QR de Mercado Pago */}
      {isQrModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setIsQrModalOpen(false)}
        >
          <div
            className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-fade-in-up text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1 mt-2">Pagá con QR de Mercado Pago</h3>
            <p className="text-sm text-slate-500 mb-4">
              Escaneá el código con la app de Mercado Pago, pagá el monto total y luego enviános la captura del pago por WhatsApp.
            </p>

            <div className="relative w-full aspect-[3/4] max-w-[220px] mx-auto rounded-xl overflow-hidden border border-slate-200 mb-4 bg-slate-50">
              <Image
                src="/media/qr-mercadopago.jpg"
                alt="Código QR de Mercado Pago - Óptica Roma"
                fill
                className="object-contain"
              />
            </div>

            <p className="text-sm font-semibold text-slate-900 mb-4">
              Total a pagar: {formattedTotal}
            </p>

            <button
              onClick={handleQrPaymentWhatsApp}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-600/20 transition-all hover:-translate-y-0.5"
            >
              Enviar comprobante por WhatsApp
            </button>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, Suspense } from 'react';
import { useCart } from '@/context/CartContext';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const { clearCart } = useCart();

  useEffect(() => {
    // Si llegamos a esta página y el pago está aprobado, limpiamos el carrito
    if (status === 'approved') {
      clearCart();
    }
  }, [status, clearCart]);

  const handleNotifyWhatsApp = () => {
    const phoneNumber = "598098871673";
    const message = `¡Hola! Acabo de realizar una compra por Mercado Pago.%0A%0A*Pedido N°:* ${orderId}%0A*Referencia de pago:* ${paymentId}%0A%0ATe escribo para coordinar la entrega/retiro.`;
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pago exitoso!</h1>
        <p className="text-gray-600 mb-8">
          Tu compra se ha procesado correctamente. El número de pedido es <strong>#{orderId}</strong>.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleNotifyWhatsApp}
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5"
          >
            <MessageCircle size={22} />
            Notificar por WhatsApp
          </button>
          
          <Link
            href="/"
            className="w-full block bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3.5 px-4 rounded-xl transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <SuccessContent />
    </Suspense>
  );
}

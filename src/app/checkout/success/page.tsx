'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle2, MessageCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useCart } from '@/context/CartContext';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const fallbackPaymentId = searchParams.get('payment_id');
  
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(fallbackPaymentId);
  const [loading, setLoading] = useState(true);
  
  const { clearCart } = useCart();

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    let interval: ReturnType<typeof setInterval>;
    let isTerminal = false;

    const fetchStatus = async () => {
      if (isTerminal) return;
      try {
        const res = await fetch(`/api/pedidos/estado?orderId=${orderId}`);
        const data = await res.json();
        
        if (data.success) {
          setOrderStatus(data.estado);
          if (data.pago_id) {
            setPaymentId(data.pago_id);
          }
          
          if (data.estado === 'pagado' || data.estado === 'rechazado') {
            isTerminal = true;
            if (interval) clearInterval(interval);
            if (data.estado === 'pagado') {
              clearCart();
            }
          }
        } else {
          setOrderStatus('error');
        }
      } catch (error) {
        setOrderStatus('error');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    // Consultar periódicamente cada 5 segundos hasta llegar a un estado terminal
    interval = setInterval(fetchStatus, 5000);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orderId, clearCart]);

  const handleNotifyWhatsApp = () => {
    const phoneNumber = "598098871673";
    const message = `¡Hola! Acabo de realizar una compra por Mercado Pago.%0A%0A*Pedido N°:* ${orderId}%0A*Referencia de pago:* ${paymentId || 'Pendiente'}%0A%0ATe escribo para coordinar la entrega/retiro.`;
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-500" />
          <p>Verificando estado del pago...</p>
        </div>
      </div>
    );
  }

  let icon = <CheckCircle2 size={40} />;
  let iconBg = "bg-green-100 text-green-500";
  let title = "¡Pago exitoso!";
  let description = `Tu compra se ha procesado correctamente. El número de pedido es `;

  if (orderStatus === 'pendiente') {
    icon = <Clock size={40} />;
    iconBg = "bg-yellow-100 text-yellow-500";
    title = "Pago pendiente";
    description = `Estamos esperando la confirmación de tu pago. El número de pedido es `;
  } else if (orderStatus === 'rechazado') {
    icon = <XCircle size={40} />;
    iconBg = "bg-red-100 text-red-500";
    title = "Pago rechazado";
    description = `Hubo un problema con tu pago. Por favor intenta de nuevo. El número de pedido es `;
  } else if (orderStatus === 'error') {
    icon = <XCircle size={40} />;
    iconBg = "bg-gray-100 text-gray-500";
    title = "Error de verificación";
    description = `No pudimos verificar el estado de tu pedido. El número de pedido es `;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${iconBg}`}>
          {icon}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-8">
          {description} <strong>#{orderId}</strong>.
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

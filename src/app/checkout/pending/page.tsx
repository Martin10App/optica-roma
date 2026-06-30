import Link from 'next/link';
import { Clock } from 'lucide-react';

export default function CheckoutPendingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock size={40} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago pendiente</h1>
        <p className="text-gray-600 mb-8">
          Tu pago está en proceso. Te avisaremos cuando se confirme. ¡Gracias por tu compra!
        </p>

        <Link
          href="/"
          className="w-full block bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3.5 px-4 rounded-xl transition-colors"
        >
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}

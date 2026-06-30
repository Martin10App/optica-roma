import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function CheckoutFailurePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago rechazado</h1>
        <p className="text-gray-600 mb-8">
          Tuvimos un problema procesando tu pago. Por favor, intenta nuevamente o contáctanos por WhatsApp si el problema persiste.
        </p>

        <Link
          href="/"
          className="w-full block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-colors"
        >
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}

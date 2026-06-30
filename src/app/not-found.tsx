import Link from 'next/link';
import { Search, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center max-w-md px-4">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search size={36} className="text-blue-700" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-3">404</h1>
        <p className="text-lg text-slate-600 mb-2">Página no encontrada</p>
        <p className="text-slate-500 mb-8">
          La página que buscás no existe o fue movida. Volvé al inicio para seguir navegando.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-700 text-white font-semibold hover:bg-blue-800 transition-colors"
        >
          <Home size={18} />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

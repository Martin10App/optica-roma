'use client';

import { AlertTriangle } from 'lucide-react';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#050a14] px-4 text-center">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="text-red-500" size={30} aria-hidden="true" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">¡Ups! Algo salió mal.</h2>
      <p className="text-slate-400 max-w-md mb-8">
        Tuvimos un pequeño problema técnico al cargar esta página. Por favor, intentá de nuevo.
      </p>
      <button
        onClick={() => reset()}
        className="px-8 py-3 rounded-full font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
      >
        Intentar nuevamente
      </button>
    </div>
  );
}

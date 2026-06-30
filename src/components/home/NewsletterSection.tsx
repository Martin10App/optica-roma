'use client';

import { useState } from 'react';
import { Send, Gift } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setStatus('error');
      return;
    }
    // Por ahora, enviar a WhatsApp con el email (hasta tener backend de newsletter)
    const message = `Hola! Me quiero suscribir al newsletter de Óptica Roma. Mi email es: ${email}`;
    window.open(`https://wa.me/598098871673?text=${encodeURIComponent(message)}`, '_blank');
    setStatus('success');
    setEmail('');
  };

  return (
    <section className="py-16 bg-blue-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Gift size={28} className="text-orange-400" />
          <span className="text-orange-400 font-bold text-sm uppercase tracking-wider">Beneficio exclusivo</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">
          Suscribite y obtené un -10% en tu primera compra
        </h2>
        <p className="text-blue-100 mb-8 max-w-xl mx-auto">
          Recibí las últimas promociones, novedades de armazones y consejos de salud visual directamente en tu email.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
            placeholder="tu@email.com"
            className="flex-1 px-4 py-3 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 border-0"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Send size={16} />
            Suscribirme
          </button>
        </form>

        {status === 'success' && (
          <p className="mt-4 text-sm text-blue-200">
            ¡Gracias! Te contactaremos por WhatsApp con tu beneficio.
          </p>
        )}
        {status === 'error' && (
          <p className="mt-4 text-sm text-orange-300">
            Por favor ingresá un email válido.
          </p>
        )}

        <p className="mt-4 text-xs text-blue-300">
          No compartimos tu email con terceros. Podés darte de baja en cualquier momento.
        </p>
      </div>
    </section>
  );
}

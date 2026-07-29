import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* Back button overlay */}
      <div className="absolute top-24 left-4 sm:left-8 z-40">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-800 transition-colors bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full shadow-md border border-slate-200 hover:shadow-lg hover:-translate-y-0.5 transform duration-200"
        >
          <ArrowLeft size={18} />
          Volver al Inicio
        </Link>
      </div>
      {children}
    </div>
  );
}

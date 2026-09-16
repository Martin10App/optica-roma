'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ShoppingBag, User as UserIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import { WHATSAPP_AGENDAR } from '@/lib/constants';

const navegacion = [
  { name: 'Catálogo', href: '/#catalogo' },
  { name: 'Promociones', href: '/#promociones' },
  { name: 'Cristales', href: '/#cristales' },
  { name: 'Salud visual', href: '/#chequeo' },
  { name: 'Nosotros', href: '/#nosotros' },
  { name: 'Contacto', href: '/#contacto' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [conScroll, setConScroll] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const sensor = useRef<HTMLDivElement>(null);

  // La línea de abajo del encabezado aparece cuando la página ya bajó: un
  // sensor de 1 px a 60 px del borde, en vez de escuchar cada evento de scroll.
  useEffect(() => {
    if (!sensor.current) return;
    const observador = new IntersectionObserver(([entrada]) => setConScroll(!entrada.isIntersecting));
    observador.observe(sensor.current);
    return () => observador.disconnect();
  }, []);

  // Foco atrapado dentro del menú del celular
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isMenuOpen) return;
      if (e.key === 'Escape') setIsMenuOpen(false);
      if (e.key === 'Tab' && menuRef.current) {
        const focusable = menuRef.current.querySelectorAll<HTMLElement>('a[href], button, textarea, input, select');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    if (isMenuOpen) {
      setTimeout(() => menuRef.current?.querySelector('button')?.focus(), 50);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const botonIcono =
    'grid h-10 w-10 place-items-center rounded-full text-tinta transition-colors hover:bg-papel';

  return (
    <>
      <div ref={sensor} aria-hidden className="pointer-events-none absolute left-0 top-[60px] h-px w-px" />

      <header
        className={`fixed inset-x-0 top-0 z-50 border-b bg-white/92 backdrop-blur-md transition-colors duration-200 ${
          conScroll ? 'border-linea' : 'border-transparent'
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="shrink-0" aria-label="Óptica Roma, inicio">
            <Image
              src="/media/logooptica.png"
              alt="Óptica Roma"
              width={180}
              height={53}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-7 xl:flex">
            {navegacion.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-[15px] font-medium text-tinta/75 transition-colors hover:text-tinta"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <a
              href={WHATSAPP_AGENDAR}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta mr-2 hidden !min-h-10 !px-5 lg:inline-flex"
            >
              Agendá tu revisión
            </a>

            {user ? (
              <Link
                href={user.rol === 'admin' ? '/admin' : '/perfil'}
                className="flex h-10 items-center gap-2 rounded-full px-3 text-[15px] font-medium text-tinta transition-colors hover:bg-papel"
              >
                <UserIcon size={20} strokeWidth={1.75} aria-hidden />
                <span className="hidden sm:inline">{user.nombre.split(' ')[0]}</span>
              </Link>
            ) : (
              <button type="button" onClick={() => setIsAuthModalOpen(true)} className={botonIcono} aria-label="Mi cuenta">
                <UserIcon size={20} strokeWidth={1.75} aria-hidden />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className={`relative ${botonIcono}`}
              aria-label={cartCount > 0 ? `Abrir carrito, ${cartCount} ${cartCount === 1 ? 'producto' : 'productos'}` : 'Abrir carrito'}
            >
              <ShoppingBag size={20} strokeWidth={1.75} aria-hidden />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-cobalto px-1 text-[11px] font-semibold tabular-nums text-white">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              className={`xl:hidden ${botonIcono}`}
              onClick={() => setIsMenuOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu size={22} strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[100]">
          <div className="animate-fade-in absolute inset-0 bg-tinta/40" onClick={() => setIsMenuOpen(false)} />
          <div
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            className="mobile-menu-enter absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white px-6 pb-8 pt-5"
          >
            <div className="flex items-center justify-between">
              <Image src="/media/logooptica.png" alt="Óptica Roma" width={140} height={41} className="h-8 w-auto object-contain" />
              <button type="button" onClick={() => setIsMenuOpen(false)} className={botonIcono} aria-label="Cerrar menú">
                <X size={22} aria-hidden />
              </button>
            </div>

            <nav aria-label="Principal" className="mt-10 flex flex-1 flex-col">
              {navegacion.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="border-b border-linea py-4 text-xl font-medium text-tinta"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <a
              href={WHATSAPP_AGENDAR}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMenuOpen(false)}
              className="btn-cta w-full"
            >
              Agendá tu revisión
            </a>
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}

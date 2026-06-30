'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ShoppingBag, Phone } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import { User as UserIcon } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  // Focus trap for mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isMenuOpen) return;
      if (e.key === 'Escape') setIsMenuOpen(false);
      if (e.key === 'Tab' && menuRef.current) {
        const focusable = menuRef.current.querySelectorAll<HTMLElement>(
          'a[href], button, textarea, input, select'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
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
    const handler = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const navigation = [
    { name: 'Inicio', href: '/' },
    { name: 'Salud Visual', href: '/#chequeo' },
    { name: 'Catálogo', href: '/#catalogo' },
    { name: 'Promociones', href: '/#promociones' },
    { name: 'Cristales', href: '/#cristales' },
    { name: 'Nosotros', href: '/#nosotros' },
    { name: 'Contacto', href: '/#contacto' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200 py-3'
            : 'bg-white/80 backdrop-blur-sm py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <Image
                src="/media/logooptica.png"
                alt="Óptica Roma"
                width={180}
                height={55}
                className="object-contain h-10 w-auto transition-opacity group-hover:opacity-90"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200 group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-blue-700 rounded-full group-hover:w-3/4 transition-all duration-200 ease-out" />
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* CTA Principal: Agendá cita */}
              <a
                href="https://wa.me/598098871673?text=Hola!%20Quiero%20agendarme%20para%20una%20revisión%20visual%20gratuita."
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-all shadow-sm hover:shadow-md"
              >
                <Phone size={16} />
                Agendá tu cita
              </a>

              {/* Auth / Mi cuenta */}
              {user ? (
                <Link
                  href={user.rol === 'admin' ? '/admin' : '/perfil'}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all text-sm font-medium"
                >
                  <UserIcon size={20} />
                  <span className="hidden sm:inline">{user.nombre.split(' ')[0]}</span>
                </Link>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all text-sm font-medium"
                >
                  <UserIcon size={20} />
                  <span className="hidden sm:inline">Mi cuenta</span>
                </button>
              )}

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
                aria-label="Abrir carrito"
              >
                <ShoppingBag size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-blue-700 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Hamburger */}
              <button
                type="button"
                className="xl:hidden p-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                onClick={() => setIsMenuOpen(true)}
                aria-label="Abrir menú"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100]">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <div
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación principal"
            className="absolute right-0 top-0 bottom-0 w-full max-w-xs bg-white border-l border-slate-200 shadow-2xl mobile-menu-enter flex flex-col p-8 pt-16"
          >
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              <X size={24} />
            </button>

            <Image
              src="/media/logooptica.png"
              alt="Óptica Roma"
              width={140}
              height={40}
              className="h-8 w-auto object-contain mb-10"
            />

            <nav className="flex flex-col gap-1 flex-1">
              {navigation.map((item, i) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  style={{ animationDelay: `${i * 40}ms` }}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium text-lg transition-all animate-fade-in"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <a
              href="https://wa.me/598098871673?text=Hola!%20Quiero%20agendarme%20para%20una%20revisión%20visual%20gratuita."
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMenuOpen(false)}
              className="mt-6 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
            >
              <Phone size={18} />
              Agendá tu cita gratis
            </a>
          </div>
        </div>
      )}
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
}

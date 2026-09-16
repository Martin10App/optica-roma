'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const SELECTOR = '[data-aparecer], .reveal, .reveal-left, .reveal-right, .reveal-scale';

// Las secciones aparecen suavemente al llegar a ellas.
//
// Dos cuidados:
// - Nada arranca oculto desde el CSS (la versión anterior dejaba la página en
//   blanco hasta que corría JavaScript). Solo se prepara lo que todavía está
//   debajo de la pantalla cuando este código ya corre.
// - No se agregan clases ni atributos: se usa la API de animaciones del
//   navegador. Tocar las clases antes de que React terminara de conectar una
//   sección generaba avisos de "hydration" y React podía borrarlas.
export default function AnimacionesScroll() {
  const ruta = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof Element.prototype.animate !== 'function') return;

    const vistos = new WeakSet<Element>();
    const pendientes = new Map<Element, Animation>();

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          const animacion = pendientes.get(entrada.target);
          observador.unobserve(entrada.target);
          if (!animacion) continue;
          pendientes.delete(entrada.target);
          animacion.play();
          // al terminar se quita el efecto: el elemento queda con sus estilos normales
          animacion.finished.then(() => animacion.cancel()).catch(() => {});
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );

    const preparar = () => {
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (vistos.has(el)) return;
        vistos.add(el);
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return; // ya se ve: no tocar
        const animacion = el.animate(
          [
            { opacity: 0, transform: 'translateY(28px)' },
            { opacity: 1, transform: 'none' },
          ],
          {
            duration: 800,
            delay: Number(el.dataset.aparecerRetraso) || 0,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'both',
          }
        );
        animacion.pause();
        pendientes.set(el, animacion);
        observador.observe(el);
      });
    };

    preparar();

    // Secciones que se dibujan después (las que esperan los datos del catálogo)
    let espera: ReturnType<typeof setTimeout> | undefined;
    const vigilante = new MutationObserver(() => {
      clearTimeout(espera);
      espera = setTimeout(preparar, 60);
    });
    vigilante.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(espera);
      vigilante.disconnect();
      observador.disconnect();
      pendientes.forEach((animacion) => animacion.cancel());
    };
  }, [ruta]);

  return null;
}
